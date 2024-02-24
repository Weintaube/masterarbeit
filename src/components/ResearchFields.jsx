import { useEffect , useState} from "react";
import store from './storing';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



function ResearchFields(){

    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [researchFieldsCount, setResearchFieldsCount] = useState([]);
    const [minPapers, setMinPapers] = useState(100);
    const [maxPapers, setMaxPapers] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [chartData, setChartData] = useState(
        {
            labels: researchFieldsCount.map((item) => item.research_field),
            datasets: [{
                label: "Number of papers in research field",
                data: researchFieldsCount.map((item) => item.paper_count), 
                backgroundColor: 'rgba(53, 162, 235, 0.5)', 
                borderColor: 'rgba(0,0,0,1)', 
                borderWidth: 2
            }]
        }
    );

    const fetchSPARQLData = async()=>{
        try{
            const query = encodeURIComponent(`
            ${prefixes}  
            SELECT ?research_field (COUNT(DISTINCT ?paper) as ?count)
            WHERE {
                ?paper a orkgc:Paper.
                OPTIONAL {
                    ?paper orkgp:P30 ?field.
                    ?field rdfs:label ?research_field.
                }
            }
            GROUP BY ?research_field
            ORDER BY DESC(?count) 
            `);
        
            const url = `http://localhost:5000/sparql?url=${sparqlendpointURL}&query=${query}`;
            const response = await fetch(url);
            console.log(response);

            if(response.ok){
                const result = await response.json();
                console.log("research fields", result);
                const fieldsResult = result.results.bindings.map(element => ({
                    research_field: element.research_field?.value || "No name",
                    paper_count: element.count.value
                  }));
                console.log("research fields end result", fieldsResult);

                //const filteredData = fieldsResult.filter((item) => item.paper_count >= minPapers); //apply filter for first rendering
                const filteredData = fieldsResult.filter((item) => item.paper_count >= minPapers);
                
                setResearchFieldsCount(fieldsResult);

                // Set all data initially
                /*setChartData({
                    labels: filteredData.map((item) => item.research_field),
                    datasets: [{
                        label: "Number of papers in research field",
                        data: filteredData.map((item) => item.paper_count),
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        borderColor: 'rgba(0,0,0,1)',
                        borderWidth: 2
                    }]
                });*/
            }else{
                const errorData = await response.json();
                console.error("Error while requesting SPARQL data:", errorData);
                throw new Error("Error while requesting SPARQL data.");
            }


        }catch(error){
            console.log(error);
        }
    }


    useEffect(()=>{
        fetchSPARQLData();
    },[])

    useEffect(()=>{
        setChartData({
            labels: researchFieldsCount.map((item) => item.research_field),
            datasets: [{
                label: "Number of papers in research field",
                data: researchFieldsCount.map((item) => item.paper_count), 
                backgroundColor: 'rgba(53, 162, 235, 0.5)', 
                borderColor: 'rgba(0,0,0,1)', 
                borderWidth: 2
            }]
        });
    }, [researchFieldsCount]);

    const filterData = () => {
        const filteredData = researchFieldsCount.filter((item) => {
            const paperCount = item.paper_count;
            const matchesSearchTerm = item.research_field.toLowerCase().includes(searchTerm.toLowerCase());
            const minPapersValue = minPapers ? parseInt(minPapers, 10) : 0;  // Convert to number, default to 0
            const maxPapersValue = maxPapers ? parseInt(maxPapers, 10) : Number.MAX_SAFE_INTEGER;  // Convert to number, default to max safe integer
    
            return paperCount >= minPapersValue && paperCount <= maxPapersValue && matchesSearchTerm;
        });
    
        return filteredData;
    }
    
    const handleFilterChange = () => {
        const filteredData = filterData();
        setChartData({
            labels: filteredData.map((item) => item.research_field),
            datasets: [{
                label: "Number of papers in research field",
                data: filteredData.map((item) => item.paper_count),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 2
            }]
        });
    }

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    }

    const handleDropdownItemClick = (selectedItem) => {
        setSearchTerm(selectedItem);
      };   
      
    useEffect(()=>{
        handleFilterChange();
    },[searchTerm]);

    const options = {
        indexAxis: 'x', // Set y-axis for research fields
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Papers',
            },
          },
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Research Fields',
            },
          },
        },
      };


      //filter by first render from 100 to 5000
    return(
        <>
        <Card >
            <Card.Body >
                <Card.Title>Research Fields</Card.Title>
                <Row>
                    <p>Currently showing {chartData.labels
                        ? chartData.labels.length
                        : 0} of {researchFieldsCount.length} research fields.<br></br></p>
                </Row>
                <Row>
                <Col>
                    <Form.Label>Minimum number of papers:</Form.Label>
                    <Form.Control
                    value={minPapers}
                    onChange={(e) => setMinPapers(e.target.value)}
                    onBlur={handleFilterChange}
                    />
                </Col>
                <Col>
                    <Form.Label>Maximum number of papers:</Form.Label>
                    <Form.Control
                    value={maxPapers}
                    onChange={(e) => setMaxPapers(e.target.value)}
                    onBlur={handleFilterChange}
                    placeholder={`maximum of ${researchFieldsCount[0] ? researchFieldsCount[0].paper_count: 0} papers in field`}
                    />
                </Col>
                </Row>

                <Row>
                    <Col>
                        <Form.Label>Search:</Form.Label>
                        <DropdownButton id="dropdown-basic-button" title="All Research Fields">
                            <Dropdown.Menu
                                style={{
                                    maxHeight: '200px', // specify the max height
                                    width: '300px',    // specify the width
                                    overflowY: 'auto',  // make it scrollable
                                  }}
                            >
                            {researchFieldsCount.map((item, index) => (
                                <Dropdown.Item key={index} onClick={() => handleDropdownItemClick(item.research_field)}>{item.research_field} </Dropdown.Item>
                            ))}
                            </Dropdown.Menu>
                        </DropdownButton>
                        <Form.Control
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        </Col>
                    <Col>
                        
                    </Col>
                </Row>
                    

                <Bar options={options} data={chartData}/>

            </Card.Body>
        </Card>  
        </>
    );

}

export default ResearchFields;
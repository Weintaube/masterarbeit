import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { ListGroup, Row, Col, Form, Tab, Tabs} from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

import Plot from 'react-plotly.js';


function StatementsPaper(){

    const [dummyData, setDummyData] = useState([]);
    const [minStatements, setMinStatements] = useState();
    const [maxStatements, setMaxStatements] = useState(); 
    const [totalMaxStatements, setTotalMaxStatements] = useState();
    const [allPapersWithStatements, setAllPapersWithStatements] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [sortCriteria, setSortCriteria] = useState({ column: '', order: 'asc' }); 
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
          const result = await fetchAllPages();
          console.log("all papersw with statements", result);
          setAllPapersWithStatements(result);
          const maxStatements = result.reduce((max, paper) => Math.max(max, paper.count), 0);
          setTotalMaxStatements(maxStatements);
          setFilteredData(result);
          sortData(result);
        };
    
        fetchData();
    }, []);

    useEffect(() => {
        //generateDummyData();
        handleFilter();
    }, [minStatements, maxStatements]);

    useEffect(() =>{
        sortData(filteredData);
    }, [sortCriteria]);

    const fetchAllPages = async()=>{
        console.log("fetch all pages");
        let allResults = [];
        let currentPage = 0;
        let totalPages = 1; 

        while (currentPage < totalPages) {
            try {
                const response = await fetch(`https://incubating.orkg.org/api/papers/statement-counts/?page=${currentPage}&size=2500`);
      
                if (response.ok) {
                    const result = await response.json();
                    //console.log(result);
                    allResults = allResults.concat(result.content); // Füge die Ergebnisse der aktuellen Seite hinzu
                    totalPages = result.totalPages; // Aktualisiere die Anzahl der Seiten
                    currentPage++; // Gehe zur nächsten Seite
                } else {
                    console.error(`Fehler beim Abrufen der Seite ${currentPage}`);
                    break; 
                }
            } catch (error) {
                console.error(`Fehler beim Abrufen der Seite ${currentPage}: ${error}`);
                break; 
            }
        }
        console.log("all pages undoc", allResults);
        return allResults;
    }

    const fetchData = async()=>{
        try{
            const response = await fetch('https://incubating.orkg.org/api/papers/statement-counts'); //https://orkg.org/api/statements/R659268/bundle?maxLevel=2
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("Statements per paper", result);

            }else{
                console.log("Error while fetching comparisons.");
            }

        }catch(error){
            console.log(error);
        }
    }

    function normalDistribution(mean, stdDev, min) {
        let value = -1;

        // Ensure the generated value is at least 'min'
        while (value < min) {
            let u = 0, v = 0;
            while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
            while (v === 0) v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

            value = Math.round(mean + stdDev * z);
        }

        return value;
    }

    const generateDummyData = () => {
        const numPapers = 1000;
        const maxStatements = 100;

        const generatedData = Array.from({ length: numPapers }, (_, index) => {
            const title = `Paper ${index + 1}`;
            const createdAt = new Date().toISOString();
            const createdBy = `User${index + 1}`;
            //const statementCount = Math.floor(Math.random() * maxStatements) + 1; // Random statement count
            const statementCount = Math.round(normalDistribution(50, 20, 0));

            return {
                paper: { title, created_at: createdAt, created_by: createdBy },
                statement_count: statementCount
            };
        });

        setDummyData(generatedData);
    };

    const calculateAverageStatements = () => {
        const totalStatements = allPapersWithStatements.reduce((sum, paper) => sum + paper.count, 0);
        const averageStatements = allPapersWithStatements.length > 0 ? totalStatements / allPapersWithStatements.length : 0;
        return averageStatements.toFixed(2); 
    };

    const getTopAndBottomPapers = () => {
        const sortedData = [...allPapersWithStatements].sort(
            (a, b) => b.count - a.count
        );

        const top10 = sortedData.slice(0, 10);
        const bottom10 = sortedData.slice(-10);

        return { top10, bottom10};
    };

    const sortData = (data) => {
        console.log("sort data before", data);
        const sorted = [...data].sort((a, b) => {
            if (sortCriteria.order === 'asc') {
                return a.count - b.count;
            } else {
                return b.count - a.count
            }
        });
        console.log("sort data after", sorted);
        setSortedData(sorted);
    };
    
    const handleSort = (column) => {
        let sortedFilteredData = [...filteredData]; // Make a copy of the filtered data
        if (sortCriteria.column === column) {
            // Toggle sorting order
            sortedFilteredData.reverse();
            setSortCriteria({
                ...sortCriteria,
                order: sortCriteria.order === 'asc' ? 'desc' : 'asc'
            });
        } else {
            // Sort the filtered data based on the selected column
            sortedFilteredData.sort((a, b) => {
                if (column === 'count') {
                    return sortCriteria.order === 'asc' ? a.count - b.count : b.count - a.count;
                }
                // Add additional conditions for sorting based on other columns if needed
            });
            setSortCriteria({
                column,
                order: 'asc'
            });
        }
        setFilteredData(sortedFilteredData); // Update the filtered data with the sorted result
    };   
    
    const handleFilter = () => {
        const filtered = allPapersWithStatements.filter(paper => {
            return paper.count >= minStatements && paper.count <= maxStatements;
        });
        setFilteredData(filtered);
    };
    

    const countPapersWithAtLeastStatements = () => {
        const papersWithAtLeastStatements = allPapersWithStatements.filter(paper => paper.count >= 20);
        const percentage = (papersWithAtLeastStatements.length / allPapersWithStatements.length) * 100;
        return { absolute: papersWithAtLeastStatements.length, percentage: percentage.toFixed(2) };
    };

    const countDisplayedPapers = () =>{
        const displayedPapers = filteredData.length;
        const percentage = (displayedPapers.length / allPapersWithStatements.length) * 100;
        console.log("papers absolute", displayedPapers.length);
        return {absolute: displayedPapers.length, percentage: percentage.toFixed(2)};
    }

    const renderFilteredPaperList = (papers) => {
        return(
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Paper</th>
                        <th>Statements
                            <button onClick={() => handleSort('count')}>
                                {sortCriteria.column === 'count' ? (
                                    sortCriteria.order === 'asc' ? (
                                        <FontAwesomeIcon icon={faArrowUp} />
                                    ) : (
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    )
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faArrowUp} />
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    </>
                                )}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {papers.map((item, index) => (
                    <tr key={index}>
                        <td><a href={`https://incubating.orkg.org/paper/${item.id}`} target="_blank" rel="noopener noreferrer">{item.title?item.title:item.id}</a></td>
                        <td>{item.count}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>
        )
    }
    
    const renderPaperList = (papers) => {
        console.log("paper", papers);
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Paper</th>
                        <th>Statements</th>
                    </tr>
                </thead>
                <tbody>
                    {papers.map((item, index) => (
                    <tr key={index}>
                        <td><a href={`https://incubating.orkg.org/paper/${item.id}`} target="_blank" rel="noopener noreferrer">{item.title?item.title:item.id}</a></td>
                        <td>{item.count}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    const { top10, bottom10} = getTopAndBottomPapers();

    const boxPlotData = generateBoxPlotData(allPapersWithStatements);

    function generateBoxPlotData(data) {
        const values = data.map((paper) => paper.count);
    
        // Calculate the quartiles
        const quartiles = calculateQuartiles(values);
    
        // Calculate the interquartile range (IQR)
        const IQR = quartiles.upper - quartiles.lower;
    
        // Calculate the fences
        const lowerFence = quartiles.lower - 1.5 * IQR;
        const upperFence = quartiles.upper + 1.5 * IQR;
    
        return [{
            x: values,
            type: 'box',
            boxpoints: 'outliers', 
            jitter: 0.3,
            pointpos: -1.8,
            marker: { color: 'rgba(75, 192, 192, 0.8)' },
            orientation: 'h',
            hoverinfo: 'x',
            name: '',
            // Set the lower and upper fences
            lowerfence: lowerFence,
            upperfence: upperFence
        }];
    }
    
    function generateBoxPlotData(data) {
        const values = data.map((paper) => paper.count);
    
        return [{
            x: values, // Switched x and y for the box trace
            type: 'box',
            boxpoints: 'outliers', //all
            jitter: 0.3,
            pointpos: -1.8,
            marker: { color: 'rgba(75, 192, 192, 0.8)' },
            orientation: 'h',
            hoverinfo: 'x',
            name: '',
        }];
    }  
    
    const xAxisRange = [0, 1500];   
    
    return(
        <>
        <Card>
            <Card.Body>
                <Card.Title>Statements per Paper</Card.Title>
                <Tabs 
                    defaultActiveKey="overview"
                    id="uncontrolled-tab-example"
                    className="mb-3">
                    <Tab eventKey="overview" title="Overview">
                        <Row>
                            <p>Average number of statements per Paper: <span style={{ fontSize: '1.5em' }}>{calculateAverageStatements()}</span></p>
                        </Row>
                        <Row>
                            <p><span style={{ fontSize: '1.5em' }}>{countPapersWithAtLeastStatements().percentage}%</span> ({countPapersWithAtLeastStatements().absolute}) Papers have at least 20 statements.</p>
                        </Row>

                        <p>Distribution of statements</p>
                        {/*box plot here*/}
                        <Plot
                            data={boxPlotData}
                            layout={{
                                xaxis: {
                                    title: "Number of statements",
                                    titlefont: { color: 'white' }, 
                                    tickfont: { color: 'white' },
                                    range: xAxisRange
                                },
                                yaxis: {
                                    title: "Papers",
                                    titlefont: { color: 'white' }, 
                                    tickfont: { color: 'white' },
                                },
                                paper_bgcolor: 'rgba(0, 0, 0, 0.7)',
                                plot_bgcolor: 'rgba(0, 0, 0, 0.7)'
                            }}
                        />



                    </Tab>

                    <Tab eventKey="topbottom" title="Top/Bottom Papers">
                        <Row>
                            <Col>
                                Top 10 Papers with most statements:
                                {renderPaperList(top10)}
                            </Col>
                            <Col>
                                Bottom 10 Papers with least statements:
                                {renderPaperList(bottom10)}
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="filter" title="Filter Papers">
                        <p>Showing {countDisplayedPapers().percentage}% ({countDisplayedPapers().absolute}) Papers.</p>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Minimum number of statements:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={minStatements}
                                        onChange={(e) => setMinStatements(parseInt(e.target.value))}
                                    />
                                </Form.Group>                    
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Maximum number of statements:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={maxStatements}
                                        onChange={(e) => setMaxStatements(parseInt(e.target.value))}
                                        placeholder={`maximum of ${totalMaxStatements} statements`}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <div className="paperlist listgroupcursor">
                                    <div className="table-container">
                                        {renderFilteredPaperList(filteredData)}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Tab>

                </Tabs>
            </Card.Body>
        </Card>
        </>
    );

}

export default StatementsPaper;
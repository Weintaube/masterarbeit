import { useEffect , useState} from "react";
import store from './storing';
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



function ResearchFields(){

    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [researchFieldsCount, setResearchFieldsCount] = useState([]);
    const [chartData, setChartData] = useState(
        {
            labels: researchFieldsCount.slice(0, 20).map((item) => item.research_field),
            datasets: [{
                label: "Number of papers in research field",
                data: researchFieldsCount.slice(0, 20).map((item) => item.paper_count), 
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
                setResearchFieldsCount(fieldsResult);
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
    })

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

    return(
        <>
        <Bar data={{
            labels: researchFieldsCount.slice(0, 20).map((item) => item.research_field),
            datasets: [{
                label: "Number of papers in research field",
                data: researchFieldsCount.slice(0, 20).map((item) => item.paper_count), 
                backgroundColor: 'rgba(53, 162, 235, 0.5)', 
                borderColor: 'rgba(0,0,0,1)', 
                borderWidth: 2
            }]
        }}/>
        </>
    );

}

export default ResearchFields;
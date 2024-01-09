import { useEffect , useState} from "react";
import store from './storing';


function ResearchFields(){

    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [researchFieldsCount, setResearchFieldsCount, ] = useState([]);
    const [chartData, setChartData] = useState([]);

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
            //const url2 = `https://orkg.org/triplestore?query=`+query;  
            const response = await fetch(url);
            //const response = await fetch('https://orkg.org/api/statements/');
            //const response = await fetch('https://wikidata.org/w/rest.php/wikibase/v0/entities/properties');
            console.log(response);

            if(response.ok){
                const result = await response.json();
                console.log("research fields", result);
                const fieldsResult = [];
                result.results.bindings.forEach(element=>{
                    let newElement = {};
                    if(element.research_field){
                        newElement = {research_field: element.research_field.value, paper_count: element.count.value};
                    }else{
                        newElement = {research_field: "No name", paper_count: element.count.value};
                    }
                    fieldsResult.push(newElement);
                })
                console.log("research fields end result", fieldsResult);
                setResearchFieldsCount(fieldsResult);
            }else{
                throw new Error("Error while requesting SPARQL data.")
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
                label: "Research Fields count",
                data: researchFieldsCount.map((item) => item.paper_count), 
                backgroundColor: 'rgba(53, 162, 235, 0.5)', 
                borderColor: 'rgba(0,0,0,1)', // Farbe anpassen
                borderWidth: 2
            }]
        });
    }, [researchFieldsCount]);


    return(
        <>
        </>
    );

}

export default ResearchFields;
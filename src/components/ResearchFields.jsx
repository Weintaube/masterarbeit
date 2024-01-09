import { useEffect } from "react";
import store from './storing';


function ResearchFields(){


    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");
    const [prefixes, , ] = store.useState("endpointPrefixes");

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


    return(
        <>
        </>
    );

}

export default ResearchFields;
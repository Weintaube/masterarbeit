
import { useEffect } from 'react';
import StatePool from 'state-pool';
import store from '../storing';


function NumberEntities(){

    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");    
    const [endpointLabel, , ] = store.useState("endpointLabel");    
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const dbpediaQuery = encodeURIComponent(`
        ${prefixes}  
        SELECT ?type (COUNT(?entity) as ?count)
        WHERE {
        ?entity rdf:type ?type.
        FILTER(isURI(?type))
        }
        GROUP BY ?type
        ORDER BY DESC(?count)
    `);

    const wikidataQuery = encodeURIComponent(`
        ${prefixes}  
        SELECT ?entityTypeLabel (COUNT(?item) as ?count)
        WHERE {
        ?item wdt:P31 ?entityType.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        GROUP BY ?entityTypeLabel
        ORDER BY DESC(?count)
    `);

    const fetchSPARQLData = async () => {
        try {
            let query = null;
            if(endpointLabel === "DBpedia"){ //change query according to endpoint
                query = dbpediaQuery;
            }else if(endpointLabel == "Wikidata"){
                query = wikidataQuery;
            }
            const url = `http://localhost:5000/sparql?url=${sparqlendpointURL}&query=${query}`;
            const response = await fetch(url);
        if(response.ok){ //Anfrage erfolgreich Statuscode 200
            console.log("Response (OK)",  response)
            const result = await response.json();
            console.log("Endpoint number entities", result);
            
        }else{
            throw new Error("Error while requesting SPARQL data.")
        }
        } catch (error) {
        console.error(error);
        }
    };

    useEffect(() => {
        fetchSPARQLData();
    }, [endpointLabel]);


    return(
    <>
    </>
    );

}

export default NumberEntities;
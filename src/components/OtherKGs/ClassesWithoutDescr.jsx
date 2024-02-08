
import { useEffect, useState } from 'react';
import StatePool from 'state-pool';
import store from '../storing';
import { Card } from 'react-bootstrap';


function ClassesWithoutDescr(){

    const [percClassesWithout, setClassesWithout] = useState(0);
    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");    
    const [endpointLabel, , ] = store.useState("endpointLabel");    
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const dbpediaQuery = encodeURIComponent(`
        ${prefixes}  
        SELECT (COUNT(DISTINCT ?class) AS ?numAllClasses) (COUNT(DISTINCT ?classWithoutDescription) AS ?numClassesWithoutDescription)
        WHERE {
            ?class rdf:type owl:Class.
        OPTIONAL {?class rdfs:comment ?description. }
        BIND(IF(!BOUND(?description), ?class, 0) AS ?classWithoutDescription)
        }
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
            const allClasses = result.results.bindings[0].numAllClasses.value;
            const classesWithout = result.results.bindings[0].numClassesWithoutDescription.value;
            console.log(allClasses, classesWithout);
            const percentageOfWithout = ((classesWithout / allClasses)*100).toFixed(2);
            console.log("result percentage without description", percentageOfWithout);
            setClassesWithout(percentageOfWithout);
            
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
    <Card key={endpointLabel}>
        <Card.Body>
            <Card.Title>Classes</Card.Title>
            <h3>{percClassesWithout} % </h3>of the classes are missing a description.
        </Card.Body>
    </Card>
    </>
    );

}

export default ClassesWithoutDescr;
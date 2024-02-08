
import { useEffect, useState } from 'react';
import StatePool from 'state-pool';
import store from '../storing';
import { Card } from 'react-bootstrap';


function PropertiesWithoutDescr(){

    const [percPropsWithout, setPropsWithout] = useState(0);
    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");    
    const [endpointLabel, , ] = store.useState("endpointLabel");    
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const dbpediaQuery = encodeURIComponent(`
        ${prefixes}  
        SELECT (count (DISTINCT ?property) as ?countprops) (COUNT(DISTINCT ?propWithoutDescription) AS ?numPropsWithoutDescription)
        WHERE {
          ?property a rdf:Property.
          OPTIONAL{?property rdfs:comment ?description. }
           BIND(IF(!BOUND(?description), ?property, 0) AS ?propWithoutDescription)
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
            const allProps = result.results.bindings[0].countprops.value;
            const propsWithout = result.results.bindings[0].numPropsWithoutDescription.value;
            console.log(allProps, propsWithout);
            const percentageOfWithout = ((propsWithout / allProps)*100).toFixed(2);
            console.log("result percentage without description", percentageOfWithout);
            setPropsWithout(percentageOfWithout);
            
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
            <Card.Title>Properties</Card.Title>
            <h3>{percPropsWithout} % </h3>of the properties are missing a description.
        </Card.Body>
    </Card>
    </>
    );

}

export default PropertiesWithoutDescr;
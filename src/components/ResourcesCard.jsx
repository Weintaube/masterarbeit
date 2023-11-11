import {React, useEffect, useState} from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import "bootstrap/dist/css/bootstrap.min.css"; 

function ResourcesCard(){
    
    const [endpointURL, , ] = store.useState("endpointURL");
    const [endpointLabel, , ] = store.useState("endpointLabel");
    const [resourcesWithoutDescr, setResourcesWithout] = useState(0);
    const [type, setType] = useState(`orkgc:Resource`);
    const [description, setDescription] = useState(`orkgp:description`); //TODO change default values to orkg and check if data even available
    const [prefixes, , ] = store.useState("endpointPrefixes");

    const fetchSPARQLData = async () => {
        try {
          const query = encodeURIComponent(`
            ${prefixes}  
            SELECT (COUNT(DISTINCT ?p) AS ?allResources) (COUNT(DISTINCT ?descrexist) AS ?resourcesWithDescription)
              WHERE {
                ?p rdf:type ${type}.
                OPTIONAL {?p ${description} ?d}
                BIND (IF (BOUND (?d), ?p, 0) AS ?descrexist)
            }  
            `);
        
      const url = `http://localhost:5000/sparql?url=${endpointURL}&query=${query}`;
      //const url2 = `https://orkg.org/triplestore?query=`+query;  
      const response = await fetch(url);
      //const response = await fetch('https://orkg.org/api/statements/');
      //const response = await fetch('https://wikidata.org/w/rest.php/wikibase/v0/entities/properties');
      console.log(response);

      if(response.ok){ //Anfrage erfolgreich Statuscode 200
        console.log("Response (OK)",  response)
          const result = await response.json();
          console.log(result);
          const allResourcesValue = parseInt(result.results.bindings[0].allResources.value);
          const resourcesWith = parseInt(result.results.bindings[0].resourcesWithDescription.value);
          console.log("allResources", allResourcesValue);
          console.log("Resources with", resourcesWith);
          const resourcesWithoutAkku = allResourcesValue - resourcesWith;
          setResourcesWithout((resourcesWithoutAkku/allResourcesValue * 100).toFixed(2));
          //setData([{name:"Properties with a description", value: propsWith}, {name:"Properties without a description", value: 50}]);
          //console.log([{name:"Properties with a description", value: propsWith}, {name:"Properties without a description", value: 50}]);
 
      }else{
        throw new Error("Error while requesting SPARQL data.")
      }
     } catch (error) {
      console.error(error);
     }
     //console.log("Render finsished Test")
  };
        

    useEffect(() => {
        console.log("FIRST USE EFFECT");    
        console.log("Label ", endpointLabel); 
        console.log("Label ", endpointLabel);
        if(endpointLabel === "ORKG"){
            console.log(endpointLabel);
        }
        //fetchData();
        //console.log(getEntireList()); 
        //console.log(getEntireList().size);
        fetchSPARQLData();
    }, [endpointLabel]);

    return(
        <Card style={{ width: '18rem' }}>
        <Card.Body>
            <Card.Title>Resources</Card.Title>
            <Card.Text>
            {resourcesWithoutDescr}% of the Resources are missing a description.
            </Card.Text>
            <Button variant="primary">Go somewhere</Button>
        </Card.Body>
        </Card>  
    );
}

export default ResourcesCard;
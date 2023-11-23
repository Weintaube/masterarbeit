import {React, useEffect, useState} from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { ListGroupItem } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css"; 

function ResourcesCard(){
    
    const [endpointURL, , ] = store.useState("endpointURL");
    const [endpointLabel, , ] = store.useState("endpointLabel");
    const [resourcesWithoutDescr, setResourcesWithout] = useState(0);
    const [type, setType] = useState(`orkgc:Resource`);
    const [description, setDescription] = useState(`orkgp:description`); //TODO change default values to orkg and check if data even available
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [showComponent, setShowComponent] = useState(false);
    const [showHideText, setShowHideText] = useState("Show");

    function handleClick(){
      setShowComponent(!showComponent);
      if(showHideText == "Show"){
          setShowHideText("Hide");
      }else{
          setShowHideText("Show");
      }
    }
    
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
        <Card style={{ display: 'flex', flexDirection: 'row', padding: '10px', gap: '10px', flex: '1' }}>
        <Card.Body style={{ flex: showComponent ? '1' : '0 0 18rem', display: 'flex', flexDirection: 'column' }}>
            <Card.Title>Resources</Card.Title>
            <Card.Text>
            {resourcesWithoutDescr}% of the Resources are missing a description.
            </Card.Text>
            <Button onClick={handleClick}variant="primary">{showHideText} undescribed resources</Button>
        </Card.Body>
        {showComponent ? (
                <div style={{ display: 'flex', flexDirection: 'row'}}>
                <ResourcesList style={{ flex: '1' }} /> {/* Anpassen der Breite */}
                {/* Weitere Inhalte, die neben der Liste gerendert werden sollen */}
                </div>
          ) : null}
        </Card>  
    );
}

export default ResourcesCard;

function ResourcesList(){
    
  const [endpointURL, , ] = store.useState("endpointURL");    
  const [prefixes, , ] = store.useState("endpointPrefixes");
  const [property, setProperty] = useState(`orkgc:Resources`);
  const [description, setDescription] = useState(`orkgp:description`);
  const [resourcesList, setClasses] = useState(null);

  const fetchSPARQLData = async () => {
      try {
        const query = encodeURIComponent(`
          ${prefixes}  
          SELECT distinct ?p ?label
            WHERE {
              ?p rdf:type ${property}.
              ?p rdfs:label ?label.
              FILTER(NOT EXISTS{?p ${description} ?d})
          }  
          `);

          console.log("before fetch");
      
      const url = `http://localhost:5000/sparql?url=${endpointURL}&query=${query}`;
      const response = await fetch(url);
      if(response.ok){ //Anfrage erfolgreich Statuscode 200
          console.log("Response (OK)",  response)
          const result = await response.json();
          console.log("List of properties without description");
          //console.log(result.results.bindings[0].p);
          const uriList = [];
          console.log("size result", result.results.bindings.length);
          console.log(result.results.bindings[0]);
          for(var i=0;i<result.results.bindings.length;i++){
              var itemlabel = result.results.bindings[i].label.value;
              var item = result.results.bindings[i].p.value;
              uriList.push({
                  key: item.substring(item.lastIndexOf('/')+1),
                  value: item,
                  label: itemlabel
              });
          }
          console.log(uriList);
          setClasses(uriList); //TODO liste formatie
          
      }else{
          throw new Error("Error while requesting SPARQL data.")
      }
      } catch (error) {
      console.error(error);
      }
  };

  useEffect(() => {
      fetchSPARQLData();
  }, []);

  //{propertiesList.map(item => <ListGroup.Item>{item.key}</ListGroup.Item>)}
  return(
      <ListGroup className="listgroupstyle">
          {resourcesList? resourcesList.map(item => <ListGroup.Item key={item.key} action href={item.value}>{item.label}</ListGroup.Item>): null}
      </ListGroup>
  );
}
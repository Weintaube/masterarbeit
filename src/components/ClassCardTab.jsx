import {React, useEffect, useState} from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { ListGroupItem} from "react-bootstrap";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import "bootstrap/dist/css/bootstrap.min.css"; 

function ClassCardTab(){
    
    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");
    const [endpointLabel, , ] = store.useState("endpointLabel");
    const [classesWithoutDescr, setClassesWithout] = useState(0);
    const [type, setType] = useState(`owl:Class`);
    const [description, setDescription] = useState(`orkgp:description`); //TODO change default values to orkg and check if data even available
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [showComponent, setShowComponent] = useState(false);
    const [showHideText, setShowHideText] = useState("Show");
    const [classesWithoutAkku, setClassesWithoutAkku] = useState(0);

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
            SELECT (COUNT(DISTINCT ?p) AS ?allClasses) (COUNT(DISTINCT ?descrexist) AS ?classesWithDescription)
              WHERE {
                ?p rdf:type ${type}.
                OPTIONAL {?p ${description} ?d}
                BIND (IF (BOUND (?d), ?p, 0) AS ?descrexist)
            }  
            `);
        
      const url = `http://localhost:5000/sparql?url=${sparqlendpointURL}&query=${query}`;
      //const url2 = `https://orkg.org/triplestore?query=`+query;  
      const response = await fetch(url);
      //const response = await fetch('https://orkg.org/api/statements/');
      //const response = await fetch('https://wikidata.org/w/rest.php/wikibase/v0/entities/properties');
      console.log(response);

      if(response.ok){ //Anfrage erfolgreich Statuscode 200
        console.log("Response (OK)",  response)
          const result = await response.json();
          console.log(result);
          const allClassesValue = parseInt(result.results.bindings[0].allClasses.value);
          const classesWith = parseInt(result.results.bindings[0].classesWithDescription.value);
          console.log("allClasses", allClassesValue);
          console.log("Classes with", classesWith);
          const classesWithoutAkku2 = allClassesValue - classesWith;
          setClassesWithoutAkku(classesWithoutAkku2);
          setClassesWithout((classesWithoutAkku2/allClassesValue * 100).toFixed(2));
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
        <Card >
            <Card.Body >
                <Card.Title>Classes</Card.Title>
                <Tabs 
                    defaultActiveKey="description"
                    id="uncontrolled-tab-example"
                    className="mb-3">
                    <Tab eventKey="description" title="Missing descriptions">
                        {classesWithoutDescr}% ({classesWithoutAkku}) of classes are missing a description.
                        <ClassList/>
                    </Tab>
                </Tabs>

            </Card.Body>
        </Card>  
    );
}

export default ClassCardTab;

function ClassList(){
    
  const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");    
  const [prefixes, , ] = store.useState("endpointPrefixes");
  const [property, setProperty] = useState(`owl:Class`);
  const [description, setDescription] = useState(`orkgp:description`);
  const [classesList, setClasses] = useState(null);

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
      
      const url = `http://localhost:5000/sparql?url=${sparqlendpointURL}&query=${query}`;
      const response = await fetch(url);
      if(response.ok){ //Anfrage erfolgreich Statuscode 200
          const result = await response.json();
          const uriList = [];
          console.log("size result", result.results.bindings.length);
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
          {classesList? classesList.map(item => <ListGroup.Item key={item.key} action href={item.value}>{item.label}</ListGroup.Item>): null}
      </ListGroup>
  );
}
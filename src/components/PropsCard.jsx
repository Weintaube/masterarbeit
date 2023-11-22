import {React, useEffect, useState} from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import "bootstrap/dist/css/bootstrap.min.css"; 
import { ListGroupItem } from "react-bootstrap";

function PropsCard(){
    
    const [endpointURL, , ] = store.useState("endpointURL");
    const [endpointLabel, , ] = store.useState("endpointLabel");
    const [propsWithoutDescr, setPropsWithout] = useState(0);
    const [property, setProperty] = useState(`orkgc:Predicate`);
    const [description, setDescription] = useState(`orkgp:description`); //TODO change default values to orkg and check if data even available
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [showComponent, setShowComponent] = useState(false);
    const [showHideText, setShowHideText] = useState("Show");

    const getPage = async function(pageno=1){
        const results = await fetch(endpointURL+`/predicates/?page=${pageno}&limit=20`).
        then(resp=>{
            return resp.json();
        });
        return results;
    }

    const getEntireList = async function(pageno=1){
        console.log("get entire list");
        const results = await getPage(pageno);
        console.log("result size", results.size);
        console.log("result content", results.content);
        console.log("page number", pageno);
        if(results.content != []){
            return results.concat(await getEntireList(pageno+1))
        }else{
            return results;
        }
        //485 pages
    }

    function handleClick(){
        setShowComponent(!showComponent);
        if(showHideText == "Show"){
            setShowHideText("Hide");
        }else{
            setShowHideText("Show");
        }
    }

    const fetchSPARQLData = async () => {
        console.log("Fetch sparql data");
        try {
          const query = encodeURIComponent(`
            ${prefixes}  
            SELECT (COUNT(DISTINCT ?p) AS ?allprops) (COUNT(DISTINCT ?descrexist) AS ?propsWithDescription)
              WHERE {
                ?p rdf:type ${property}.
                OPTIONAL {?p ${description} ?d}
                BIND (IF (BOUND (?d), ?p, 0) AS ?descrexist)
            }  
            `);

            console.log("before fetch");

        
      const url = `http://localhost:5000/sparql?url=${endpointURL}&query=${query}`;
      //const url2 = `https://orkg.org/triplestore?query=`+query;  
      const response = await fetch(url);
      //const response = await fetch('https://orkg.org/api/statements/');
      //const response = await fetch('https://wikidata.org/w/rest.php/wikibase/v0/entities/properties');
      //console.log(response);

      console.log("after fetch");

      console.log("EIG RESPONSE ERHALTEN");
      if(response.ok){ //Anfrage erfolgreich Statuscode 200
        console.log("Response (OK)",  response)
          const result = await response.json();
          console.log(result);
          const allpropsValue = parseInt(result.results.bindings[0].allprops.value);
          const propsWith = parseInt(result.results.bindings[0].propsWithDescription.value);
          console.log("allprops", allpropsValue);
          console.log("propswith", propsWith);
          const propsWithoutAkku = allpropsValue - propsWith;
          setPropsWithout((propsWithoutAkku/allpropsValue * 100).toFixed(2));
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
        
        <Card style={{display: 'flex', flexDirection: 'row' , padding:'10px', gap:'10px'}}>
            <Card.Body style={{ width: showComponent ? '50%' : '18rem', display: 'flex', flexDirection: 'column' }}>
                <Card.Title>Properties</Card.Title>
                <Card.Text>
                {propsWithoutDescr}% of the properties are missing a description.
                </Card.Text>
                <Button onClick={handleClick}variant="primary">{showHideText} undescribed properties</Button>
            </Card.Body>
            {showComponent ? (
                <div style={{ display: 'flex', flexDirection: 'row'}}>
                <PropsList style={{ width: '50%' }} /> {/* Anpassen der Breite */}
                {/* Weitere Inhalte, die neben der Liste gerendert werden sollen */}
                </div>
          ) : null}
        </Card>  
    );
}

export default PropsCard;


function PropsList(){
    
    const [endpointURL, , ] = store.useState("endpointURL");    
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [property, setProperty] = useState(`orkgc:Predicate`);
    const [description, setDescription] = useState(`orkgp:description`);
    const [propertiesList, setProperties] = useState(null);

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
                    value: item.replace("predicate", "property"), //TODO had to modify the link
                    label: itemlabel
                });
            }
            console.log(uriList);
            setProperties(uriList); //TODO liste formatie
            
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
            {propertiesList? propertiesList.map(item => <ListGroup.Item key={item.key} action href={item.value}>{item.label}</ListGroup.Item>): null}
        </ListGroup>
    );
}
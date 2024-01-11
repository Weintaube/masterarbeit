import React, { useEffect, useState, useMemo } from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css"; 
import { ListGroupItem } from "react-bootstrap";

function PropsCardTab(){
    
    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");
    const [endpointLabel, , ] = store.useState("endpointLabel");
    const [propsWithoutDescr, setPropsWithout] = useState(0);
    const [property, setProperty] = useState(`orkgc:Predicate`);
    const [description, setDescription] = useState(`orkgp:description`); //TODO change default values to orkg and check if data even available
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [showComponent, setShowComponent] = useState(false);
    const [showHideText, setShowHideText] = useState("Show");
    const [propsWithoutAkku, setPropsWithoutAkku] = useState(0);
    const [showDescriptionless, setShowDescriptionless] = useState(false);
    const [combinedList, setCombinedList] = useState([]);

    const [sharedPropertiesWithoutDescr, setSharedProps] = useState([]);

    const getPage = async function(pageno=1){
        const results = await fetch(sparqlendpointURL+`/predicates/?page=${pageno}&limit=20`).
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

        
      const url = `http://localhost:5000/sparql?url=${sparqlendpointURL}&query=${query}`;
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
          setPropsWithoutAkku(propsWithoutAkku);
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
        
        <Card >
            <Card.Body >
                
                <Card.Title>Predicates</Card.Title>
                <Tabs 
                defaultActiveKey="description"
                id="uncontrolled-tab-example"
                className="mb-3"> 
                    <Tab eventKey="description" title="Missing descriptions">
                        {propsWithoutDescr}% ({propsWithoutAkku}) of predicates are missing a description.
                        <PropsList setSharedProps={setSharedProps}></PropsList>
                    </Tab>
                    <Tab eventKey="duplicates" title="Duplicate predicates">
                        <DuplicatePredicates sharedPropertiesWithoutDescr={sharedPropertiesWithoutDescr}/>
                    </Tab>
                </Tabs>

            </Card.Body>
        </Card>  
    );
}

export default PropsCardTab;


function PropsList({setSharedProps}){
    
    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");    
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
        
        const url = `http://localhost:5000/sparql?url=${sparqlendpointURL}&query=${query}`;
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
            setSharedProps(uriList);
            console.log("PROPS CARD", uriList);
            
        }else{
            throw new Error("Error while requesting SPARQL data.")
        }
        } catch (error) {
        console.error(error);
        }
    };

    useEffect(() => {
        console.log("PROPS USE EFFECT");
        fetchSPARQLData();
    }, []);

    //{propertiesList.map(item => <ListGroup.Item>{item.key}</ListGroup.Item>)}
    return(
        <ListGroup className="listgroupstyle">
            {propertiesList? propertiesList.map(item => <ListGroup.Item key={item.key} action href={item.value}>{item.label}</ListGroup.Item>): null}
        </ListGroup>
    );
}

function DuplicatePredicates({sharedPropertiesWithoutDescr}){
    const [allPredicates, setAllPredicates] = useState([]);
    const [duplicatePredicates, setDuplicates] = useState([]);
    const [duplicatePredicatesWithoutDescr, setDuplicatesWithout] = useState([]);
    const [showDuplicates, setShowDuplicates] = useState([]);
    const [sortCriteria, setSortCriteria] = useState({ column: '', order: 'asc' });


    useEffect(() => {
      const fetchData = async () => {
        const result = await fetchAllPages();
        console.log("same props", result);
        setAllPredicates(result);
      };
  
      fetchData();
    }, []);

    useEffect(() =>{
        collectDuplicates(allPredicates);
    },[allPredicates]);

    const fetchAllPages = async()=>{
        let allResults = [];
        let currentPage = 0;
        let totalPages = 1; // Setze eine Anfangszahl

        while (currentPage < totalPages) {
            try {
                const response = await fetch(`https://orkg.org/api/predicates/?sort=label,asc&page=${currentPage}`);
      
                if (response.ok) {
                    const result = await response.json();
                    allResults = allResults.concat(result.content); // Füge die Ergebnisse der aktuellen Seite hinzu
                    totalPages = result.totalPages; // Aktualisiere die Anzahl der Seiten
                    currentPage++; // Gehe zur nächsten Seite
                } else {
                    console.error(`Fehler beim Abrufen der Seite ${currentPage}`);
                    break; // Stoppe die Schleife im Falle eines Fehlers
                }
            } catch (error) {
                console.error(`Fehler beim Abrufen der Seite ${currentPage}: ${error}`);
                break; 
            }
        }
        return allResults;
    }

    const collectDuplicates = sortedList => {
        const duplicatesMap = {};
        const duplicatesWoDescrMap = {};
        console.log("duplicate share", sharedPropertiesWithoutDescr);
        sortedList.forEach(item => {

            const foundItem = sharedPropertiesWithoutDescr.find(sharedItem => sharedItem.key === item.id);
            if(foundItem){ //if this id exists in the list with props without descriptions 
                console.log("duplicate share da");
                if(!duplicatesWoDescrMap[item.label]){
                    duplicatesWoDescrMap[item.label] = {label: item.label, ids:[]};
                }
                duplicatesWoDescrMap[item.label].ids.push(item.id);
            }

            if (!duplicatesMap[item.label]) { //all duplicates regardless if missing a description
                duplicatesMap[item.label] = { label: item.label, ids: [] };
            }
            duplicatesMap[item.label].ids.push(item.id);
        });
      
        // Filtere nur Einträge mit mehr als einer ID (Duplikate)
        const duplicatePredicates = Object.values(duplicatesMap).filter(item => item.ids.length > 1);
        console.log("duplicate predicates", duplicatePredicates);
        console.log("duplicate without descr", duplicatesWoDescrMap);
        //filter the duplicates which do not have a description
        setDuplicatesWithout(Object.values(duplicatesWoDescrMap).filter(item => item.ids.length > 1));
        setDuplicates(duplicatePredicates);
        setShowDuplicates(duplicatePredicates);
      };   

    const handleCellClick = (item) => {
        const content = (
            <ListGroup>
            {item.ids.map(id => (
                <ListGroup.Item key={id} action href={`https://orkg.org/property/${id}`}>
                {id}
                </ListGroup.Item>
            ))}
            </ListGroup>
        );
    
      };

      const handleSort = (column) => {
        if (sortCriteria.column === column) {
            setSortCriteria({
                ...sortCriteria,
                order: sortCriteria.order === 'asc' ? 'desc' : 'asc'
            });
        } else {
            setSortCriteria({
                column,
                order: 'asc'
            });
        }
    };

    const sortedDuplicates = useMemo(() => {
        const { column, order } = sortCriteria;

        const compareFunction = (a, b) => {
            const aValue = a.ids.length;
            const bValue = b.ids.length;
    
            if (order === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        };

        return [...showDuplicates].sort(compareFunction);
    }, [showDuplicates, sortCriteria]);

   const handleSwitchChange=(event)=>{
        if (event.target.checked) {
            setShowDuplicates(duplicatePredicatesWithoutDescr);
        } else {
            setShowDuplicates(duplicatePredicates);
        }
   }
   
    return(
        <>
        <Form>
        <Form.Check
            type="switch"
            id="description-switch"
            label="Predicates without description"
            onChange={handleSwitchChange}
        />
        </Form>
        There are {showDuplicates.length} duplicate predicates. 
        <div className="listgroupstyle listgroupcursor">
        <Table bordered hover >
            <thead>
            <tr>
                <th>Label</th>
                <th>Occurences
                <button onClick={() => handleSort('ids.length')}>
                    {sortCriteria.column === 'ids.length' ? (
                        sortCriteria.order === 'asc' ? (
                            <FontAwesomeIcon icon={faArrowUp} />
                        ) : (
                            <FontAwesomeIcon icon={faArrowDown} />
                        )
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faArrowUp} />
                            <FontAwesomeIcon icon={faArrowDown} />
                        </>
                    )}
                </button>
                </th>
            </tr>
            </thead>
            <tbody>
                {sortedDuplicates.map((item, index) => (
                <tr key={index}>
                    <td>{item.label}</td>
                    <td>{item.ids.length}</td>
                </tr>
            ))}
            </tbody>
        </Table>
        </div>
        </>
    );
}
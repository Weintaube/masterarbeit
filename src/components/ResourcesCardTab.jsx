import {React, useEffect, useState} from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { ListGroupItem } from "react-bootstrap";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import "bootstrap/dist/css/bootstrap.min.css"; 

function ResourcesCardTab(){
    
    const [allResources, setAllResources] = useState([]);
    const [unusedResources, setUnusedResources] = useState([]);
    const [unlabeledResources, setUnlabeledResources] = useState([]);
    const [showComponent, setShowComponent] = useState(false);
    const [showHideText, setShowHideText] = useState("Show");

    
    useEffect(() => {
        console.log("unused resources");
        const fetchData = async () => {
          const result = await fetchAllPages();
          console.log("all resources", result);
          setAllResources(result);
        };
    
        fetchData();
    }, []);

    useEffect(()=>{
        
        const newUnusedRes = [];
        const newUnlabeledRes = [];
        if(allResources.length > 0){
            allResources.forEach(resource =>{
                if(resource.label == ""){
          newUnlabeledRes.push({id: resource.id, value: `https://orkg.org/resource/${resource.id}`});

                }else if(resource.shared == 0){
                    newUnusedRes.push({id: resource.id, value: `https://orkg.org/resource/${resource.id}`});
                }
                
            })
        }
        console.log("unused resources list", newUnusedRes);
        console.log("unlabeled resources list", newUnlabeledRes);
        setUnusedResources(newUnusedRes);
        setUnlabeledResources(newUnlabeledRes);
    },[allResources]);

    const fetchAllPages = async()=>{
        console.log("fetch all pages");
        let allResults = [];
        let currentPage = 0;
        let totalPages = 1; 

        while (currentPage < totalPages) {
            try {
                const response = await fetch(`https://orkg.org/api/resources/?sort=label,asc&page=${currentPage}&size=2500`);
      
                if (response.ok) {
                    const result = await response.json();
                    //console.log(result);
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
        console.log("all pages undoc", allResults);
        return allResults;
    }


    
    return(
        <Card >
        <Card.Body >
            <Card.Title>Resources</Card.Title>
            <Tabs 
                defaultActiveKey="unused"
                id="uncontrolled-tab-example"
                className="mb-3">
                {/*<Tab eventKey="description" title="Missing descriptions">
                    {resourcesWithoutDescr}% of the Resources are missing a description.
                    <ResourcesList></ResourcesList>
                </Tab>*/}
                <Tab eventKey="unused" title="Unused Resources">
                    {(unusedResources.length/allResources.length * 100).toFixed(2)}% ({unusedResources.length}) of the resources are not being used.
                {/*<ListGroup className="listgroupstyle">
                    {unusedResources? unusedResources.map((item, key) => 
                    <ListGroup.Item key={key} action href={item.value}>{item.label}</ListGroup.Item>): null}
                </ListGroup>*/}
                </Tab>

                <Tab eventKey="unlabeled" title="Unlabeled resources">
                    {(unlabeledResources.length/allResources.length * 100).toFixed(2)}% ({unlabeledResources.length}) of the resources do not have a label.
                    <ListGroup className="listgroupstyle">
                        {unlabeledResources? unlabeledResources.map((item, key) => <ListGroup.Item key={key} 
                        action href={item.value}
                        target="_blank"
                        rel="noopener noreferrer">{item.id}</ListGroup.Item>): null }
                    </ListGroup>
                </Tab>

            </Tabs>
        </Card.Body>
        </Card>  
    );
}
export default ResourcesCardTab;
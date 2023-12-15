import {React, useEffect, useState} from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import "bootstrap/dist/css/bootstrap.min.css"; 

function UnusedResources(){
    
    const [allResources, setAllResources] = useState([]);
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
        /*if(allResources.length > 0){
            allResources.forEach(resource =>{
                if(resource.shared == 0){
                    newUnusedRes.push(resource.id);
                }
            })
        }*/

       //check for each


    },[allResources]);

    
    function handleClick(){
      setShowComponent(!showComponent);
      if(showHideText == "Show"){
          setShowHideText("Hide");
      }else{
          setShowHideText("Show");
      }
    }
    
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
                    console.log(result);
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
        <Card style={{ display: 'flex', flexDirection: 'row', padding: '10px', gap: '10px', flex: '1' }}>
        <Card.Body style={{ flex: showComponent ? '1' : '0 0 18rem', display: 'flex', flexDirection: 'column' }}>
            <Card.Title>Resources</Card.Title>
            <Card.Text>
            % of the Resources are not being used.
            </Card.Text>
            <Button onClick={handleClick}variant="primary">{showHideText} unused resources</Button>
        </Card.Body>
        </Card>  
    );
}

export default UnusedResources;
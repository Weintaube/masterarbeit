
import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";

function UndesiredResources(){
    
    useEffect(() =>{
        fetchData();
    },[]);

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

    const fetchData = async()=>{
        try{

            const response = await fetch('https://orkg.org/api/resources/');
            console.log(response);

            if(response.ok){
                const result = await response.json();
                console.log(result);

            }else{
                throw new Error("Error while requesting REST API for undesired resources.");
            }

        }catch(error){
            console.error(error);
        }

    }

    return(
        <>
        Undesired resources
        <ListGroup>
            
        </ListGroup>
        </>

    );

    
}

export default UndesiredResources;
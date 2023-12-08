
import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import store from './storing';

function UndesiredResources(){

    const[undocResources, setUndocResources] = useState([]); 
    const[undesResources, setUndesResources] = useState([]); 
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [endpointURL, , ] = store.useState("endpointURL");
    
    useEffect(()=>{
        fetchSPARQLData(); //is this awaited?
        fetchData();
    },[]);

    const fetchData = async() =>{
        console.log("fetch data");
        for(var i=0;i<undocResources.length;i++){
            var curID = undocResources[i];
            try {
                const response = await fetch(`https://orkg.org/api/resources/${curID}`);
                console.log("test1");
    
                if (response.ok) {
                    console.log("test2");
                    const result = await response.json();
                    console.log("result cur id", result);

                } else {
                    console.error(`Fehler beim Abrufen der Resource ${curID}`);
                }
            } catch (error) {
                console.error(`Exception beim Abrufen der Resource ${curID}: ${error}`);
            }
        }
    }

    const fetchSPARQLData = async () => {
        console.log("fetch sparql data undes res");
        try {
          const query = encodeURIComponent(`
            ${prefixes}  
            SELECT distinct ?p
            WHERE {
              ?p rdf:type orkgc:Resource.
              FILTER(NOT EXISTS{?p orkgp:description ?d})
            } 
            `);
    
      const url = `http://localhost:5000/sparql?url=${endpointURL}&query=${query}`;
      const response = await fetch(url);
      console.log("response", response);

      if(response.ok){ //Anfrage erfolgreich Statuscode 200
        console.log("Response (OK)",  response)
          const result = await response.json();
          console.log("results without descr ",result);
          const uriList = [];
          for(var i=0;i<result.results.bindings.length;i++){
            var itemID = result.results.bindings[i].p.value;
            uriList.push(itemID);
        }
        setUndocResources(uriList);
 
      }else{
        throw new Error("Error while requesting SPARQL data.")
      }
     } catch (error) {
      console.error(error);
     }
     //console.log("Render finsished Test")
  };


    return(
        <>
        Undesired resources ({undesResources.length})
        <ListGroup className="duplicateList">
            {undesResources.map(item => (
                <ListGroup.Item
                    key={item.label}
                    className="listgroupcursor">
                    {item.label}
                </ListGroup.Item>
            ))}
        </ListGroup>
        </>

    ); 
}

export default UndesiredResources;
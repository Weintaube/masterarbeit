import React, {useEffect, useState} from "react";
//import {ListGroup} from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css'; //React Bootstrap CSS
import store from './components/Navbar';


export default function TestComponent() {
 // testendpoint.getValue();
  console.log(store);

 // const [test123, ] = store.useState("testendpoint");
  //console.log(test123);
  const [data, setData] = useState(null); //variable data wird aktuell gehalten mithilfe der Funktion setData

  useEffect(() => {
    const fetchSPARQLData = async () => {
      try {
        const query = encodeURIComponent(`     
        PREFIX orkgr: <http://orkg.org/orkg/resource/>
        PREFIX orkgc: <http://orkg.org/orkg/class/>
        PREFIX orkgp: <http://orkg.org/orkg/predicate/>  

          SELECT ?paper ?paper_title ?doi
            WHERE {
              ?paper rdf:type orkgc:Paper ;
                    rdfs:label ?paper_title ;
                    orkgp:P30 orkgr:R132 
              OPTIONAL { ?paper orkgp:P26 ?doi } .
          }    
          LIMIT 5
        `);
        const url = `http://localhost:5000/sparql?query=${query}`;
        //const url2 = `https://orkg.org/triplestore?query=`+query;    
        const response = await fetch(url);

        if(response.ok){
          const result = await response.json();
          setData(result);
        }else{
          throw new Error("Error while requesting SPARQL data.")
        }
       } catch (error) {
        console.error(error);
       }
    };
    fetchSPARQLData();
  }, []);

  console.log(data);

  return (
    <div>test123</div>
  )
}

/*<div>
      {data ? (
        <ul>
          {data.results.bindings.map((binding, index) => (
            <li key={index}>
              Paper URI: {binding.paper.value}<br/>
              Paper Title: {binding.paper_title.value}<br/>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>                                                               
  );*/






//console.log(typeof response);
        //console.log(response);
        //console.log(response.json()); //in comment, otherwise body has already been consumed
    
        
        /*, {
          origin: "http://localhost:3000/", //`http://localhost:5000/sparql?query=${query}`
          method: "GET",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*"         
          }
        });*/  
            
        /*const data = await response.json();
        setData(data);*/
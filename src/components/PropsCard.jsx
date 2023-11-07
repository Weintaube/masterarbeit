import {React, useEffect} from "react";
import store from './storing';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import "bootstrap/dist/css/bootstrap.min.css"; 

function PropsCard(){
    
    const [endpointURL, , ] = store.useState("endpointURL");
    const [endpointLabel, , ] = store.useState("endpointLabel");

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

    const fetchData = async() => {

        try {
            const response = await fetch('https://orkg.org/api/predicates/?page=2');

            if(response.ok){ //Anfrage erfolgreich Statuscode 200
            console.log("Response (OK)",  response)
            const result = await response.json();
            console.log(result.content);

            console.log(result.pageable);
            }
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        console.log("FIRST USE EFFECT");    
        console.log("Label ", endpointLabel);
            
        //fetchData();
        console.log(getEntireList()); 
        //console.log(getEntireList().size);
    }, [endpointLabel]);

    return(
        <Card style={{ width: '18rem' }}>
        <Card.Body>
            <Card.Title>Properties</Card.Title>
            <Card.Text>
            {}% of the properties are missing a description.
            </Card.Text>
            <Button variant="primary">Go somewhere</Button>
        </Card.Body>
        </Card>  
    );
}

export default PropsCard;
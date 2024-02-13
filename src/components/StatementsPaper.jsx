import { useEffect } from "react";
import { Card } from "react-bootstrap";


function StatementsPaper(){

    useEffect(()=>{
        fetchData();
    });

    const fetchData = async()=>{
        try{
            const response = await fetch(''); //https://orkg.org/api/statements/R659268/bundle?maxLevel=2
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("Statements per paper", result);

            }else{
                console.log("Error while fetching comparisons.");
            }

        }catch(error){
            console.log(error);
        }
    }

    return(
        <>
        <Card>
            <Card.Title>Statements per Paper</Card.Title>
                <Card.Body>
                    Test124
                </Card.Body>
        </Card>
        </>
    );

}

export default StatementsPaper;
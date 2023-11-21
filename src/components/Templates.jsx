import  {React, useEffect} from "react";
import Table from 'react-bootstrap/Table';

function Templates(){

    useEffect(() => {            
        fetchData();
    }, []);

    const fetchData = async()=>{
        try{
            const response = await fetch('https://orkg.org/api/classes/NodeShape/resources/'); //445 Templates in total
            const response2 = await fetch('http://orkg.org/api/resources/R599005');
            //a template has an ID with R, they have instances where they are used
            //these instances have a class which also describes the template
            //as far as I can see there is no possibility to connect the template ID with the class ID
            //where it is used, especially if the template is not used, then there is no class I guess
            //or I can't track it
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("Templates");
                console.log(result);
            }


        }catch(error){
            console.log(error);
        }
    }


    return(
        <>
        <Table striped bordered hover>
        <thead>
        <tr>
          <th>Template</th>
          <th>Created by</th>
          <th>Number of uses</th>
        </tr>
        </thead>
        <tbody>

        </tbody>
        </Table>
        </>
    );
}

export default Templates;

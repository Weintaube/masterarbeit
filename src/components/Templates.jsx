import  {React, useEffect} from "react";
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';

function Templates(){

    useEffect(() => {            
        fetchData();
    }, []);

    const fetchData = async()=>{
        try{
            //const response = await fetch('https://orkg.org/api/classes/NodeShape/resources/'); //445 Templates in total
            /*const response = await fetch('http://orkg.org/api/resources/R599005', {header:
            {
                'Access-Control-Allow-Origin':'*'
            }
            });*/

            //const response = await fetch('https://orkg.org/api/resources/R71449');
            //const response = await fetch('http://orkg.org/api/classes/C1004');

            const response = await fetch('https://orkg.org/api/statements/predicate/sh:targetClass?page=0'); //nodeshape (template) sh:targetClass Classwhichdescribestemplate, 436
            //const resp = await fetch('http://orkg.org/api/classes/C21029/resources/');

            //a template has an ID with R, they have instances where they are used
            //these instances have a class which also describes the template
            //as far as I can see there is no possibility to connect the template ID with the class ID
            //where it is used, especially if the template is not used, then there is no class I guess
            //or I can't track it
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json(); //get a paginated content with 436 elements
                const result2 = result.content[0].object.id;
                let ids = result.content.map(some => some.object.id);
                const targets = await fetch('https://orkg.org/api/classes/{id}/resources/'); //length?
                console.log(ids);
                //const result2 = await resp.json();
                console.log("Templates");
                console.log(result);
                console.log(result2);
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

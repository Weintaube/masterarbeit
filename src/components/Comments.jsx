import { useEffect, useState } from "react";
import { Button, Dropdown, ListGroup } from "react-bootstrap";
import Table from "react-bootstrap/Table";


function Comments(){
    const [commentIDs, setCommentIDs, ] = useState([]); //list for keeping the ids which have a list of comments attached
    const [typeComments, setTypeComments, ] = useState(["Accuracy questioned", "Bad modeling", "Lacking completeness"]); 
    //todo add custom option

    useEffect(()=>{
        fetchData();
    });

    const fetchData = async()=>{
        /*try{
            const response = await fetch('https://orkg.org/api/statements/R657005/bundle');
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("bundle stuff", result);

            }else{
                console.log("Error while fetching comparisons.");
            }

        }catch(error){
            console.log(error);
        }*/
    }

    function addingForm(){
        //rendering a form to add an instance
        //type of instance (comparison, paper, resource)
        //id
        //type of comment
        //comment/description
        //add button
        //closing button
    }


    //possibility to edit the comments/delete them
    //adding a filter function for type of comments
    //adding a list for the types of comments (update everytime somehting gets added/deleted)
    return(
        <>
        Filter by
        <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
            Select type of comment
        </Dropdown.Toggle>

        <Dropdown.Menu>
            {typeComments.map(element => <Dropdown.Item>{element}</Dropdown.Item>)}
        </Dropdown.Menu>
        </Dropdown>

        <Table striped bordered hover>
        <thead>
        <tr>
            <th>Type</th>
            <th>Instance</th>
            <th>ID</th>
            <th>Comments</th>
        </tr>
        </thead>
        <tbody>
            {commentIDs.map((item, index) => (
                <tr key={index}>
                    <td><a href={item.uri} target="_blank" rel="noopener noreferrer">{item.label}</a> </td>
                    <td> {item.allCells} </td>
                    <td> {item.emptyCells} </td>
                    <td> {((item.emptyCells / item.allCells)*100).toFixed(2)}% </td>
                </tr>
            )
            )}
        </tbody>
        </Table>

        <Button onClick={addingForm}>Add a comment</Button>
        </>
    );

}

//{commentIDs? commentIDs.map(item=><ListGroup.Item>[commentIDs.id}</ListGroup.Item>):null}

export default Comments;
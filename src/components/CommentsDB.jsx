import { useEffect, useState } from "react";
import { Button, Dropdown, ListGroup } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import {OverlayTrigger, Tooltip} from "react-bootstrap";


function CommentsDB(){
    const [commentList, setCommentList, ] = useState([]); //list for keeping the ids which have a list of comments attached
    const [typeInstances, setTypeInstances] = useState(["Paper", "Comparison", "Statement"]); //todo think about how the statement can be implemented
    const [typeComments, setTypeComments, ] = useState(["Accuracy questioned", "Bad modeling", "Lacking completeness"]);  //todo add custom option
    const [validated, setValidated] = useState(false);
    const [activeTab, setActiveTab] = useState("table");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        setValidated(true);

        if (form.checkValidity()) {
            const formData = new FormData(form);

            const typeOfResource = formData.get('formTypeRes');
            const typeOfComment = formData.get('formTypeComment');
            const resourceId = formData.get('formID');
            const commentDescription = formData.get('formComment');

            try{
                let resultAPI = {};
                if(typeOfResource === "Paper"){
                    const response = await fetch(`https://orkg.org/api/papers/${resourceId}`);
                    console.log("comment list fired", response);
                    if (response.ok) {
                        const result = await response.json();
                        console.log("comment list fetch", result);
                        resultAPI = { uri: `https://orkg.org/paper/${resourceId}`, title: result.title };
                    } else {
                        console.log('Error fetching paper data.');
                    }
                } else if (typeOfResource === 'Comparison') {
                    const response = await fetch(`https://orkg.org/api/comparisons/${resourceId}`);
                    if (response.ok) {
                        const result = await response.json();
                        resultAPI = { uri: `https://orkg.org/comparison/${resourceId}`, title: result.title };
                    } else {
                        console.log('Error fetching comparison data.');
                    }
                }

                const newComment = {
                    typeRes: typeOfResource,
                    uri: resultAPI.uri,
                    title: resultAPI.title,
                    resourceId: resourceId,
                    description: commentDescription,                
                    typeComm: typeOfComment,
                };
                console.log("Comment list new", newComment);
    
                /*setCommentList([...commentList, newComment]);
                console.log("comment list", commentList);*/
                postComment(newComment);
                setValidated(false);
                setActiveTab('table');
                form.reset();

            }catch(error){
                console.error("Error fetching data", error);
                window.alert('Error fetching data.');
            }

            
        }
      };

      const postComment = async(comment)=>{
        try {
            const url = `http://localhost:8001/comments/_new`;
            const response = await fetch(url, {
                method: "POST", 
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(comment)   
            });
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("DB SHIT", result);
            }else{
                throw new Error("Error while requesting SPARQL data.")
            }
        } catch (error) {
            console.error(error);
        }
      }

      const fetchDBData = async () => {
        try {
                const url = `http://localhost:8001/comments`;
                const response = await fetch(url);
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("DB SHIT", result);
                setCommentList(result);
            }else{
                throw new Error("Error while requesting SPARQL data.")
            }
        } catch (error) {
            console.error(error);
        }
    };

      
      useEffect(()=>{
        fetchDBData();     
      },[activeTab]);

    //possibility to edit the comments/delete them
    //adding a filter function for type of comments
    //adding a list for the types of comments (update everytime somehting gets added/deleted)
    return(
        <>
        <Card>
        <Card.Body >
            
            <Card.Title>Comments</Card.Title>
            <Tabs 
            defaultActiveKey="table"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="uncontrolled-tab-example"
            className="mb-3"> 
                <Tab eventKey="table" title="All comments">
                Here you can make comments about papers or comparisons which should be improved.
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>ID</th>
                        <th>Comments</th>
                    </tr>
                    </thead>
                    <tbody>
                        {commentList.map((item, index) => (
                            <tr key={index}>
                                <td> {item.typeRes} </td>
                                <td> <a href={item.uri} target="_blank" rel="noopener noreferrer">{item.title}</a> </td>
                                <td> {item.resourceId} </td>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip data-bs-theme="dark" id={`tooltip-${index}`}>{item.descr}</Tooltip>}
                                >
                                    <Button>{item.typeComm}</Button>
                                </OverlayTrigger>
                            </tr>
                        )
                        )}
                    </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="addcomment" title="Add a comment">
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formTypeRes">
                            <Form.Label>Type of resource</Form.Label>
                            <Form.Select name="formTypeRes">
                                {typeInstances.map((type, index) => (
                                    <option key={index}>{type}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formID">
                            <Form.Label>ID</Form.Label>
                            <Form.Control name="formID" type="text" placeholder="Enter ID of resource" required/>
                            <Form.Control.Feedback type="invalid">
                                Please enter an ID.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formTypeComment">
                            <Form.Label>Type of comment</Form.Label>
                            <Form.Select name="formTypeComment">
                                {typeComments.map((type, index) => (
                                    <option key={index}>{type}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formComment">
                            <Form.Label>Description</Form.Label>
                            <Form.Control name="formComment" as="textarea" required/>
                            <Form.Control.Feedback type="invalid">
                                Please enter a description to specify your comment about the resource.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Add the comment
                        </Button>
                    </Form>
                </Tab>
            </Tabs>

        </Card.Body>
         </Card>
        </>
    );

}

//{commentIDs? commentIDs.map(item=><ListGroup.Item>[commentIDs.id}</ListGroup.Item>):null}

export default CommentsDB;
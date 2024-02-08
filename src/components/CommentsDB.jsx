import { useEffect, useState } from "react";
import { Button, Dropdown, ListGroup } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Card from 'react-bootstrap/Card';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import {OverlayTrigger, Tooltip, Popover, Modal} from "react-bootstrap";


function CommentsDB(){
    const [commentList, setCommentList] = useState([]); //list for keeping the ids which have a list of comments attached, sorted by resource id
    const [rawCommentList, setRawCommentList] = useState([]); //raw comments, each one in a row
    const [typeInstances, setTypeInstances] = useState(["Paper", "Comparison", "Statement"]); //todo think about how the statement can be implemented
    const [typeComments, setTypeComments, ] = useState(["Accuracy questioned", "Bad modeling", "Lacking completeness", "In-depth analysis", "Innovative Approach", "Reproducible Results"]);  //todo add custom option
    const [validated, setValidated] = useState(false);
    const [activeTab, setActiveTab] = useState("table");
    const [showModal, setShowModal] = useState(false); //for description editing overlay
    const [updatedDescription, setUpdatedDescription] = useState("");
    const [selectedComment, setSelectedComment] = useState(null);

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
                let isIDValid = true;

                if(typeOfResource === "Paper"){
                    const response = await fetch(`https://orkg.org/api/papers/${resourceId}`);
                    console.log("comment list fired", response);

                    if (response.ok) {
                        const result = await response.json();
                        console.log("comment list fetch", result);
                        resultAPI = { uri: `https://orkg.org/paper/${resourceId}`, title: result.title };
                    } else {
                        console.log('Error fetching paper data.');
                        isIDValid = false;
                    }
                } else if (typeOfResource === 'Comparison') {
                    const response = await fetch(`https://orkg.org/api/comparisons/${resourceId}/`);
                    if (response.ok) {
                        const result = await response.json();
                        resultAPI = { uri: `https://orkg.org/comparison/${resourceId}`, title: result.title };
                    } else {
                        console.log('Error fetching comparison data.');
                        isIDValid = false;
                    }
                }

                if(isIDValid){
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
                }else{
                    console.log("comments id not valid");
                    form.elements['formID'].setCustomValidity('ID not valid');  
                      
                }
                form.reportValidity();
            }catch(error){
                console.error("Error fetching data", error);
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
                await fetchDBData();
            }else{
                throw new Error("Error while requesting SPARQL data.")
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteEntry = async(item)=>{
        try {
            const url = `http://localhost:8001/comments/${item.id}`;
            const response = await fetch(url, {
                method: "DELETE", 
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)   
            });
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("DB SHIT", result);

                await fetchDBData();
            }else{
                throw new Error("Error while requesting SPARQL data.")
            }
        } catch (error) {
            console.error(error);
        }

    };

    const fetchDBData = async () => {
        try {
            const url = `http://localhost:8001/comments`;
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setRawCommentList(result);
                const commentsByResource = {};
    
                result.forEach(comment => {
                    if (!commentsByResource[comment.resourceId]) {
                        commentsByResource[comment.resourceId] = {
                            typeRes: comment.typeRes,
                            uri: comment.uri,
                            title: comment.title,
                            resourceId: comment.resourceId,
                            comments: []
                        };
                    }
    
                    commentsByResource[comment.resourceId].comments.push(comment);
                });
    
                setCommentList(commentsByResource);
            } else {
                throw new Error("Error while requesting SPARQL data.");
            }
        } catch (error) {
            console.error(error);
        }
    };    
    

    const updateComment = async(item)=>{
        console.log(item);
        try {
            const url = `http://localhost:8001/comments/${item.id}`;
            const response = await fetch(url, {
                method: "POST", 
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)   
            });
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("DB SHIT", result);

                await fetchDBData();
            }else{
                throw new Error("Error while requesting SPARQL data.")
            }
        } catch (error) {
            console.error(error);
        }

    }
    useEffect(()=>{
    fetchDBData();     
    },[activeTab]);

    
    const handleDeleteRow = async(item) => { //deletion by whole item
        const rowsToDelete = rawCommentList.filter(comment => comment.resourceId === item.resourceId);

        for (const row of rowsToDelete) {
            console.log("item to be deleted", row);
            await deleteEntry(row);
        }
    };

    const handleDeleteComment = (id) => { //deletion by id, for a specific comment
        const item = rawCommentList.find(comment => comment.id === id);
        if (item) {
            console.log("Item to be deleted:", item);
            deleteEntry(item);
        } else {
            console.error("Item not found");
        }
        handleEditModalClose();
    }

    const handleInputChange = (event) => {
        event.target.setCustomValidity('');
    };

    const handleEditModalShow = (comment) => {
        setSelectedComment(comment);
        setUpdatedDescription(comment.description);
        setShowModal(true);
      };
    
      const handleEditModalClose = () => {
        setSelectedComment(null);
        setUpdatedDescription("");
        setShowModal(false);
      };
    
      const handleUpdateDescription = async () => {
        console.log("Updating description:", updatedDescription);
        selectedComment.description = updatedDescription;
        console.log("comments updated descr now", selectedComment.description);
        updateComment(selectedComment);
        handleEditModalClose();
      };

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
                        {Object.values(commentList).map((item, index) => (
                            <tr key={index}>
                                <OverlayTrigger
                                    placement="bottom"
                                    trigger="click"
                                    rootClose="true"
                                    key={`Delete Popover${item.resourceId}`}
                                    overlay={<Popover data-bs-theme="dark">
                                        <Popover.Header as="h3">{`Do you want to delete this item?`}</Popover.Header>
                                        <Popover.Body>
                                            {item.typeRes} with ID {item.resourceId}<br></br>
                                            <Button variant="danger" onClick={() => handleDeleteRow(item)} key={`delete-${item.resourceId}`}>Delete</Button>
                                        </Popover.Body>
                                    </Popover>}
                                >
                                    <td> {item.typeRes} </td>
                                </OverlayTrigger>

                                <td> <a href={item.uri} target="_blank" rel="noopener noreferrer">{item.title}</a> </td>
                                <td> {item.resourceId} </td>

                                {/* Edit Button */}
                                <td>
                                    {item.comments.map((comment, commentIndex) => (
                                        <OverlayTrigger
                                            placement="top"
                                            key={`tooltip-${item.resourceId}-${commentIndex}`}
                                            overlay={<Tooltip data-bs-theme="dark" id={`tooltip-${item.resourceId}-${commentIndex}`}>{comment.description}</Tooltip>}
                                        >
                                            {/* Updated line: Added data-id attribute for identifying the comment */}
                                            <Button onClick={() => handleEditModalShow(comment)} className={`btn-${comment.typeComm.toLowerCase().replace(/\s+/g, '-')}`} data-id={comment.id}>{comment.typeComm}</Button>
                                        </OverlayTrigger>
                                    ))}
                                </td>
                            </tr>
                        ))}
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
                            <Form.Control name="formID" type="text" placeholder="Enter ID of resource" required onChange={handleInputChange}/>
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

         <Modal show={showModal} onHide={handleEditModalClose}>
            <Modal.Header closeButton>
            <Modal.Title>Edit Description</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form.Group controlId="formUpdatedDescription">
                <Form.Label>Updated Description</Form.Label>
                <Form.Control
                as="textarea"
                rows={3}
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
                />
            </Form.Group>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleEditModalClose}>
                Close
            </Button>
            <Button variant="danger" onClick={() => handleDeleteComment(selectedComment.id)}>
            Delete Comment
            </Button>
            <Button variant="primary" onClick={handleUpdateDescription}>
                Save Changes
            </Button>
            </Modal.Footer>
        </Modal>


        </>
    );

}

//{`btn-${comment.typeComm.toLowerCase().replace(/\s+/g, '-')}}`}
//{commentIDs? commentIDs.map(item=><ListGroup.Item>[commentIDs.id}</ListGroup.Item>):null}

export default CommentsDB;
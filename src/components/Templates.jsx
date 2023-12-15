import  {React, useEffect, useState} from "react";
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Templates(){

    const [results, setResults] = useState([]);
    const [pageNo, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {            
        fetchData();
    }, [pageNo]);

    const fetchData = async()=>{
        try{
            const response = await fetch(`https://orkg.org/api/statements/predicate/sh:targetClass?page=${pageNo}&size=10`); //nodeshape (template) sh:targetClass Classwhichdescribestemplate, 436

            if(response.ok){ 
                //console.log("Response (OK)",  response)
                const result = await response.json(); //get a paginated content with 436 elements
                //console.log("first result", result);
                let templateRows = result.content.map(some => ({ label: some.subject.label, created_by: some.subject.created_by, id: some.object.id}));
                //todo add uri to make clickable
                console.log("Template rows", templateRows);

                let updatedResults = results.slice();
                for (let item of templateRows) {
                    try {
                        let instances = await fetch(`https://orkg.org/api/classes/${item.id}/resources/`);
                        
                        if (instances.ok) {
                            let resourcesInstances = await instances.json();
                            let numberinstances = resourcesInstances.totalElements;
                            updatedResults.push({label: item.label, uri: `https://orkg.org/class/${item.id}` , created_by: item.created_by, numberOfInstances: numberinstances});

                        } else {
                            console.error(`Fehler beim Abrufen der Ressource für ID ${item.id}: ${response.status}`);
                        }
                    } catch (error) {
                        console.error(`Fehler beim Abrufen der Ressource für ID ${item.id}: ${error}`);
                    }
                }
                updatedResults.sort((a, b) => a.numberOfInstances - b.numberOfInstances); //aufsteigend nach number of instances sortieren
                //für absteigend b-a rechnen, todo mit UI verstellbar machen
                setResults(updatedResults);
                console.log("updated Results", updatedResults);
            }

        }catch(error){
            console.log(error);
        }
    }

    const handlePageIncrement = () => {
        console.log("page increment");
        setCurrentPage(prevPage => prevPage + 1);
        setResults([]);
    };

    const handlePageDecrement = () => {
        console.log("page increment");
        setCurrentPage(prevPage => prevPage - 1);
        setResults([]);
    };

    return(
        <>
        <Table striped bordered hover>
        <thead>
        <tr>
          <th>Template</th>
          <th>Created by</th>
          <th>Number of uses</th>
          <th>Number of uses by author</th>
          <th>Number of uses by others</th>
        </tr>
        </thead>
        <tbody>
            {results.map((item, index) => (
            <tr key={index}>
                <td><a href={item.uri} target="_blank" rel="noopener noreferrer">{item.label}</a></td>
                <td>{item.created_by}</td>
                <td>{item.numberOfInstances}</td>
                <td></td>
                <td></td>
            </tr>
        ))}
        </tbody>
        </Table>
        <Row>
            <Col>Currently page x from y</Col>
            <Col>
                <Pagination>
                    <Pagination.Prev onClick={handlePageDecrement}/>
                    <Pagination.Next onClick={handlePageIncrement}/>
                </Pagination>     
            </Col>
        </Row>
        </>
    );
}

export default Templates;

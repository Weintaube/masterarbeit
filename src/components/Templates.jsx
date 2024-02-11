import { React, useEffect, useState, useMemo } from "react";
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Card } from "react-bootstrap";

function Templates() {
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortCriteria, setSortCriteria] = useState({ column: '', order: 'asc' });
    const elementsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, [currentPage, sortCriteria]);

    const fetchData = async () => {
        try {
            const response = await fetch(`https://orkg.org/api/templates?page=${currentPage}`);
            
            if (response.ok) {
                const result = await response.json();
                const totalPages = result.totalPages; // result.totalPages
                setTotalPages(totalPages);

                let updatedResults = [];

                for (let page = 0; page < totalPages; page++) {
                    const pageResponse = await fetch(`https://orkg.org/api/templates?page=${page}`);
                    const pageResult = await pageResponse.json();

                    // Sort the results based on the current sort criteria
                    updatedResults.push(
                        ...await Promise.all(pageResult.content.map(async template => {
                        const response = await fetch(`https://orkg.org/api/contributors/${template.created_by}`);
                        const userResult = await response.json();
                        //console.log("user result", userResult);
                    
                        return {
                            label: template.label,
                            created_by: userResult.display_name,
                            user_uri: `https://orkg.org/u/${template.created_by}`,
                            id: template.id,
                            uri: `https://orkg.org/template/${template.id}`,
                            numberOfInstances: 0 // todo change
                        };
                        }))
                    );
                }

                setResults(updatedResults);
            } else {
                console.error(`Error fetching data: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handlePageIncrement = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handlePageDecrement = () => {
        setCurrentPage(prevPage => prevPage - 1);
    };

    const handleSort = (column) => {
        setCurrentPage(0);
        if (sortCriteria.column === column) {
            setSortCriteria({
                ...sortCriteria,
                order: sortCriteria.order === 'asc' ? 'desc' : 'asc'
            });
        } else {
            setSortCriteria({
                column,
                order: 'asc'
            });
        }
    };

    const indexOfLastElement = (currentPage + 1) * elementsPerPage;
    const indexOfFirstElement = indexOfLastElement - elementsPerPage;
    const maxPages = Math.ceil(results.length / elementsPerPage);

    const sortedResults = useMemo(() => {    
        const compareFunction = (a, b) => {
            const { column, order } = sortCriteria;
        
            if (column === 'label') {
                const valueA = a[column].toLowerCase();
                const valueB = b[column].toLowerCase();
                return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            } else {
                const valueA = typeof a[column] === 'string' ? a[column].toLowerCase() : a[column];
                const valueB = typeof b[column] === 'string' ? b[column].toLowerCase() : b[column];
        
                if (order === 'asc') {
                    return valueA < valueB ? -1 : 1;
                } else {
                    return valueA > valueB ? -1 : 1;
                }
            }
        };
        
        return [...results].sort(compareFunction);
    }, [results, sortCriteria]);
    // Dynamically calculate currentElements based on the current page
    const currentElements = sortedResults.slice(indexOfFirstElement, indexOfLastElement);

    return (
        <>
        <Card >
            <Card.Body >
                <Card.Title>Templates</Card.Title>
                <p>Here you can statistics about the template usage.</p>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th> Template label
                                <button onClick={() => handleSort('label')}>
                                {sortCriteria.column === 'label' ? (
                                    sortCriteria.order == 'asc' ? (
                                    <FontAwesomeIcon icon={faArrowUp} />
                                    ) : (
                                    <FontAwesomeIcon icon={faArrowDown} />
                                    )
                                ) : (
                                    <>
                                    <FontAwesomeIcon icon={faArrowUp} />
                                    <FontAwesomeIcon icon={faArrowDown} />
                                    </>
                                )}
                                </button>
                            </th>

                            <th>
                            Created by{' '}
                            <button onClick={() => handleSort('created_by')}>
                                {sortCriteria.column === 'created_by' ? (
                                    sortCriteria.order === 'asc' ? (
                                        <FontAwesomeIcon icon={faArrowUp} />
                                    ) : (
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    )
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faArrowUp} />
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    </>
                                )}
                            </button>
                        </th>
                        <th>
                            Number of uses{' '}
                            <button onClick={() => handleSort('numberOfInstances')}>
                                {sortCriteria.column === 'numberOfInstances' ? (
                                    sortCriteria.order === 'asc' ? (
                                        <FontAwesomeIcon icon={faArrowUp} />
                                    ) : (
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    )
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faArrowUp} />
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    </>
                                )}
                            </button>
                        </th>
                            <th>Number of uses by author</th>
                            <th>Number of uses by others</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentElements.map((template, index) => (
                            <tr key={index}>
                                <td><a href={template.uri} target="_blank" rel="noopener noreferrer">{template.label}</a></td>
                                <td><a href={template.user_uri} target="_blank" rel="noopener noreferrer">{template.created_by}</a></td>
                                <td>{template.numberOfInstances}</td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Row>
                    <Col>Currently on page {currentPage + 1} of {totalPages}</Col>
                    <Col>
                        <Pagination>
                            <Pagination.Prev onClick={handlePageDecrement} disabled={currentPage === 0} />
                            <Pagination.Next onClick={handlePageIncrement} disabled={currentPage === totalPages - 1} />
                        </Pagination>
                    </Col>
                </Row>

                </Card.Body>
            </Card>
        </>
    );
}

export default Templates;


/*updatedResults.push(
    ...await Promise.all(pageResult.content.map(async template => {
    const response = await fetch(`https://orkg.org/api/user/${template.created_by}`);
    const userResult = await response.json();
    console.log("user result", userResult);

    return {
        label: template.label,
        created_by: template.created_by,
        id: template.id,
        uri: `https://orkg.org/template/${template.id}`,
        numberOfInstances: 0 // todo change
    };
    }))
);
}*/

/*
updatedResults = updatedResults.concat(pageResult.content.map(template => ({
                        label: template.label,
                        created_by: template.created_by,
                        id: template.id,
                        uri: `https://orkg.org/template/${template.id}`,
                        numberOfInstances: 0 // todo change
                    })));*/
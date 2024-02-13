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
    const [templatesByAuthor, setTemplatesByAuthor] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortCriteria, setSortCriteria] = useState({ column: '', order: 'asc' }); 
    const [sortCriteriaTemplates, setSortCriteriaTemplates] = useState({ column: '', order: 'asc' }); 
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [selectedAuthorTemplates, setSelectedAuthorTemplates] = useState([]);

    useEffect(() => {
        fetchData();
    }, [currentPage, sortCriteria]);

    useEffect(()=>{
        countTemplatesByAuthor();
    },[results]);

    useEffect(() => {
        // Update selectedAuthorTemplates when the selectedAuthor changes
        if (selectedAuthor) {
            setSelectedAuthorTemplates(
                templatesByAuthor.find((author) => author.author === selectedAuthor)?.templatesCreated || []
            );
        }
    }, [selectedAuthor, templatesByAuthor]);

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
                    
                        return {
                            label: template.label,
                            created_by: userResult.display_name == null? "ORKG internal": userResult.display_name,
                            user_uri: `https://orkg.org/u/${template.created_by}`,
                            id: template.id,
                            uri: `https://orkg.org/template/${template.id}`,
                            created_at: template.created_at
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

    function formatDateString(inputDateString) {
        const date = new Date(inputDateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
    
        return `${day}-${month}-${year}`;
    }

    const countTemplatesByAuthor=() =>{
        let countTemplates = [];
        console.log("template results", results);
        results.forEach(item =>{
            const alreadyAuthor = countTemplates.find((author) => author.author === item.created_by);
            if(alreadyAuthor){
                alreadyAuthor.templatesCreated.push({label: item.label, id: item.id, uri: item.uri, created_at: item.created_at});
            }else{
                countTemplates.push(
                    {
                        author: item.created_by,
                        user_uri: item.user_uri,
                        templatesCreated: [{label: item.label, id: item.id, uri: item.uri, created_at: item.created_at,}]
                    }
                );
            }
        })
        setTemplatesByAuthor(countTemplates);
    }

    const handleAuthorClick = (author) => {
        setSelectedAuthor(author);
    };

    const handleSort = (column) => {
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

    const handleSortTemplate = (column) => {
        if (sortCriteriaTemplates.column === column) {
            setSortCriteriaTemplates({
                ...sortCriteriaTemplates,
                order: sortCriteriaTemplates.order === 'asc' ? 'desc' : 'asc'
            });
        } else {
            setSortCriteriaTemplates({
                column,
                order: 'asc'
            });
        }
    };

    const sortedResults = useMemo(() => {   
        if (templatesByAuthor.length === 0) {
            return templatesByAuthor; // Return unsorted array if it's empty
        }
        const compareFunction = (a, b) => {
            const { column, order } = sortCriteria;
        
            if (column === 'author' ) {
                const valueA = a[column].toLowerCase();
                const valueB = b[column].toLowerCase();
                return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            } else if(column == 'count') {
                const valueA = a.templatesCreated.length;
                const valueB = b.templatesCreated.length;

                return order === 'asc' ? valueA - valueB : valueB - valueA;
            }
        };
        
        return [...templatesByAuthor].sort(compareFunction);
    }, [templatesByAuthor, sortCriteria]);

    const sortedTemplates = useMemo(()=>{
        const compareFunction = (a, b) => {
            if (selectedAuthorTemplates.length === 0) {
                return selectedAuthorTemplates; // Return unsorted array if it's empty
            }
            const { column, order } = sortCriteriaTemplates;
        
            if (column === 'template' ) {
                const valueA = a.label.toLowerCase();
                const valueB = b.label.toLowerCase();
                return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            } else if(column == 'date'){
                const dateA = new Date(a.created_at).getTime() || 0;
                const dateB = new Date(b.created_at).getTime() || 0;

                return order === 'asc' ? dateA - dateB : dateB - dateA;
            }
        };
        
        return [...selectedAuthorTemplates].sort(compareFunction);
    }, [selectedAuthorTemplates, sortCriteriaTemplates])
 
  

    return (
        <>
        <Card >
            <Card.Body >
                <Card.Title>Templates</Card.Title>
                <p>Here you can statistics about the template usage.</p>

                <Row>
                    <Col>
                    <div className="templatelist listgroupcursor">
                    <div className="table-container">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                            <th>
                                Created by{' '}
                                <button onClick={() => handleSort('author')}>
                                    {sortCriteria.column === 'author' ? (
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
                            <th> Templates created
                                    <button onClick={() => handleSort('count')}>
                                    {sortCriteria.column === 'count' ? (
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
                            </tr>
                        </thead>
                        <tbody>
                            {sortedResults.map((template, index) => (
                                <tr key={index} onClick={()=> handleAuthorClick(template.author)}>
                                    <td><a href={template.user_uri} target="_blank" rel="noopener noreferrer">{template.author}</a></td>
                                    <td>{template.templatesCreated.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    </div>
                    </div>
                    </Col>

                    <Col>
                        {selectedAuthor && (
                        <>
                        <p>Templates by <span style={{ fontWeight: 'bold' }}>{selectedAuthor}</span> ({selectedAuthorTemplates.length})</p>
                        <div className="templatelist listgroupcursor">
                        <div className="table-container"> 
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Template Label
                                        <button onClick={() => handleSortTemplate('template')}>
                                        {sortCriteriaTemplates.column === 'template' ? (
                                            sortCriteriaTemplates.order == 'asc' ? (
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
                                        <th>Created at
                                        <button onClick={() => handleSortTemplate('date')}>
                                        {sortCriteriaTemplates.column === 'date' ? (
                                            sortCriteriaTemplates.order == 'asc' ? (
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Map over the templates for the selected author */}
                                    {sortedTemplates.map((template, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <a
                                                        href={template.uri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {template.label}
                                                    </a>
                                                </td>
                                                <td>{formatDateString(template.created_at)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        </div>
                        </div>
                        </>
                        )}
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
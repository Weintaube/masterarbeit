import { React, useEffect, useState, useMemo } from "react";
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Card } from "react-bootstrap";
import { count } from "d3";

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
        console.log("template use effect");
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
                        //console.log("user result", userResult);
                    
                        return {
                            label: template.label,
                            created_by: userResult.display_name == null? "ORKG internal": userResult.display_name,
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

    const countTemplatesByAuthor=() =>{
        let countTemplates = [];
        console.log("template results", results);
        results.forEach(item =>{
            const alreadyAuthor = countTemplates.find((author) => author.author === item.created_by);
            if(alreadyAuthor){
                alreadyAuthor.templatesCreated.push({label: item.label, id: item.id, uri: item.uri});
            }else{
                countTemplates.push(
                    {
                        author: item.created_by,
                        user_uri: item.user_uri,
                        templatesCreated: [{label: item.label, id: item.id, uri: item.uri}]
                    }
                );
            }
        })
        console.log("templates count", countTemplates);
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

    const handleSortTemplate = () => {
        setSortCriteriaTemplates({
            ...sortCriteriaTemplates,
            column: 'template',
            order: sortCriteriaTemplates.order === 'asc' ? 'desc' : 'asc'
        });
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
    // Dynamically calculate currentElements based on the current page

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
                {selectedAuthor && (
                    <div className="template-details">
                        <h5>Templates by {selectedAuthor}</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Template Label
                                    <button onClick={() => handleSortTemplate()}>
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
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </div>
                )}
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
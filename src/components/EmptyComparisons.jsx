import { useEffect, useState, useMemo } from "react";
import store from './storing';
import { ListGroup } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Card } from "react-bootstrap";


function EmptyComparisons(){

    const [comparisonIDs, setComparisonIDs] = useState([]);
    const [comparisonCells, setComparisonCells] = useState([]);
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [sparqlendpointURL, , ] = store.useState("sparqlendpointURL");
    const [elementsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastElement = currentPage * elementsPerPage;
    const indexOfFirstElement = indexOfLastElement - elementsPerPage;
    const maxPages = Math.ceil(comparisonCells.length / elementsPerPage);
    
    const [sortCriteria, setSortCriteria] = useState({ column: '', order: 'asc' });

    useEffect(()=>{
        const fetchbothdata = async()=>{
            fetchSPARQLData(); //fetches the ids of the comparisons
        }
        fetchbothdata();
    },[]);

    useEffect(()=>{
        fetchData(); //fetches empty cells in comparisons
    },[comparisonIDs]);

    const fetchSPARQLData = async () => {
        try {
          const query = encodeURIComponent(`
            ${prefixes}  
            SELECT ?comparison (MIN(?label) AS ?uniqueLabel)
                WHERE {
                    ?comparison rdf:type orkgc:Comparison;
                                rdfs:label ?label.
                }
            GROUP BY ?comparison 
            `);

            console.log("before fetch");
        
        const url = `http://localhost:5000/sparql?url=${sparqlendpointURL}&query=${query}`;
        const response = await fetch(url);
        if(response.ok){ //Anfrage erfolgreich Statuscode 200
            const result = await response.json();
            console.log("results sparql",result);
            const compList = [];
            for(var i=0;i<result.results.bindings.length;i++){
                var itemID = result.results.bindings[i].comparison.value;
                var itemlabel = result.results.bindings[i].uniqueLabel.value;
                compList.push({
                    key: itemID.substring(itemID.lastIndexOf('/')+1),
                    value: itemID,
                    label: itemlabel
                });
            }
            console.log(compList);
            setComparisonIDs(compList);
            
        }else{
            throw new Error("Error while requesting SPARQL data.")
        }
        } catch (error) {
            console.error(error);
        }
    };
 
    const fetchData = async()=>{
        console.log("fetch data of comp");
        const newCompList = [];
        const missingComps = [];
        if(comparisonIDs.length>0){
            for(var index in comparisonIDs){
                var item = comparisonIDs[index];
                try{
                    //then loop through and fetch from simcomp api
                    const response = await fetch(`https://orkg.org/simcomp/thing/?thing_type=comparison&thing_key=${item.key}`);
                    
                    if(response.ok){
                        const result = await response.json();
                        
                        const table = result.payload.thing.data.data;
                        var predicates = result.payload.thing.config.predicates;
                        //console.log("empty comparisons id", item.key);
                        //console.log("empty comparisons", predicates);

                        if(predicates.length > 0){ //predicates list got customized to the UI view
                            //for the trivial case, that I have a fitting predicate list with UI
                            var emptyCellCount = 0
                            var allContributions = result.payload.thing.config.contributions.length;
                            predicates.forEach(predicate =>{ //loop through array of predicates listed in the table UI 
                                if (table[predicate] && Array.isArray(table[predicate])) { //because some props are merged
                                    table[predicate].forEach(element =>{ // run through list of predicates (more than in UI), check if they contain the predicate
                                        if(element && element.length > 0 && Object.keys(element[0]).length === 0){
                                            emptyCellCount = emptyCellCount+1;
                                        }
                                    })
                                }
                            })
                            const newItem = {
                                key: item.key,
                                uri: `https://orkg.org/comparison/${item.key}/`,
                                value: item.value,
                                label: item.label,
                                emptyCells: emptyCellCount,
                                allCells: predicates.length * allContributions,
                                properties: predicates.length,
                                contributions: allContributions
                            }
                            newCompList.push(newItem);
    

                        }else{ //otherwise all the raw predicates are listed, only the ones with n_contributions are shown in the UI
                            //for non-trivial case where I have all the raw comparison data
                            var filledCells = 0
                            var numberPredicates = 0
                            var allContributions = result.payload.thing.config.contributions.length;

                            predicates = result.payload.thing.data.predicates; 
                            predicates.forEach(predicate =>{
                                if(predicate.n_contributions > 1){ //we only look at the ones with n_contributions > 1 as they are shown in the UI
                                    numberPredicates = numberPredicates + 1;
                                    filledCells = filledCells + predicate.n_contributions; //how many contributions are implementing this specific predicate
                                }
                            })
                            
                            var allCells = allContributions * numberPredicates;
                            const newItem = {
                                key: item.key,
                                uri: `https://orkg.org/comparison/${item.key}/`,
                                value: item.value,
                                label: item.label,
                                emptyCells: allCells - filledCells,
                                allCells: allCells,
                                properties: numberPredicates,
                                contributions: allContributions
                            }
                            newCompList.push(newItem);
    
                        }
                        
                        //console.log("cell stuff", result);
                        
                    }else{
                        missingComps.push(item.key);
                    }

                }catch(error){
                    //some comparisons still throwing a 404, as they were created during down time of server
                    //I keep track of the broken ones in this list!
                    console.error(error);
                }
            }
        }

        setComparisonCells(newCompList);
        console.log("comparisons end of loop", newCompList);
        console.log("missing comparisons end of loop", missingComps);
        
    }

    const handleSort = (column) => {
        setCurrentPage(1);
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

    const sortedComparisonCells = useMemo(() => {
        const { column, order } = sortCriteria;

        const compareFunction = (a, b) => {

            if (column === 'percentage') { 
                const percentageA = parseFloat((a.emptyCells / a.allCells) * 100); 
                const percentageB = parseFloat((b.emptyCells / b.allCells) * 100); 
    
                if (order === 'asc') {
                    return percentageA - percentageB; 
                } else {
                    return percentageB - percentageA; 
                }
            } else {
                if (order === 'asc') {
                    return a[column] - b[column];
                } else {
                    return b[column] - a[column];
                }
            }
        };

        return [...comparisonCells].sort(compareFunction);
    }, [comparisonCells, sortCriteria]);

    
    const currentElements = sortedComparisonCells;


    return( <>
    <Card >
        <Card.Body >
            <Card.Title>Comparisons</Card.Title>
            <p>Here you can see statistics about the comparison modeling. All comparisons: {currentElements.length}. </p>
            
            <div className="comparisonlist listgroupcursor">
            <div className="table-container">
            <Table striped bordered hover style={{ maxWidth: '100%', overflowY: 'hidden' }}>
            <thead>
            <tr>
            <th>Comparison label</th>
            <th>Number of properties
            <button onClick={() => handleSort('properties')}>
                {sortCriteria.column === 'properties' ? (
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
            <th>Number of contributions
            <button onClick={() => handleSort('contributions')}>
                {sortCriteria.column === 'contributions' ? (
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
            <th> Number of all cells
                <button onClick={() => handleSort('allCells')}>
                {sortCriteria.column === 'allCells' ? (
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
            <th>Number of empty cells
            <button onClick={() => handleSort('emptyCells')}>
                {sortCriteria.column === 'emptyCells' ? (
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
            <th>Percentage of empty cells
            <button onClick={() => handleSort('percentage')}>
                {sortCriteria.column === 'percentage' ? (
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
            </tr>
            </thead>
            <tbody>
                {currentElements.map((item, index) => (
                    <tr key={index}>
                        <td><a href={item.uri} target="_blank" rel="noopener noreferrer">{item.label}</a> </td>
                        <td> {item.properties} </td>
                        <td> {item.contributions} </td>
                        <td> {item.allCells} </td>
                        <td> {item.emptyCells} </td>
                        <td> {((item.emptyCells / item.allCells)*100).toFixed(2)}% </td>
                    </tr>
                )
                )}
            </tbody>
            </Table>
            </div>
            </div>
        </Card.Body>
        </Card>
        </>

    )

}

export default EmptyComparisons;
import { useEffect, useState } from "react";
import store from './storing';
import { ListGroup } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


function EmptyComparisons(){

    const [comparisonIDs, setComparisonIDs] = useState([]);
    const [comparisonCells, setComparisonCells] = useState([]);
    const [prefixes, , ] = store.useState("endpointPrefixes");
    const [endpointURL, , ] = store.useState("endpointURL");


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
        
        const url = `http://localhost:5000/sparql?url=${endpointURL}&query=${query}`;
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

    //if(comparisonIDs.length>0){
        //for(var item in comparisonIDs){
    const fetchData = async()=>{
        console.log("fetch data of comp");
        const newCompList = [];
        const missingComps = [];
        if(comparisonIDs.length>0){
            for(var index in comparisonIDs){
                var item = comparisonIDs[index];
                try{
                    //then loop through and fetch from simcomp api
                    //R12251
                    //geht es nur mit Ids, die aus 5 Zahlen bestehen???
                    const response = await fetch(`https://orkg.org/simcomp/thing/?thing_type=comparison&thing_key=${item.key}`);
                    
                    if(response.ok){
                        const result = await response.json();
                        const predicates = result.payload.thing.config.predicates
                        const table = result.payload.thing.data.data
        
                        var emptyCellCount = 0
                        var allCellCount = 0
        
                        predicates.forEach(predicate =>{ //loop through array of predicates listed in the table UI
                            if (table[predicate] && Array.isArray(table[predicate])) { //because some props are merged
                                table[predicate].forEach(element =>{ // run through list of predicates (more than in UI), check if they contain the predicate
                                    allCellCount = allCellCount + 1;
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
                            allCells: allCellCount
                        }
                        newCompList.push(newItem);

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

    return( <>
        <Table striped bordered hover>
        <thead>
        <tr>
          <th>Comparison</th>
          <th>Number of all cells</th>
          <th>Number of empty cells</th>
          <th>Percentage of empty cells</th>
        </tr>
        </thead>
        <tbody>
            {comparisonCells.map((item, index) => (
                <tr>
                    <td><a href={item.uri} target="_blank" rel="noopener noreferrer">{item.label}</a> </td>
                    <td> {item.allCells} </td>
                    <td> {item.emptyCells} </td>
                    <td> {((item.emptyCells / item.allCells)*100).toFixed(2)}% </td>
                </tr>
            )
            )}
        </tbody>
        </Table>
        <Row>
            <Col>Currently page x from y</Col>
            <Col>
                <Pagination>
                    <Pagination.Prev />
                    <Pagination.Next />
                </Pagination>     
            </Col>
        </Row>
        </>

    )

}

export default EmptyComparisons;
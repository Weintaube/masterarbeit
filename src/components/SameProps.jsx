import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import "bootstrap/dist/css/bootstrap.min.css"; 


function SameProps(){

    const [allPredicates, setAllPredicates] = useState([]);
    const [duplicatePredicates, setDuplicates] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isItemSelected, setIsItemSelected] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
          const result = await fetchAllPages();
          console.log("same props", result);
          setAllPredicates(result);
        };
    
        fetchData();
      }, []);

      useEffect(() =>{
        setDuplicates(collectDuplicates(allPredicates));
      },[allPredicates]);

    const fetchAllPages = async()=>{
        let allResults = [];
        let currentPage = 0;
        let totalPages = 1; // Setze eine Anfangszahl

        while (currentPage < totalPages) {
            try {
                const response = await fetch(`https://orkg.org/api/predicates/?sort=label,asc&page=${currentPage}`);
      
                if (response.ok) {
                    const result = await response.json();
                    allResults = allResults.concat(result.content); // Füge die Ergebnisse der aktuellen Seite hinzu
                    totalPages = result.totalPages; // Aktualisiere die Anzahl der Seiten
                    currentPage++; // Gehe zur nächsten Seite
                } else {
                    console.error(`Fehler beim Abrufen der Seite ${currentPage}`);
                    break; // Stoppe die Schleife im Falle eines Fehlers
                }
            } catch (error) {
                console.error(`Fehler beim Abrufen der Seite ${currentPage}: ${error}`);
                break; 
            }
        }
        return allResults;
    }

    const collectDuplicates = sortedList => {
        const duplicatesMap = {};
      
        sortedList.forEach(item => {
          if (!duplicatesMap[item.label]) {
            duplicatesMap[item.label] = { label: item.label, ids: [] };
          }
          duplicatesMap[item.label].ids.push(item.id);
        });
      
        // Filtere nur Einträge mit mehr als einer ID (Duplikate)
        const duplicatePredicates = Object.values(duplicatesMap).filter(item => item.ids.length > 1);
        console.log("duplicate predicates", duplicatePredicates);
        return duplicatePredicates;
      };   

    function handleCellClick(searchLabel){
        console.log("handle cell click", searchLabel);
        setSelectedItem(duplicatePredicates.find(item => item.label == searchLabel));
        setIsItemSelected(true);
    }

    return(
        <>
        <Row>
            <Col>
                Duplicate Predicates ({duplicatePredicates.length})
                <ListGroup className="duplicateList">
                    {duplicatePredicates.map(item => <ListGroup.Item className="listgroupcursor" key={item.label} onClick={() => handleCellClick(item.label)}>{item.label} ({item.ids.length})</ListGroup.Item>)}
                </ListGroup>
            </Col>
            {isItemSelected?
                <Col>
                {selectedItem.label}
                    <ListGroup className="duplicateList">
                        {selectedItem.ids.map(id => <ListGroup.Item key={id} action href={`https://orkg.org/property/${id}`}>{id}</ListGroup.Item>)}
                    </ListGroup>    
                </Col>
            :null}

        </Row>
        </>
    );
}

export default SameProps;
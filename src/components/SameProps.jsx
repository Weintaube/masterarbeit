import { useEffect, useState } from "react";
import { CloseButton, ListGroup } from "react-bootstrap";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import "bootstrap/dist/css/bootstrap.min.css"; 


function SameProps(){

    const [allPredicates, setAllPredicates] = useState([]);
    const [duplicatePredicates, setDuplicates] = useState([]);
    const [popoverContent, setPopoverContent] = useState(null);
    const [popoverHidden, setPopoverHidden] = useState(false);

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

    const handleCellClick = (item) => {
        const content = (
          <Popover className="duplicateList" id={`popover-${item.label}`}>
            <Popover.Header as="h3">{item.label}</Popover.Header>
            <Popover.Body>
              <ListGroup>
                {item.ids.map(id => (
                  <ListGroup.Item key={id} action href={`https://orkg.org/property/${id}`}>
                    {id}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Popover.Body>
          </Popover>
        );
    
        setPopoverContent(content);
      };

    const handlePopoverClose = () => {
      console.log("fired on click");
      setPopoverContent(null);
    };

    const handleOverlayClose = () => {
      console.log("fired overlay hidden");
      setPopoverHidden(false);
    };


    return(
        <>
        <Row>
            <Col>
                Duplicate Predicates ({duplicatePredicates.length})
                <OverlayTrigger
                    trigger="click"
                    placement="right-start"
                    overlay={popoverContent}
                    rootClose
                    onHide={handlePopoverClose}
                >
                    <ListGroup className="duplicateList">
                        {duplicatePredicates.map(item => (
                            <ListGroup.Item
                                key={item.label}
                                className="listgroupcursor"
                                onClick={() => handleCellClick(item)}
                            >
                                {item.label} ({item.ids.length})
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </OverlayTrigger>
            </Col>
        </Row>       
        </>
    );
}

export default SameProps;

 /*<Row>
            <Col>
            Duplicate Predicates ({duplicatePredicates.length})
            <ListGroup className="duplicateList">
                {duplicatePredicates.map(item => (
                <OverlayTrigger
                    className="listgroupstyle"
                    key={item.label}
                    trigger="click"
                    rootClose
                    onHide={handleOverlayClose}
                    placement="right-start"
                    overlay={
                    <Popover className="popover-stick" data-bs-theme="dark" id={`popover-${item.label}`}>
                        <Popover.Header>{item.label} <CloseButton onClick={handlePopoverClose}/></Popover.Header>
                        <Popover.Body>
                            <ListGroup className="listgroupstyle">
                                {item.ids.map(id => (
                                <ListGroup.Item key={id} action href={`https://orkg.org/property/${id}`}>
                                    {id}
                                </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Popover.Body>
                    </Popover>
                    }
                >
                    <ListGroup.Item className="listgroupcursor" onClick={() => handleCellClick(item)}>
                    {item.label} ({item.ids.length})
                    </ListGroup.Item>
                </OverlayTrigger>
                ))}
            </ListGroup>
            </Col>
        </Row>*/
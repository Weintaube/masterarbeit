// Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect, useState } from "react";
import CytoscapeComponent from 'react-cytoscapejs';
import Card from 'react-bootstrap/Card';
import { Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import chroma from 'chroma-js';
import Table from 'react-bootstrap/Table';

function MatomoStatistics() {
  const [diagramData, setDiagramData] = useState([]);
  const [selectedEdge, setSelectedEdge] = useState([]); //todo make label that shows current edge with source, target and label
  const [startDate, setStartDate] = useState('today'); // State for start date
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('day'); //range, day
  const [fetchOneDay, setFetchOneDay] = useState(true); // State for the checkbox
  const [nodeSpacing, setNodeSpacing] = useState(6);
  const [layoutDiagram, setLayoutDiagram] = useState('breadthfirst');
  const [labelPosition, setLabelPosition] = useState({ top: 0, left: 0 });
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [hoveredEdgeLabel, setHoveredEdgeLabel] = useState(''); 
  const [showExternalLinks, setShowExternalLinks] = useState(true);
  const [maxLabel, setMaxLabel] = useState(0); //the maximum number of transitions of an edge for the color gradient
  const colorLegend = ['darkslateblue', 'dodgerblue', 'lightseagreen', 'khaki', 'peru', 'orangered']; 
  const [clickedNodeInfo, setClickedNodeInfo] = useState({
    clickedNode: null,
    outgoingTransitions: [],
    incomingTransitions: []
  });
  
  const TOKEN = '2f1a8c6a07609a76907dd8111dff26ed';
  const matomoEndpoint = 'https://support.tib.eu/piwik/index.php';
  const siteID = 29;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => { //sets the maximum label of an edge as soon as data is fetched
    const edgeLabels = diagramData
      .filter(element => element.data.source && element.data.target)
      .map(edge => parseInt(edge.data.label || 0));
  
    const max = Math.max(...edgeLabels);
    setMaxLabel(max || 0);
  }, [diagramData]);

  const fetchData = async () => {
    const matomoParams = {
      idSite: siteID,
      period: period,
      date: startDate,
      format: 'JSON',
      module: 'API',
      method: 'Live.getLastVisitsDetails',
      token_auth: TOKEN,
      expanded: 1,
      filter_limit: -1
    };

    if(period == 'day'){
      matomoParams.date = startDate;

    }else if(period == 'range'){
      matomoParams.date = `${startDate},${endDate}`;
    }
    
    try {
      const headers = new Headers();
      headers.append('Origin', 'http://localhost:3000');
      headers.append('X-Requested-With', 'XMLHttpRequest');

      const requestOptions = {
        method: 'GET',
        headers: headers,
      };
      const queryParams = new URLSearchParams(matomoParams).toString();
      const matomoURL = `${matomoEndpoint}?${queryParams}`;

      const response = await fetch(`http://localhost:5000/matomo?url=${encodeURIComponent(matomoURL)}`, requestOptions);

      if (!response.ok) {
        console.error('Matomo API request failed:', response.status, response.statusText);
      }
      const data = await response.json();
      console.log("MATOMO DATA", data);

      const transformedData = [];

      data.forEach((object) => {
        const actionsData = object.actionDetails;
        //console.log("matomo action data", actionsData);

        for (let i = 0; i < actionsData.length - 1; i++) {
          let currentAction = actionsData[i].subtitle;
          let nextAction = actionsData[i + 1].subtitle;
          //console.log("matomo current action", currentAction);
          //console.log("matomo next action", nextAction);

          if (currentAction === null || nextAction === null) {
            continue;
          }

          let currentActionPart = currentAction;
          let nextActionPart = nextAction;

          const regex = /orkg\.org\/([^\/]+)/;
          const regexContribution = /^contribution-editor/;
          const currentMatch = currentAction.match(regex);
          const nextMatch = nextAction.match(regex);

          if (currentAction === "https://www.orkg.org/") {
            currentActionPart = "ORKG main";
          } else if (currentMatch) {
            currentActionPart = currentMatch[1];
            if (currentActionPart === "u") {
              currentActionPart = "user";
            }else if(currentActionPart.match(regexContribution)){
              currentActionPart = "contribution editor";
            }
          }

          if (nextAction === "https://www.orkg.org/") {
            nextActionPart = "ORKG main";
          } else if (nextMatch) {
            nextActionPart = nextMatch[1];
            if (nextActionPart === "u") {
              nextActionPart = "user";
            }else if(nextActionPart.match(regexContribution)){
              nextActionPart = "contribution editor";
            }

          }

          if (currentActionPart !== nextActionPart) {

            const sourceId = `node_${currentActionPart}`;
            const targetId = `node_${nextActionPart}`;

            const edgeId = `${sourceId}>${targetId}`;

            const nodeSource = {
              data: { id: sourceId,
              label: currentActionPart
              },
            };

            const nodeTarget = {
              data: { id: targetId,
                      label: nextActionPart
                    },
            };

            const edge = {
              data: { id: edgeId, 
                      source: sourceId, 
                      target: targetId,
                      label: '1'},
            };

            const existingNodeSource = transformedData.find(
              (t) => t.data.id === nodeSource.data.id
            );

            //check for duplicate source nodes
        
            if (!existingNodeSource) { 
              transformedData.push(nodeSource);
            }

            //check for duplicate target nodes
            const existingNodeTarget = transformedData.find(
              (t) => t.data.id === nodeTarget.data.id
            );

            if (!existingNodeTarget) { 
              transformedData.push(nodeTarget);
            }

            //check for duplicate edges
            const existingEdge = transformedData.find(
              (t)  => {
              return t.data.id === edge.data.id
              });

            if (existingEdge) { // If it exists, increment the label (count)
              existingEdge.data.label = `${parseInt(existingEdge.data.label) + 1}`;

            } else { // If it doesn't exist, add the new edge to the list
              transformedData.push(edge);
            }
          }
        }
      });


      /*const uniqueNodes = transformedData.filter((item, index, self) =>
        index === self.findIndex((t) => t.data.id === item.data.id)
      );
      console.log("MATOMO Transformed", uniqueNodes);
      setDiagramData(uniqueNodes);*/
      console.log("MATOMO Data transformed", transformedData);
      setDiagramData(transformedData);

    } catch (error) {
      console.error('Error fetching matomo data.', error);
    }
  };

  const handleSelect = (event) => {
    const selected = event.target;

    if (selected) {
      const edge = selected.edges();
      console.log("selected ", edge[0].data());
      setSelectedEdge(edge[0].data().id);
    }else{
      setSelectedEdge([]);
    }
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    setFetchOneDay(event.target.checked);

    // If checkbox is checked, disable end date and set period to 'day'
    if (event.target.checked) {
      setEndDate('');
      setPeriod('day');
    } else {
      // If checkbox is unchecked, set period back to 'range'
      setPeriod('range');
    }
  };

  // Create elements based on transformed data
  const elements = diagramData.map((node) => ({ data: node.data }));


  //console.log("MATOMO diagram data mapped", elements);

  const darkModeStyles = [
    {
      selector: 'node',
      style: {
        'background-color': '#FFFFFF', // Dark background color for nodes
        'label': 'data(label)',
        'text-wrap': 'wrap',
        'text-max-width': '10px',
        'color': '#e86161', // Text color for nodes
        'text-background-color': '#494949',
        'text-background-opacity': 1  ,
      }
    },
    {
      selector: 'edge',
      style: {
        'line-color': '#dbdde5', // Color of edges Todo change 
        'target-arrow-color': '#dbdde5', // Color of arrowheads on edges
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'color': '#e86161', //text color for edge label
        'font-size': '15',
        'text-background-color': '#494949',
        'text-opacity': 0, //todo remove if labels should be visible all time
        'text-background-opacity': 0,
        'line-color': (ele) => chroma.scale(colorLegend).domain([0, maxLabel])(ele.data('label')).hex(),
        'target-arrow-color': (ele) => chroma.scale(colorLegend).domain([0, maxLabel])(ele.data('label')).hex(),
      }
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#e86161', // Color for selected nodes
        'line-color': '#e86161', // Color for selected edges'label': 'data(label)
        'target-arrow-color': '#e86161'
      }
    },
    {
      selector: '.external-node',
      style: {
        display: 'none', // Make external nodes invisible
      }
    },
  ];

  const handleMouseover = (event) => {
    const edge = event.target;
    const label = edge.data('label');
  
    // Update the state with the hovered edge label and position
    setHoveredEdgeLabel(label);
    setLabelPosition({ top: event.originalEvent.clientY, left: event.originalEvent.clientX });
    setIsLabelVisible(true);
  };
  
  // Attach an event listener for mouseout on edges
  const handleMouseout = () => {
    // Hide the label on mouseout
    setIsLabelVisible(false);
  };

  const toggleExternalLinks = () => {
    setShowExternalLinks(!showExternalLinks);
    console.log("toggle external/internal links");
  };

  const calculateLabelRanges = () => {
    const labelRanges = [];
    const segmentCount = colorLegend.length;
  
    const segmentSize = Math.floor(maxLabel / segmentCount);
    const remainder = maxLabel % segmentCount;
  
    for (let i = 0; i < segmentCount; i++) {
      const startRange = i * segmentSize + Math.min(i, remainder);
      const endRange = (i + 1) * segmentSize + Math.min(i + 1, remainder) - 1;
  
      if (i === segmentCount - 1) {
        // Adjust the end range for the last segment
        labelRanges.push({
          start: startRange,
          end: maxLabel,
        });
      } else {
        labelRanges.push({
          start: startRange,
          end: endRange,
        });
      }
    }
  
    return labelRanges;
  };
  
  const labelRanges = calculateLabelRanges();

  const handleNodeClick = (event) => {
    const clickedNode = event.target;
    const nodeData = clickedNode.data();

    // Retrieve incoming edges (transitions)
    const incomingEdges = clickedNode.incomers('edge');
    const incomingTransitions = incomingEdges.map(edge => edge.data());

    // Retrieve outgoing edges (transitions)
    const outgoingEdges = clickedNode.outgoers('edge');
    const outgoingTransitions = outgoingEdges.map(edge => edge.data());

    // Update the state with the clicked node information
    setClickedNodeInfo({
      clickedNode: nodeData,
      incomingTransitions: incomingTransitions,
      outgoingTransitions: outgoingTransitions
    });
  };


  try {
    return (
      <>
      {isLabelVisible && (
        <div
          id="edgeLabelDiv"
          style={{
            position: 'absolute',
            top: labelPosition.top,
            left: labelPosition.left,
            backgroundColor: 'grey',
            padding: '5px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            zIndex: 999, // Set a high z-index to ensure it's above other elements
          }}
        >
          {hoveredEdgeLabel}
        </div>
      )}
      <Card >
            <Card.Body >
              <Card.Title>Matomo Visitor Data</Card.Title> 
        <Row>
          <Col xs={12} md={4}>
          {/*Date selection form*/}
          <div>
            <p>Please enter dates in the format YYYY-MM-DD.</p>
            <Row>
              <Col>
                <Form.Check
                  type="checkbox"
                  checked={fetchOneDay}
                  onChange={handleCheckboxChange}
                  label="Fetch data only for (one day) the start date"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                <Form.Label>Start Date:</Form.Label>
                  <Form.Control
                    type="text"
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                </Form.Group>
              </Col>

              <Col>
              <Form.Group>
                <Form.Label>End Date:</Form.Label>
                <Form.Control
                  type="text"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabled={fetchOneDay}
                />
              </Form.Group>
              </Col>

              <Col>
                <Button variant="primary" onClick={fetchData}> Fetch Data</Button>
              </Col>
            </Row>
            <Row>
              {/*<h5>Modify the graph:</h5>*/}
              <Col>
                <Form.Group>
                  <Form.Label>Node Spacing:</Form.Label>
                  <Form.Control
                    type="number"
                    value={nodeSpacing}
                    onChange={(e) => setNodeSpacing(parseInt(e.target.value))}
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Label>Select graph layout:</Form.Label>
                <Form.Select 
                  aria-label="selectlayout"
                  value={layoutDiagram}
                  onChange={(e)=>setLayoutDiagram(e.target.value)}>
                  <option value="breadthfirst">breadthfirst</option>
                  <option value="circle">circle</option>
                  <option value="grid">grid</option>
                  <option value="random">random</option>
                </Form.Select>
            </Col>
            </Row>
            <Row>
              <Col>
                <Form.Check
                  type="switch"
                  id="toggleExternalLinks"
                  label="Show External Links (how visitors exit the ORKG)"
                  checked={showExternalLinks}
                  onChange={toggleExternalLinks}
                />
              </Col>
            </Row>

            {/* Display information about the clicked node and its transitions */}
            
            
              <div style={{ marginTop: '20px' }}>
                {clickedNodeInfo.clickedNode && (
                  <div>
                    <h5>Clicked Node: {clickedNodeInfo.clickedNode.label}</h5>
                  </div>
                )}

                {clickedNodeInfo.outgoingTransitions.length > 0 && (
                  <>
                    <h6>Outgoing Transitions:</h6>
                    <div className="listgroupstyle listgroupcursor">
                    <div className="table-container">
                    <Table bordered hover >
                    <thead>
                      <tr>
                        <th>Target node</th>
                        <th>Number of transitions</th>
                      </tr>
                      </thead>
                      <tbody>
                          {clickedNodeInfo.outgoingTransitions.map((transition, index) => (
                            <tr key={index}>
                              <td>{transition.target}</td>
                              <td>{transition.label}</td>
                            </tr>
                          ))}
                      </tbody>
                      </Table>
                      </div>
                      </div>
                    </>
                )}

                  {clickedNodeInfo.incomingTransitions.length > 0 && (
                  <>
                    <h6>Incoming Transitions:</h6>
                    <div className="listgroupstyle listgroupcursor">
                    <div className="table-container">
                    <Table bordered hover >
                    <thead>
                      <tr>
                        <th>Source node</th>
                        <th>Number of transitions</th>
                      </tr>
                      </thead>
                      <tbody>
                          {clickedNodeInfo.incomingTransitions.map((transition, index) => (
                            <tr key={index}>
                              <td>{transition.source}</td>
                              <td>{transition.label}</td>
                            </tr>
                          ))}
                      </tbody>
                      </Table>
                      </div>
                      </div>
                    </>
                )}
                </div>            
        
          </div>
          </Col>

          {/*Right column for diagram*/}
          <Col xs={12} md={8}>
            {/*Color legend*/}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <span>Each segment of the legend represents the number of transitions taken from node to another.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            {colorLegend.map((color, index) => (
              <div key={index} style={{ marginRight: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: color,
                      marginRight: '5px',
                      border: '1px solid #ccc',
                    }}
                  />
                  <span>{labelRanges[index].start} - {labelRanges[index].end}</span>
                 {/*<span>{Math.round((maxLabel / colorLegend.length) * index)}</span>*/}
                </div>
              </div>
            ))}
          </div>
            {/*Cytoscape diagram*/}
            {diagramData.length > 0 && (
              <CytoscapeComponent
                elements={elements}
                layout={{name: layoutDiagram, //circle, cose?, grid
                spacingFactor: nodeSpacing,
                avoidOverlap: true,
                circle:true
                }}
                style={{ width: '100%', height: '700px', display: 'block' }}
                stylesheet={darkModeStyles}
                cy={(cy) => {
                  // Attach event listeners to the cy instance
                  cy.on('tap', 'node', (event) => {
                    const clickedNode = event.target;
                    const nodeData = clickedNode.data();
                    // Retrieve incoming edges (transitions)
                    const incomingEdges = clickedNode.incomers('edge');
                    const incomingTransitions = incomingEdges.map(edge => edge.data());
                    
                    // Retrieve outgoing edges (transitions)
                    const outgoingEdges = clickedNode.outgoers('edge');
                    const outgoingTransitions = outgoingEdges.map(edge => edge.data());

                    console.log('Clicked Node:', nodeData);
                    console.log('Incoming Transitions:', incomingTransitions);
                    console.log('Outgoing Transitions:', outgoingTransitions);
                    handleNodeClick(event);
                  });

                  cy.on('mouseover', 'edge', handleMouseover);
                  cy.on('mouseout', 'edge', handleMouseout);

                  cy.nodes().forEach((node) =>{
                    const regexExternal = /^(https?:\/\/|http:\/\/)/;
                    if(node.data('label').match(regexExternal)){
                      if (showExternalLinks) {
                        node.removeClass('external-node');
                      } else {
                        node.addClass('external-node');
                      }
                    }
                  })
                }}
              />
            )}
            </Col>
         </Row>
        </Card.Body>
        </Card>
      </>
    );
  } catch (error) {
    console.error("Error rendering Cytoscape component:", error);
    return null;
  }
}

export default MatomoStatistics;


/*

{selectedEdge.length > 0 && (
        <div style={{ textAlign: "center", margin: "10px" }}>
          Selected edge {selectedEdge.id} with source node {selectedEdge.source} and target {selectedEdge.target} has {selectedEdge.label} transitions
        </div>
        )}

cy={(cy) => {
              cy.on("select", handleSelect);
            }}

   const transformedData = [];

          data.forEach((object) => {
            const actionsData = object.actionDetails;
          
            for (let i = 0; i < actionsData.length - 1; i++) {
              let currentAction = actionsData[i].subtitle;
              let nextAction = actionsData[i + 1].subtitle;
          
              let currentActionPart = currentAction;
              let nextActionPart = nextAction;
          
              const regex =  /orkg\.org\/([^\/]+)/;
              const currentMatch = currentAction.match(regex);
              const nextMatch = nextAction.match(regex);
          
              if (currentAction === "https://www.orkg.org/") {
                  currentActionPart = "ORKG main";
              } else if (currentMatch) {
                  currentActionPart = currentMatch[1];
                  if(currentActionPart == "u"){
                    currentActionPart = "user";
                  }
              }
          
              if (nextAction === "https://www.orkg.org/") {
                  nextActionPart = "ORKG main";
              } else if (nextMatch) {
                  nextActionPart = nextMatch[1];
                  if(nextActionPart == "u"){
                    nextActionPart = "user";
                  }
              }

              if (currentActionPart !== nextActionPart) {
              // Create a new object with source, target, and weight
              const transition = {
                source: currentActionPart,
                target: nextActionPart || '',
                weight: 1, // Default weight is 1
              };
        
              // Check if a similar transition already exists in the list
              const existingTransition = transformedData.find(
                (t) => t.source === transition.source && t.target === transition.target
              );
        
              if (existingTransition) { // If it exists, increment the weight
                existingTransition.weight += 1;

              } else { // If it doesn't exist, add the new transition to the list
                transformedData.push(transition);
              }
            }
              
            }
          });
            
          console.log("MATOMO Transformed", transformedData); //todo make changeable .filter(item=> item.weight > 2)
          setSankeyData(transformedData); //.filter(item=> item.weight > 2)


<Sankey 
      id="sankey"
      dataSource={data}
      sourceField="source"
      targetField="target"
      weightField="weight"
      paletteExtensionMode="extrapolate"
      theme="Blue Light Compact"
    />*/
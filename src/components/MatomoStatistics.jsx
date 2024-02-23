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
  const [transitionThreshold, setTransitionThreshold] = useState(1);
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
  const [cyInstance, setCyInstance] = useState(null);
  const [hoveredColor, setHoveredColor] = useState(null);
  
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

        for (let i = 0; i < actionsData.length - 1; i++) {
          let currentAction = actionsData[i].subtitle;
          let nextAction = actionsData[i + 1].subtitle;

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

            const sourceId = `${currentActionPart}`;
            const targetId = `${nextActionPart}`;

            const edgeId = `${sourceId}>${targetId}`;

            const nodeSource = {
              data: { id: sourceId,
              label: currentActionPart,
              uri: null
              },
            };

            const nodeTarget = {
              data: { id: targetId,
                      label: nextActionPart,
                      uri: null
                    },
            };

            const edge = {
              data: { id: edgeId, 
                      source: sourceId, 
                      sourceUri: null,
                      target: targetId,
                      targetUri: null,
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
  const filteredElements = elements.filter(edge => edge.data.source && edge.data.target && parseInt(edge.data.label) >= transitionThreshold);

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
        'line-color': (ele) => {
          const label = parseInt(ele.data('label')) - 1;
          const segmentCount = colorLegend.length;
          const segmentSize = Math.ceil(maxLabel / segmentCount);
          // Map the label to a segment based on the segment size
          const segmentIndex = Math.floor(label / segmentSize);
          console.log("color legend index", colorLegend);
          console.log("color legend index", colorLegend[segmentIndex]);
          return hoveredColor && colorLegend[segmentIndex] !== hoveredColor ? '#3e3f3f' : colorLegend[segmentIndex];
          //return colorLegend[segmentIndex];
        },
        'target-arrow-color': (ele) => {
          const label = parseInt(ele.data('label')) - 1;
          const segmentCount = colorLegend.length;
          const segmentSize = Math.ceil(maxLabel / segmentCount);
          // Map the label to a segment based on the segment size
          const segmentIndex = Math.floor(label / segmentSize);
          console.log("color legend index", colorLegend);
          console.log("color legend index", colorLegend[segmentIndex]);
          return hoveredColor && colorLegend[segmentIndex] !== hoveredColor ? '#3e3f3f' : colorLegend[segmentIndex];
        },
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
    {
      selector: 'edge.below-threshold',
      style: {
        display: 'none',
      }
    },
    {
      selector: 'node.isolated-node',
      style: {
        'display': 'none',  // Hide nodes corresponding to edges below the threshold
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

  const centerOnNode = (nodeId) => { //for click on table that then centers on the corresponding node
    if (cyInstance) {
      const node = cyInstance.getElementById(nodeId);
  
      if (node.length === 0) {
        console.warn(`Node with ID ${nodeId} not found`);
        return;
      }
  
      console.log("Center node", node);
      cyInstance.center(node);
    }
  };

  
  const uniqueEdgeColors = Array.from(new Set(diagramData.map(edge => chroma.scale(colorLegend).domain([0, maxLabel])(edge.data.label).hex())));

  const edgesData = diagramData.filter(edge => edge.data.source && edge.data.target);

  const calculateEdgeColorForStyle = (label) => {
    return chroma.scale(colorLegend).domain([0, maxLabel])(label).hex();
  };
  
  // Group edges by color and calculate label ranges
  // Group edges by color and calculate label ranges
  const groupedEdgesByColor = edgesData.reduce((acc, edge) => {
    const label = parseInt(edge.data.label) -1;

    const segmentCount = colorLegend.length;
    const segmentSize = Math.ceil(maxLabel / segmentCount);

    // Map the label to a segment based on the segment size
    const segmentIndex = Math.floor(label / segmentSize);

    const color =  colorLegend[segmentIndex];

    if (!acc[color]) {
      acc[color] = {
        labels: [],
        minLabel: edge.data.label,
        maxLabel: edge.data.label,
      };
    }
    acc[color].labels.push(edge.data.label);
    acc[color].minLabel = Math.min(acc[color].minLabel, edge.data.label);
    acc[color].maxLabel = Math.max(acc[color].maxLabel, edge.data.label);
    return acc;
  }, {});

  const sortedGroupedEdgesByColor = Object.fromEntries(
    Object.entries(groupedEdgesByColor).sort(
      ([colorA, dataA], [colorB, dataB]) => dataA.minLabel - dataB.minLabel
    )
  );

  const handleLegendHover = (color) => {
    setHoveredColor(color);
  };

  const handleLegendLeave = () => {
    setHoveredColor(null);
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
              <Col>
                <Form.Group>
                    <Form.Label>Transition Threshold:</Form.Label>
                    <Form.Control
                      type="number"
                      value={transitionThreshold}
                      onChange={(e) => setTransitionThreshold(isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value))}
                    />
                  </Form.Group>
              </Col>
            </Row>

            {/* Display information about the clicked node and its transitions */}
              <div style={{ marginTop: '20px' }}>
                {clickedNodeInfo.clickedNode && (
                  <div>
                    <h5>Clicked Node: <a href={clickedNodeInfo.clickedNode.uri} target="_blank" rel="noopener noreferrer">{clickedNodeInfo.clickedNode.label}</a></h5>
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
                              <td onClick={() => centerOnNode(transition.target)}>
                                {transition.target}</td> {/*<a href={transition.targetUri} target="_blank" rel="noopener noreferrer">*/}
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
                              <td onClick={() => centerOnNode(transition.source)}>
                                {transition.source}</td>
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
              
              <p>The colors represent the number of transitions from one node to another which are accumulated in one edge.</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              {Object.entries(sortedGroupedEdgesByColor).map(([color, { labels, minLabel, maxLabel }], index) => (
                <div
                  key={index}
                  style={{
                    marginRight: '10px',
                    cursor: 'pointer',
                    opacity: hoveredColor && hoveredColor !== color ? '0.3' : '1',
                  }}
                  onMouseOver={() => handleLegendHover(color)}
                  onMouseLeave={handleLegendLeave}
                >
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
                    <span>{minLabel === maxLabel ? `${minLabel}` : `${minLabel} - ${maxLabel}`} <br></br>
                    ({labels.length === 1 ? `${labels.length} edge` : `${labels.length} edges` })
                    </span>
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
                  setCyInstance(cy);
                  // Attach event listeners to the cy instance
                  cy.on('tap', 'node', (event) => {
                    handleNodeClick(event);
                  });

                  cy.on('mouseover', 'edge', handleMouseover);
                  cy.on('mouseout', 'edge', handleMouseout);
                  
                  cy.nodes().forEach((node) =>{
                    const regexExternal = /^(https?:\/\/|http:\/\/)/;
                    if(node.data('label').match(regexExternal)){
                      node.on('click', () => {
                        const nodeId = node.id();
                        // Handle the click on the node label (you can customize this part)
                        console.log(`Clicked on the label of node with ID: ${nodeId}`);
                        // Perform any additional actions based on the clicked node
                      });
                      if (showExternalLinks) {
                        node.removeClass('external-node');
                      } else {
                        node.addClass('external-node');
                      }
                    }
                  })

                  cy.edges().forEach((edge) => {
                    const label = parseInt(edge.data('label'));
                    if (label < transitionThreshold) {
                      edge.addClass('below-threshold');
                    } else {
                      edge.removeClass('below-threshold');
                    }
                  });

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
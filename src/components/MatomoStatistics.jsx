// Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect, useState } from "react";
import CytoscapeComponent from 'react-cytoscapejs';
import Card from 'react-bootstrap/Card';
import { Row, Col, Dropdown, DropdownButton , Accordion, Tab, Tabs, Tooltip, OverlayTrigger} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import chroma from 'chroma-js';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faInfoCircle, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
function MatomoStatistics() {
  const [diagramData, setDiagramData] = useState([]);
  const [rawData, setRawData] = useState([]); //raw data of the matomo visitor paths
  const [uniquePaths, setUniquePaths] = useState([]);
  const [filterPaths, setFilteredPaths] = useState([]);
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
  const [minPathLength, setMinPathLength] = useState(0);
  const [maxPathLength, setMaxPathLength] = useState(Math.max(...filterPaths.map(path => path.path.length))); // Set your initial maximum length
  const [minOccurrences, setMinOccurrences] = useState(0);
  const [maxOccurrences, setMaxOccurrences] = useState(Math.max(...filterPaths.map(path => path.occurrences)));
  const [selectedPath, setSelectedPath] = useState(null);
  const [incomingSortCriteria, setIncomingSortCriteria] = useState({ column: '', order: 'asc' }); 
  const [outgoingSortCriteria, setOutgoingSortCriteria] = useState({ column: '', order: 'asc' }); 
  const [frequentPathsSortCriteria, setFrequentPathsSortCriteria] = useState({column: '', order:'asc'});
  //const [maxOccurences, setMaxOccurrences] = useState();

  const colorSchemes = {
    default: ['darkslateblue', 'dodgerblue', 'lightseagreen', 'khaki', 'peru', 'orangered'],
    colorblindColorLegend : ['#08439A', '#3182bd', '#6baed6', '#CCB267', '#d95f0e', '#d73027'],
    sunsetColorLegend :['#FCD229', '#E79204', '#E54F02', '#CE4242', '#971616', '#730303'],
    greenColorLegend : ['#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    pinkPurpleColorLegend :['#fbb4b9', '#f768a1', '#c51b8a', '#7a0177', '#49006a', '#270048'],

  };

  const [colorLegend, setColorLegend] = useState(colorSchemes.default); 

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
  
  useEffect(()=>{
    /*
    TEST WITH DUMMY DATA
    const userData = [
      ['pageA', 'pageB', 'pageC'],
      ['pageD', 'pageB', 'pageA', 'pageB'],
      // Add more users or sequences as needed
    ];
    
    // Set parameters
    const minSubSequenceLength = 2;
    
    // Call the sequential pattern mining algorithm
    console.log("matomo algorithm START");
    const result = sequentialPatternMining(userData, minSubSequenceLength);*/
  
    const userPathsInputAlgo = [];
    const regex = /orkg\.org\/([^\/]+)/; //TODO change the way the urls are cutted?
    const regexContribution = /^contribution-editor/;
    console.log("algo raw data", rawData);
    rawData.forEach((user) =>{
      let userPath = [];
      //let previousPage = null;

      user.actionDetails.forEach((page) =>{
        let pageUrl = page.subtitle;
        let pageUrlCut = page.subtitle;
        let matching = pageUrlCut.match(regex);

        if(pageUrlCut === "https://www.orkg.org/"){
          pageUrlCut = "ORKG main";
        }else if(matching){ //something with orkg
          pageUrlCut = matching[1];
          if(matching[1] === "u"){
            pageUrlCut = "user";
            
          }else if(matching[1].match(regexContribution)){
            pageUrlCut = "contribution editor";
          }
        }

        //if (pageUrl !== previousPage) { //TODO no duplicate sequential pages, intended???
        //userPath.push({url: pageUrl, cutoff: pageUrlCut});
        userPath.push(pageUrlCut);
          //previousPage = pageUrl;
        //}
        //userPath.push(pageUrl);
      })
      userPathsInputAlgo.push(...[userPath]);
    });

    console.log("algo paths", userPathsInputAlgo);

    const resultAlgo = sequentialPatternMining(userPathsInputAlgo);
    const uniqueResult = pathsWithOccurences(resultAlgo);
    setUniquePaths(uniqueResult);
    
    console.log("result algorithm matomo data", resultAlgo);
    console.log("result unique algorithm data", uniqueResult);

    //const filteredPaths = uniqueResult.filter((item) => item.path.length >= minPathLength && item.path.length <= maxPathLength && item.occurrences >= minOccurences);
    //console.log("result algo filtered min 2 max 5", filteredPaths);

  }, [rawData]);

  useEffect(() => {
    // Inline filtering function
    const filterPaths = (paths) => {
      return paths.filter(item => (
        item.path.length >= minPathLength &&
        item.path.length <= maxPathLength &&
        item.occurrences >= minOccurrences &&
        item.occurrences <= maxOccurrences
      ));
    };

    //const resultAlgo = sequentialPatternMining(userPathsInputAlgo);
    //const filteredResult = filterPaths(resultAlgo);
    const filteredResult = filterPaths(uniquePaths); // Change this line
    setFilteredPaths(filteredResult);

  }, [rawData, minPathLength, maxPathLength, minOccurrences, maxOccurrences]);

  function pathsWithOccurences(resultAlgo) {
    const uniquePaths = [];
  
    resultAlgo.forEach((path) => {
      // Check if the path already exists in uniquePaths
      const existingPath = uniquePaths.find((item) => arraysEqual(item.path, path));
  
      /*if (existingPath) {
        // Add the full URLs to the existing path
        existingPath.fullPaths.push(...path.fullPaths);
      } else {
        // Create a new path entry
        uniquePaths.push({ path: path.path, fullPaths: path.fullPaths });
      }*/
      if (existingPath) {
        existingPath.occurrences++;
      } else {
        uniquePaths.push({ path, occurrences: 1 });
      }
    });
  
    return uniquePaths;
  }
  
  
  // Helper function to compare arrays
  function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  

  function sequentialPatternMining(data) {
    let allFrequentPatterns = [];
  
    // Iterate over each user's sequence
    data.forEach((userSequence) => {
      // Iterate over each page in the sequence
      for (let i = 0; i < userSequence.length; i++) {
        for (let j = i + 1; j <= userSequence.length; j++) {
          // Extract subsequence
          const subSequence = userSequence.slice(i, j);
          allFrequentPatterns.push(...[subSequence]); 
        }
      }
    });
  
    return allFrequentPatterns;
  }

  function handleRowClick(clickedPath) {
    const originalUrls = getOriginalUrlsForPath(clickedPath); 
    setSelectedPath({ path: clickedPath, originalUrls });
  
    // Example: setModalShow(true);
  }
  
  function getOriginalUrlsForPath(cutOffPath) {
    // You need to implement the logic to retrieve the original URLs based on the cut-off path
    // This could involve searching through your raw data
    // Return an array of original URLs associated with the cut-off path
    // Example: return rawData.filter(user => arraysEqual(user.actionDetails.map(page => extractRelevantUrl(page.subtitle)), cutOffPath));
  }
  
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
      setRawData(data);
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

          //if (currentActionPart !== nextActionPart) {

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
          //}
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
          return hoveredColor && colorLegend[segmentIndex] !== hoveredColor ? '#3e3f3f' : colorLegend[segmentIndex];
          //return colorLegend[segmentIndex];
        },
        'target-arrow-color': (ele) => {
          const label = parseInt(ele.data('label')) - 1;
          const segmentCount = colorLegend.length;
          const segmentSize = Math.ceil(maxLabel / segmentCount);
          // Map the label to a segment based on the segment size
          const segmentIndex = Math.floor(label / segmentSize);
          return hoveredColor && colorLegend[segmentIndex] !== hoveredColor ? '#3e3f3f' : colorLegend[segmentIndex];
        },
      }
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#e86161', // Color for selected nodes
        'line-color': '#ffffff', // Color for selected edges'label': 'data(label)
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

  const isExternalNode = (node) => {
    const regexExternal = /^(https?:\/\/|http:\/\/)/;
    return node.match(regexExternal);
  };

  const handleExternalLinkClick = (url) => { //open external link in new tab
    window.open(url, '_blank');
  };

  const handleColorSchemeChange = (scheme) => {
    const newColorLegend = colorSchemes[scheme].map(color => color.toString());
    setColorLegend(newColorLegend);
  };

  const handleSort = (column, tableType) => {
    const sortState = tableType === 'frequentPaths' ? frequentPathsSortCriteria : 
      tableType === 'outgoing' ? outgoingSortCriteria : incomingSortCriteria;
  
    if (sortState.column === column) {
      if (tableType === 'frequentPaths') {
        setFrequentPathsSortCriteria({
          ...sortState,
          order: sortState.order === 'asc' ? 'desc' : 'asc'
        });
      } else if (tableType === 'outgoing') {
        setOutgoingSortCriteria({
          ...sortState,
          order: sortState.order === 'asc' ? 'desc' : 'asc'
        });
      } else {
        setIncomingSortCriteria({
          ...sortState,
          order: sortState.order === 'asc' ? 'desc' : 'asc'
        });
      }
    } else {
      if (tableType === 'frequentPaths') {
        setFrequentPathsSortCriteria({
          column,
          order: 'asc'
        });
      } else if (tableType === 'outgoing') {
        setOutgoingSortCriteria({
          column,
          order: 'asc'
        });
      } else {
        setIncomingSortCriteria({
          column,
          order: 'asc'
        });
      }
    }
    console.log("sort state", sortState);
  };  

    const sortedOutgoingTransitions = clickedNodeInfo.outgoingTransitions.slice().sort((a, b) => {
      const order = outgoingSortCriteria.order === 'asc' ? 1 : -1;
      return order * (parseInt(a.label) - parseInt(b.label));
    });
    
    const sortedIncomingTransitions = clickedNodeInfo.incomingTransitions.slice().sort((a, b) => {
      const order = incomingSortCriteria.order === 'asc' ? 1 : -1;
      return order * (parseInt(a.label) - parseInt(b.label));
    });

    const sortedFrequentPaths = filterPaths.slice().sort((a, b) => {
      if (frequentPathsSortCriteria.column === 'occurrences') {
        const order = frequentPathsSortCriteria.order === 'asc' ? 1 : -1;
        return order * (a.occurrences - b.occurrences);
      } else if (frequentPathsSortCriteria.column === 'pathLength') {
        const order = frequentPathsSortCriteria.order === 'asc' ? 1 : -1;
        return order * (a.path.length - b.path.length);
      }
      return 0;
    });    

  try {
    return (
      <div>
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
      <Card>
        <Card.Body >
          <Card.Title>Matomo Visitor Data</Card.Title> 
          <Tabs 
            defaultActiveKey="graph"
            id="uncontrolled-tab-example"
            className="mb-3">
            <Tab eventKey="graph" title="Network Graph">
              
        <Row>
        <Col xs={16} md={10}>
        <Row>
          {/*left part of card*/}
          <Col xs={10} md={3}>
          <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="modify_data">
            <Accordion.Header>Change the graph data</Accordion.Header>
            <Accordion.Body>
            <Row>
            <p>Please enter dates in the format <br></br>YYYY-MM-DD.</p>
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
              <Row>
                <Form.Group>
                <Form.Label>Start Date:</Form.Label>
                  <Form.Control
                    type="text"
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
              <Form.Group>
                <Form.Label>End Date:</Form.Label>
                <Form.Control
                  type="text"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabled={fetchOneDay}
                />
              </Form.Group>
              </Row>

              <Row>
                <Col>
                <Button className="d-inline-block mx-auto" variant="primary" onClick={fetchData}> Fetch Data</Button>
                </Col>
              </Row>
            </Row>
            </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item>
              <Accordion.Header>Modify the graph</Accordion.Header>
              <Accordion.Body>

              <Row>
                <Form.Group>
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
                </Form.Group>
              </Row>

              <Row>
                <Form.Group>
                  <Form.Label>Node Spacing:</Form.Label>
                  <Form.Control
                    type="number"
                    value={nodeSpacing}
                    onChange={(e) => setNodeSpacing(parseInt(e.target.value))}
                  />
                </Form.Group>
                </Row>

                <Row className="mb-3">
                <Form.Group>
                    <Form.Label>Transition Threshold:</Form.Label>
                    <Form.Control
                      type="number"
                      value={transitionThreshold}
                      onChange={(e) => setTransitionThreshold(isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value))}
                    />
                  </Form.Group>
              </Row>

            <Row>
              <Col>
                <Form.Check
                  type="switch"
                  id="toggleExternalLinks"
                  label="Show External Links"
                  checked={showExternalLinks}
                  onChange={toggleExternalLinks}
                />
              </Col>
            </Row>
            </Accordion.Body>
            </Accordion.Item>
            </Accordion>
          
          </Col>

          {/*middle column for diagram*/}
            <Col xs={14} md={9}>
              {/*Color legend todo make tooltip out of it*/}
              <Row className="justify-content-center">
              <Col xs={1} md={1}>
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="tooltip-info" data-bs-theme="dark">
                    The colors represent the number of transitions from one node to another. Multiple transitions with same source and target node are accumulated in one edge. 
                    You can hover over an edge to see the exact number of transitions.
                    You can also click on a node to see outgoing and incoming transitions.
                  </Tooltip>
                }
              >
              <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#007bff', marginRight: '5px' }} />
              </OverlayTrigger>
              </Col>

              <Col xs={8} md={6}>
              <div style={{ display: 'flex', justifyContent: 'center'}}>
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
            </Col>

            <Col xs={3} md={2}>
            {/* Dropdown for changing color scheme */}
            <Dropdown>
                <Dropdown.Toggle variant="secondary" id="colorSchemeDropdown">
                  Select Color Scheme
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {Object.keys(colorSchemes).map((scheme) => (
                    <Dropdown.Item key={scheme} onClick={() => handleColorSchemeChange(scheme)}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {colorSchemes[scheme].map((color, index) => (
                          <div
                            key={index}
                            style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: color,
                              marginRight: '5px',
                              border: '1px solid #ccc',
                            }}
                          />
                        ))}
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            </Row>


            {/*Cytoscape diagram*/}
            {diagramData.length > 0 && (
              <CytoscapeComponent
                elements={elements}
                layout={{name: layoutDiagram, //circle, cose?, grid
                spacingFactor: nodeSpacing,
                avoidOverlap: true,
                circle:true
                }}
                style={{ width: '100%', height: '65vh', display: 'block' }}
                stylesheet={darkModeStyles}
                cy={(cy) => {
                  setCyInstance(cy);
                  cy.on('tap', 'node', (event) => {
                    handleNodeClick(event);
                  });

                  cy.on('mouseover', 'edge', handleMouseover);
                  cy.on('mouseout', 'edge', handleMouseout);
                  
                  cy.nodes().forEach((node) =>{
                    const regexExternal = /^(https?:\/\/|http:\/\/)/; //TODO change as the raw data has a flag: type "outlink"
                    if(node.data('label').match(regexExternal)){
                      node.on('click', () => {
                        const nodeId = node.id();
                        console.log(`Clicked on the label of node with ID: ${nodeId}`);
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
         </Col>


         <Col xs={10} md={2}>
          {/* Display information about the clicked node and its transitions */}
          <div>
                {clickedNodeInfo.clickedNode && (
                  <div>
                    <h5>Clicked Node: <a href={clickedNodeInfo.clickedNode.uri} target="_blank" rel="noopener noreferrer">{clickedNodeInfo.clickedNode.label}</a></h5>
                  </div>
                )}
                <Row>
                    {clickedNodeInfo.outgoingTransitions.length > 0 && (
                    <>
                      <h6>Outgoing Transitions ({clickedNodeInfo.outgoingTransitions.reduce((total, transition) => total + parseInt(transition.label, 10), 0)}):</h6>
                      <div className="clickednodelist listgroupcursor">
                      <div className="table-container">
                      <Table bordered hover style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Link</th>
                          <th>Target node</th>
                          <th>Number of transitions
                            <button onClick={() => handleSort('outgoingTransitions', 'outgoing')}>
                                {outgoingSortCriteria.column === 'outgoingTransitions' ? (
                                    outgoingSortCriteria.order === 'asc' ? (
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
                            {sortedOutgoingTransitions.map((transition, index) => (
                              <tr key={index}>
                                <td>
                                  {isExternalNode(transition.target) && (
                                    <FontAwesomeIcon
                                      icon={faExternalLinkAlt}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleExternalLinkClick(transition.target)}
                                      />
                                  )}
                                </td>
                                <td onClick={() => centerOnNode(transition.target)} style={{ overflow: 'hidden', wordBreak: 'break-all'}}>
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
                    </Row>
                  <Row>
                    {clickedNodeInfo.incomingTransitions.length > 0 && (
                    <>
                      <h6>Incoming Transitions ({clickedNodeInfo.incomingTransitions.reduce((total, transition) => total + parseInt(transition.label, 10), 0)}):</h6>
                      <div className="clickednodelist listgroupcursor">
                      <div className="table-container">
                      <Table bordered hover >
                      <thead>
                        <tr>
                          <th>Link</th>
                          <th>Source node</th>
                          <th>Number of transitions
                            <button onClick={() => handleSort('incomingTransitions', 'incoming')}>
                                {incomingSortCriteria.column === 'incomingTransitions' ? (
                                    incomingSortCriteria.order === 'asc' ? (
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
                            {sortedIncomingTransitions.map((transition, index) => (
                              <tr key={index}>
                                  <td>
                                  {isExternalNode(transition.source) && (
                                    <FontAwesomeIcon
                                      icon={faExternalLinkAlt}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleExternalLinkClick(transition.source)}
                                      />
                                  )}
                                  </td>
                                <td onClick={() => centerOnNode(transition.source)} style={{ overflow: 'hidden', wordBreak: 'break-all'}}>
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
                  </Row>
                </div> 
          </Col>
          </Row>
          </Tab>


         <Tab eventKey="paths" title="Frequent Paths">
          <Row className="mb-3">
            <Col>
            <Form.Group controlId="minPathLength">
              <Form.Label>Minimum Path Length:</Form.Label>
              <Form.Control
                type="number"
                value={minPathLength}
                onChange={(e) => setMinPathLength(parseInt(e.target.value))}
              />
            </Form.Group>
            </Col>
            <Col>
            <Form.Group controlId="maxPathLength">
              <Form.Label>Maximum Path Length:</Form.Label>
              <Form.Control
                type="number"
                value={maxPathLength}
                onChange={(e) => setMaxPathLength(parseInt(e.target.value))}
                placeholder={`maximal path length of ${Math.max(...uniquePaths.map(path => path.path.length))}`}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="minOccurrences">
              <Form.Label>Minimum Occurrences:</Form.Label>
              <Form.Control
                type="number"
                value={minOccurrences}
                onChange={(e) => setMinOccurrences(parseInt(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="maxOccurrences">
              <Form.Label>Maximum Occurrences:</Form.Label>
              <Form.Control
                type="number"
                value={maxOccurrences}
                onChange={(e) => setMaxOccurrences(parseInt(e.target.value))}
                placeholder={`maximum of ${Math.max(...uniquePaths.map(path => path.occurrences))} occurences`}
              />
            </Form.Group>
          </Col>
          </Row>

        <div className="pathgroupstyle">
        <div className="table-container">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Path</th>
                  <th>Length
                     <button onClick={() => handleSort('pathLength', 'frequentPaths')}>
                      {frequentPathsSortCriteria.column === 'pathLength' ? (
                        frequentPathsSortCriteria.order === 'asc' ? (
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
                  <th>Occurrences
                    <button onClick={() => handleSort('occurrences','frequentPaths')}>
                      {frequentPathsSortCriteria.column === 'occurrences' ? (
                        frequentPathsSortCriteria.order === 'asc' ? (
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
                {sortedFrequentPaths.map((item, index) => (
                  <tr key={index} onClick={() => handleRowClick(item.path)}>
                    <td style={{ overflow: 'hidden', wordBreak: 'break-all'}}>{item.path.join(' -> ')}</td>
                    <td>{item.path.length}</td>
                    <td>{item.occurrences}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          </div>
        </Tab>
        </Tabs>
        </Card.Body>
        </Card>
      </div>

    );
  } catch (error) {
    console.error("Error rendering Cytoscape component:", error);
    return null;
  }
}

export default MatomoStatistics;
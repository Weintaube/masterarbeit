// Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect, useState } from "react";
import CytoscapeComponent from 'react-cytoscapejs';

function MatomoStatistics() {
  const [diagramData, setDiagramData] = useState([]);
  const TOKEN = '2f1a8c6a07609a76907dd8111dff26ed';
  const matomoEndpoint = 'https://support.tib.eu/piwik/index.php';
  const siteID = 29;
  const date = 'today'; // todo make this variable
  const period = 'day'; // todo make this variable

  const matomoParams = {
    idSite: siteID,
    period: period,
    date: date,
    format: 'JSON',
    module: 'API',
    method: 'Live.getLastVisitsDetails',
    token_auth: TOKEN,
    expanded: 1,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

          let currentActionPart = currentAction;
          let nextActionPart = nextAction;

          const regex = /orkg\.org\/([^\/]+)/;
          const currentMatch = currentAction.match(regex);
          const nextMatch = nextAction.match(regex);

          if (currentAction === "https://www.orkg.org/") {
            currentActionPart = "ORKG main";
          } else if (currentMatch) {
            currentActionPart = currentMatch[1];
            if (currentActionPart === "u") {
              currentActionPart = "user";
            }
          }

          if (nextAction === "https://www.orkg.org/") {
            nextActionPart = "ORKG main";
          } else if (nextMatch) {
            nextActionPart = nextMatch[1];
            if (nextActionPart === "u") {
              nextActionPart = "user";
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
            //console.log("matomo node source generated", nodeSource);

            const nodeTarget = {
              data: { id: targetId,
                      label: nextActionPart
                    },
            };

            const edge = {
              data: { id: edgeId, source: sourceId, target: targetId },
            };


            const existingNodeSource = transformedData.find(
              (t) => t.data.id === nodeSource.data.id
            );

            if(existingNodeSource){
              //console.log("matomo source to compare", nodeSource);
              //console.log("matomo existing source", existingNodeSource);
            }
      
            if (!existingNodeSource) { 
              //console.log("matomot push node source", nodeSource);
              transformedData.push(nodeSource);
              //console.log("matomo current transformed data",transformedData);
            }

            const existingNodeTarget = transformedData.find(
              (t) => t.data.id === nodeTarget.data.id
            );

            if (!existingNodeTarget) { 
              transformedData.push(nodeTarget);
            }

            transformedData.push(edge);
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

  // Create elements based on transformed data
  const elements = diagramData.map((node) => ({ data: node.data }));
  console.log("MATOMO diagram data mapped", elements);

  const layout = { name: 'random' };

  const darkModeStyles = [
    {
      selector: 'node',
      style: {
        'background-color': '#FFFFFF', // Dark background color for nodes
        'label': 'data(label)',
        'color': '#C864C7' // Text color for nodes
      }
    },
    {
      selector: 'edge',
      style: {
        'line-color': '#55ABE9', // Color of edges
        'target-arrow-color': '#ECF0F1', // Color of arrowheads on edges
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#3498DB', // Color for selected nodes
        'line-color': '#3498DB' // Color for selected edges
      }
    }
  ];

  const elements2 = [
    { data: { id: 'node1', label: 'Page 1' } },
    { data: { id: 'node2', label: 'Page 2' } },
    { data: { id: 'edge1', source: 'node1', target: 'node2' } }
  ];

  console.log("MATOMO dummy data", elements2);

  try {
    return (
      <>
        {diagramData.length > 0 && (
          <CytoscapeComponent
            elements={elements}
            layout={layout}
            style={{ width: '800px', height: '800px', display: 'block' }}
            stylesheet={darkModeStyles}
          />
        )}
      </>
    );
  } catch (error) {
    console.error("Error rendering Cytoscape component:", error);
    return null;
  }
}

export default MatomoStatistics;


/*
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
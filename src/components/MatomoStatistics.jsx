//Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect, useState } from "react";
import { Sankey } from "devextreme-react";


import CytoscapeComponent from 'react-cytoscapejs';

//import '../custom-theme.scss'; 

function MatomoStatistics(){

    const [sankeyData, setSankeyData] = useState([]);
    const TOKEN = '2f1a8c6a07609a76907dd8111dff26ed';
    const matomoEndpoint = 'https://support.tib.eu/piwik/index.php';
    const siteID = 29;
    const date = 'today'; //todo make this variable
    const period = 'day'; //todo make this variable

    const matomoParams = {
      idSite: siteID,
      period: period,
      date: date,
      format: 'JSON',
      module: 'API',
      method: 'Live.getLastVisitsDetails',
      token_auth: TOKEN,
      //filter_limit: 500,
      expanded: 1
    };
    

    useEffect(()=>{
      fetchData();
    },[]);

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
            throw new Error('Network response was not ok.');
          }
          const data = await response.json(); 
          console.log("MATOMO DATA", data); //list of pages that were visited
          
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

        } catch (error) {
          console.error('Error fetching matomo data.', error);
        }
      };


      const data = [
        { source: 'Spain', target: 'United States of America', weight: 2 },
        { source: 'Germany', target: 'United States of America', weight: 8 },
        { source: 'France', target: 'United States of America', weight: 4 },
        { source: 'Germany', target: 'Great Britain', weight: 2 },
        { source: 'France', target: 'Great Britain', weight: 4 },
        { source: 'United States of America', target: 'Australia', weight: 6 },
        { source: 'United States of America', target: 'New Zealand', weight: 5 },
        { source: 'United States of America', target: 'Japan', weight: 3 },
        { source: 'Great Britain', target: 'New Zealand', weight: 4 },
        { source: 'Great Britain', target: 'Japan', weight: 1 },
      ];

      const elements = [
        { data: { id: 'node1', label: 'Page 1' } },
        { data: { id: 'node2', label: 'Page 2' } },
        { data: { id: 'edge1', source: 'node1', target: 'node2' } }
      ];

      try{

    return(
    <>
    <Sankey 
      id="sankey"
      dataSource={data}
      sourceField="source"
      targetField="target"
      weightField="weight"
      paletteExtensionMode="extrapolate"
      theme="Blue Light Compact"
    />
    <CytoscapeComponent elements={elements} style={ { width: '600px', height: '600px' , display: 'block'} } />;
  
    </> );
      }catch(error){
        console.log(error("error diagram matomo"), error);
      }
    
}

export default MatomoStatistics;
//Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect, useState } from "react";
import { Sankey } from 'devextreme-react/sankey';

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

          // Extract actions data from Matomo response
          const actionsData = data.actionDetails || [];

          console.log("Matomo actions data", actionsData);
          // Transform actions data into Sankey-compatible format
          const transformedData = actionsData.map((action, index) => ({
            source: action.subtitle, // Use the page title as the source
            target: actionsData[index + 1]?.subtitle || '', // Use the next page title as the target
            weight: action.timeSpent || 1, // Use time spent as the weight, default to 1 if not available
          }));

          /*
          // Extract actions data from Matomo response
            const actionsData = matomoData?.actionDetails || [];

            // Initialize an empty array to store the transformed data
            const transformedData = [];

            // Iterate over the actionsData array
            for (let i = 0; i < actionsData.length - 1; i++) {
              const currentAction = actionsData[i];
              const nextAction = actionsData[i + 1];

              // Create a new object with source, target, and weight
              const transition = {
                source: currentAction.title,
                target: nextAction.title || '',
                weight: 1, // Default weight is 1
              };

              // Check if a similar transition already exists in the list
              const existingTransition = transformedData.find(
                (t) => t.source === transition.source && t.target === transition.target
              );

              if (existingTransition) {
                // If it exists, increment the weight
                existingTransition.weight += 1;
              } else {
                // If it doesn't exist, add the new transition to the list
                transformedData.push(transition);
              }
            }

            // Print the transformed data (you can use it as your Sankey data source)
            console.log(transformedData);
            */

          console.log("MATOMO Transformed", transformedData);
          setSankeyData(transformedData);

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


    return(
    <>
    <Sankey 
      id="sankey"
      dataSource={sankeyData}
      sourceField="source"
      targetField="target"
      weightField="weight"
      paletteExtensionMode="extrapolate"
      theme="Blue Light Compact"
    />
    </>
    );
}

export default MatomoStatistics;
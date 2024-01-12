//Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect } from "react";
import { Sankey } from 'devextreme-react/sankey';

function MatomoStatistics(){

    const TOKEN = '2f1a8c6a07609a76907dd8111dff26ed';
    const matomoEndpoint = 'https://support.tib.eu/piwik/index.php';
    const siteID = 29;
    const date = 'today';

    const matomoParams = {
      idSite: siteID,
      period: 'day',
      date: date,
      format: 'JSON',
      module: 'API',
      method: 'Live.getLastVisitsDetails',
      token_auth: TOKEN,
      filter_limit: 500,
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
          console.log("MATOMO DATA", data);

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
      dataSource={data}
      sourceField="source"
      targetField="target"
      weightField="weight"
    
    />
    </>
    );
}

export default MatomoStatistics;
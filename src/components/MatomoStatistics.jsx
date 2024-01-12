//Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect } from "react";

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
          console.log("MATOMO", response);
          
          //const response = await fetch(`${matomoEndpoint}?idSite=${siteID}&rec=1&period=day&date=${date}&format=JSON&module=API&method=Live.getLastVisitsDetails&filter_limit=500&token_auth=${TOKEN}`, requestOptions);
          console.log("MATOMO AFTER FETCH");
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          console.log("MATOMO RESPONSE", response);
          const data = await response.json(); 
          console.log("MATOMO DATA", data);

        } catch (error) {
          console.error('Error fetching matomo data.', error);
        }
      };



    return(
    <></>
    );
}

export default MatomoStatistics;
//Authentication Token 2f1a8c6a07609a76907dd8111dff26ed
import { useEffect } from "react";

function MatomoStatistics(){

    const TOKEN = '2f1a8c6a07609a76907dd8111dff26ed';
    //https://proxy.cors.sh/
    const matomoEndpoint = 'https://support.tib.eu/piwik/index.php';
    const siteID = '29';
    const date = '2024-05-01';

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
          const response = await fetch(`${matomoEndpoint}?idSite=${siteID}&rec=1&period=day&date=${date}&format=JSON&module=API&action=UsersFlow.getUsersFlowPretty&token_auth=${TOKEN}`, requestOptions);
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          const data = await response.json(); 
          console.log("Matomo Data", data);

        } catch (error) {
          console.error('Error fetching matomo data.', error);
        }
      };



    return
    <></>
    ;
}

export default MatomoStatistics;
const config = {
    //requestUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    requestsEndpoint: process.env.REACT_APP_REQUESTS_URL || 'http://localhost:5000',
    databaseEndpoint: process.env.REACT_APP_DATABASE_URL ||'http://localhost:8001',
    matomoEndpoint: process.env.REACT_APP_MATOMO_ENDPOINT || 'https://support.tib.eu/piwik/index.php',
    matomoAPIToken: process.env.REACT_APP_MATOMO_API_TOKEN ||'2f1a8c6a07609a76907dd8111dff26ed'  
  };
  
  export default config;
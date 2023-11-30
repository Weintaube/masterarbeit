//import logo from './logo.svg';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"; 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import NavBar from './components/NavBar';
import PropsCard from './components/PropsCard';
import ClassCard from './components/ClassCard';
import ResourcesCard from './components/ResourcesCard';
import Contributors from './components/Contributors';
import Templates from './components/Templates';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SameProps from './components/SameProps';
import UndesiredResources from './components/UndesiredResources';

function App() {
  return (
    <div  data-bs-theme="dark">
    <Container>
      <NavBar/>
      <Tabs
      defaultActiveKey="overview"
      id="uncontrolled-tab-example"
      className="mb-3">
      <Tab eventKey="overview" title="Overview">
        <Row>
          <Col><PropsCard/></Col>
          <Col><ClassCard/></Col>
          <Col><ResourcesCard/></Col>
        </Row>
        <Row>
          <SameProps ></SameProps>
        </Row>
      </Tab>
      <Tab eventKey="templates" title="Templates">
        <Row>
          {/*<Col><Contributors/></Col>*/}
          <Col><Templates/></Col>
        </Row>
      </Tab>
      <Tab eventKey="visitors" title="ORKG Visitors"> 
      </Tab>
      </Tabs>
      
      
      </Container>
    </div>
  );
}

export default App;

/*<div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>*/
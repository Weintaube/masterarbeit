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
import EmptyComparisons from './components/EmptyComparisons';
import UnusedResources from './components/UnusedResources';

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
          <Col><UnusedResources/></Col>
        </Row>
        <Row>
          <Col><SameProps ></SameProps></Col>
          {/*<Col><UndesiredResources></UndesiredResources></Col>*/}
        </Row>
      </Tab>
      <Tab eventKey="visit" title="Users">
      Map of visitors path<br/>
      Active members of an observatory in the last 6 months<br/>
      Number of contributors (internal/external)<br/>
      </Tab>
      <Tab eventKey="insights" title="Insights">
      Depth of graph per paper<br/>
      Connectedness (how many connections to other papers exist through shared resources)<br/>
      Input is wrongly assigned as a resource<br/>
      Distribution of statements per entitiy<br/>
      Number of statements per paper/from templates<br/>
      </Tab>
      <Tab eventKey="content" title="Content">
        <Row>
          {/*<Col><Contributors/></Col>*/}
          <Col><Templates/></Col>
          <Col><EmptyComparisons/></Col>
        </Row>

      </Tab>
      <Tab eventKey="actions" title="Actions">
        I see a paper representation (lacking completeness comment)<br/>
        I see a paper or comparison that I do not understand (bad modelling comment)<br/>
        I see a paper or comparison that is relevant for specific domain (suggest to move to featured)<br/>
        Identify statements approved by one of the authors<br/>

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
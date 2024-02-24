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
import Observatories from './components/Observatories';
import Templates from './components/Templates';
import OldTemplates from './components/OldTemplates';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SameProps from './components/SameProps';
import UndesiredResources from './components/UndesiredResources';
import EmptyComparisons from './components/EmptyComparisons';
import UnusedResources from './components/UnusedResources';
import PropsCardTab from './components/PropsCardTab';
import ClassCardTab from './components/ClassCardTab';
import ResourcesCardTab from './components/ResourcesCardTab';
import StatementsPaper from './components/StatementsPaper';
import Comments from './components/Comments';
import MatomoStatistics from './components/MatomoStatistics';
import ResearchFields from './components/ResearchFields';
import CommentsDB from './components/CommentsDB';
import NumberEntities from './components/OtherKGs/ClassesWithoutDescr';


import StatePool from 'state-pool';
import store from './components/storing';
import ClassesWithoutDescr from './components/OtherKGs/ClassesWithoutDescr';
import PropertiesWithoutDescr from './components/OtherKGs/PropertiesWithoutDescr';


function App() {
  const [endpointLabel] = store.useState("endpointLabel");

  return (
    <div  data-bs-theme="dark">
    <Container fluid className="my-3 px-4">
      <NavBar/>
      {endpointLabel === "ORKG" ? (
        

      
      <Tabs
      defaultActiveKey="overview"
      id="uncontrolled-tab-example"
      className="mb-3">
      <Tab eventKey="overview" title="Overview">
        <Row>
          <Col><PropsCardTab/></Col>
          <Col><ClassCardTab/></Col>
          <Col><ResourcesCardTab/></Col>
        </Row>

        <Row>
          {/*<Col><PropsCard/></Col>
          <Col><ClassCard/></Col>*/}
          {/*<Col><UnusedResources/></Col>
          <Col><ResourcesCard/></Col>*/}
        </Row>
        {/*<Row>
          <Col><SameProps ></SameProps></Col>
          
        </Row>*/}
      </Tab>
      <Tab eventKey="visit" title="Visitors">
        	<MatomoStatistics></MatomoStatistics>
      {/*Active members of an observatory in the last 6 months<br/>
      Number of contributors (internal/external)<br/>*/}
      
        {/*<Col><Observatories/></Col>*/}
      </Tab>
      <Tab eventKey="insights" title="Insights">
        <Row>
          <Col>
            <ResearchFields/>
          </Col>
          <Col>
            <StatementsPaper/>
          </Col>
        </Row>
      {/*Depth of graph per paper<br/>
      Connectedness (how many connections to other papers exist through shared resources)<br/>
      Input is wrongly assigned as a resource<br/>
      Distribution of statements per entitiy<br/>
    Number of statements per paper/from templates<br/>*/}

      </Tab>
      <Tab eventKey="content" title="Content">
        <Row>
          {/*<Col><Contributors/></Col>*/}
          <Row>
            {/*<Col><OldTemplates/></Col>*/}
            <Col><EmptyComparisons/></Col>
          </Row>
          <Row>
            <Col><Templates/></Col>
          </Row>
        </Row>

      </Tab>
      <Tab eventKey="actions" title="Actions">
        <CommentsDB></CommentsDB>
      </Tab>
      </Tabs>
      
      ): endpointLabel === "DBpedia"?(
        <>
        <Row>
          <Col>
            <ClassesWithoutDescr/>
          </Col>
          <Col>
            <PropertiesWithoutDescr/>
          </Col>
        </Row>
        </>
      ): endpointLabel === "Wikidata"?(
        <>
        <Row>
          <Col>
            <ClassesWithoutDescr/>
          </Col>
          <Col>
            <PropertiesWithoutDescr/>
          </Col>
        </Row>
        </>
      ): null}
      
      
      </Container>
    </div>
  );
}

export default App;

//action tab
/*  I see a paper representation (lacking completeness comment)<br/>
        I see a paper or comparison that I do not understand (bad modelling comment)<br/>
        I see a paper or comparison that is relevant for specific domain (suggest to move to featured)<br/>
        Identify statements approved by one of the authors<br/>*/

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
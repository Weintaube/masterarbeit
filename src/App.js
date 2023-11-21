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

function App() {
  return (
    <>
    <Container>
      <NavBar/>
      <Row>
        <Col><PropsCard/></Col>
        <Col><ClassCard/></Col>
        <Col><ResourcesCard/></Col>
      </Row>
      <Row>
        {/*<Col><Contributors/></Col>*/}
        <Col><Templates/></Col>
      </Row>
      </Container>
    </>
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
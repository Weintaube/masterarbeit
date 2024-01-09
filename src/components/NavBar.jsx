import React, { useState } from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import StatePool from 'state-pool';
import store from './storing';


store.setState("testendpoint", "ORKGbla");
store.setState("sparqlendpointURL", "https://orkg.org/triplestore"); //https://orkg.org/api/
store.setState("endpointLabel", "ORKG");
store.setState("endpointPrefixes", null);

function NavBar (){

  const [testendpoint, setTest, updateTest] = store.useState("testendpoint");
  const [sparqlendpointURL, setEndpointURL, ] = store.useState("sparqlendpointURL");
  const [endpointLabel, setLabel, ] = store.useState("endpointLabel");
  const [endpointPrefixes, setEndpointPrefixes, ] = store.useState("endpointPrefixes");

  setEndpointPrefixes(`
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  PREFIX orkgr: <http://orkg.org/orkg/resource/>
  PREFIX orkgc: <http://orkg.org/orkg/class/>
  PREFIX orkgp: <http://orkg.org/orkg/predicate/>

  PREFIX dbp: <http://dbpedia.org/>

  PREFIX wikidata: <http://www.wikidata.org/entity/>
  PREFIX wikibase: <http://wikiba.se/ontology#>
`);

  const handleSelect = (eventKey) => {
    //setEndpointURL(eventKey);
    if (eventKey === "#orkg") {
      setLabel("ORKG");
      //setEndpointURL("https://orkg.org/api/");

    } else if (eventKey === "#dbpedia") {
      setLabel("DBpedia");
      //setEndpointURL("http://dbpedia.org");

    } else if (eventKey === "#wikidata") {
      setLabel("Wikidata");
      console.log("Wikidata selected");
      //setEndpointURL("https://query.wikidata.org/sparql");
    }
  }

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">SciKGDash</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Choose Endpoint" id="basic-nav-dropdown" onSelect={handleSelect}>
              <NavDropdown.Item href="#orkg">ORKG</NavDropdown.Item>
              <NavDropdown.Item href="#dbpedia">DBpedia</NavDropdown.Item>
              <NavDropdown.Item href="#wikidata">Wikidata</NavDropdown.Item>
            </NavDropdown>
            <Navbar.Text href="#label">{endpointLabel}</Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;

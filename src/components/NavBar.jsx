import React, { useState } from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import StatePool from 'state-pool';
import store from './storing';


store.setState("testendpoint", "ORKGbla");
store.setState("endpointURL", "https://orkg.org/api/");
store.setState("endpointLabel", "ORKG");

function NavBar (){

  const [testendpoint, setTest, updateTest] = store.useState("testendpoint");
  const [endpointURL, setEndpointURL, ] = store.useState("endpointURL");
  const [endpointLabel, setLabel, ] = store.useState("endpointLabel");

  const handleSelect = (eventKey) => {
    //setEndpointURL(eventKey);
    if (eventKey === "#orkg") {
      setLabel("ORKG");
      setEndpointURL("https://orkg.org/api/");

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

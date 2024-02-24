import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { ListGroup, Row, Col, Form, Tab, Tabs} from "react-bootstrap";
import Table from 'react-bootstrap/Table';

import Plot from 'react-plotly.js';


function StatementsPaper(){

    const [dummyData, setDummyData] = useState([]);
    const [minStatements, setMinStatements] = useState(0);
    const [maxStatements, setMaxStatements] = useState(20); //TODO get max number from data

    useEffect(()=>{
        fetchData();
    });

    useEffect(() => {
        generateDummyData();
    }, []);

    const fetchData = async()=>{
        try{
            const response = await fetch(''); //https://orkg.org/api/statements/R659268/bundle?maxLevel=2
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("Statements per paper", result);

            }else{
                console.log("Error while fetching comparisons.");
            }

        }catch(error){
            console.log(error);
        }
    }

    function normalDistribution(mean, stdDev, min) {
        let value = -1;

        // Ensure the generated value is at least 'min'
        while (value < min) {
            let u = 0, v = 0;
            while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
            while (v === 0) v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

            value = Math.round(mean + stdDev * z);
        }

        return value;
    }

    const generateDummyData = () => {
        const numPapers = 1000;
        const maxStatements = 100;

        const generatedData = Array.from({ length: numPapers }, (_, index) => {
            const title = `Paper ${index + 1}`;
            const createdAt = new Date().toISOString();
            const createdBy = `User${index + 1}`;
            //const statementCount = Math.floor(Math.random() * maxStatements) + 1; // Random statement count
            const statementCount = Math.round(normalDistribution(50, 20, 0));

            return {
                paper: { title, created_at: createdAt, created_by: createdBy },
                statement_count: statementCount
            };
        });

        setDummyData(generatedData);
    };

    const calculateAverageStatements = () => {
        const totalStatements = dummyData.reduce((sum, paper) => sum + paper.statement_count, 0);
        const averageStatements = dummyData.length > 0 ? totalStatements / dummyData.length : 0;
        return averageStatements.toFixed(2); 
    };

    const getTopAndBottomPapers = () => {
        const sortedData = [...dummyData].sort(
            (a, b) => b.statement_count - a.statement_count
        );

        const top10 = sortedData.slice(0, 10);
        const bottom10 = sortedData.slice(-10);

        return { top10, bottom10};
    };

    const filterPapersByStatementCount = () => {
        return dummyData.filter((paper) => {
          const statementCount = paper.statement_count;
          return statementCount >= minStatements && statementCount <= maxStatements;
        });
    };

    const countPapersWithAtLeastStatements = () => {
        const papersWithAtLeastStatements = dummyData.filter(paper => paper.statement_count >= 20);
        const percentage = (papersWithAtLeastStatements.length / dummyData.length) * 100;
        return { absolute: papersWithAtLeastStatements.length, percentage: percentage.toFixed(2) };
    };

    const countDisplayedPapers = () =>{
        const displayedPapers = filterPapersByStatementCount();
        const percentage = (displayedPapers.length / dummyData.length) * 100;
        console.log("papers absolute", displayedPapers.length);
        return {absolute: displayedPapers.length, percentage: percentage.toFixed(2)};
    }

    const renderPaperList = (papers) => {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Paper</th>
                        <th>Statements</th>
                    </tr>
                </thead>
                <tbody>
                    {papers.map((item, index) => (
                    <tr>
                        <td>{item.paper.title}</td> {/*<td><a href={template.user_uri} target="_blank" rel="noopener noreferrer">{template.author}</a></td>*/}
                        <td>{item.statement_count}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    const { top10, bottom10} = getTopAndBottomPapers();

    const boxPlotData = generateBoxPlotData(dummyData);

    function generateBoxPlotData(data) {
        const values = data.map((paper) => paper.statement_count);
    
        return [{
            x: values, // Switched x and y for the box trace
            type: 'box',
            boxpoints: 'outliers', //all
            jitter: 0.3,
            pointpos: -1.8,
            marker: { color: 'rgba(75, 192, 192, 0.8)' },
            orientation: 'h',
            hoverinfo: 'x',
            name: '',
        }];
    }
    
    return(
        <>
        <Card>
            <Card.Body>
                <Card.Title>Statements per Paper</Card.Title>
                <Tabs 
                    defaultActiveKey="overview"
                    id="uncontrolled-tab-example"
                    className="mb-3">
                    <Tab eventKey="overview" title="Overview">
                        <Row>
                            <p>Average number of statements per Paper: <span style={{ fontSize: '1.5em' }}>{calculateAverageStatements()}</span></p>
                        </Row>
                        <Row>
                            <p><span style={{ fontSize: '1.5em' }}>{countPapersWithAtLeastStatements().percentage}%</span> ({countPapersWithAtLeastStatements().absolute}) Papers have at least 20 statements.</p>
                        </Row>

                        <p>Distribution of statements</p>
                        {/*box plot here*/}
                        <Plot
                            data={boxPlotData}
                            layout={{
                                xaxis: {
                                    title: "Number of statements",
                                    titlefont: { color: 'white' }, 
                                    tickfont: { color: 'white' },
                                },
                                yaxis: {
                                    title: "Papers",
                                    titlefont: { color: 'white' }, 
                                    tickfont: { color: 'white' },
                                },
                                paper_bgcolor: 'rgba(0, 0, 0, 0.7)',
                                plot_bgcolor: 'rgba(0, 0, 0, 0.7)'
                            }}
                        />



                    </Tab>

                    <Tab eventKey="topbottom" title="Top/Bottom Papers">
                        <Row>
                            <Col>
                                Top 10 Papers with most statements:
                                {renderPaperList(top10)}
                            </Col>
                            <Col>
                                Bottom 10 Papers with least statements:
                                {renderPaperList(bottom10)}
                            </Col>
                        </Row>
                    </Tab>

                    <Tab eventKey="filter" title="Filter Papers">
                        <p>Showing {countDisplayedPapers().percentage}% ({countDisplayedPapers().absolute}) Papers.</p>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Minimum number of statements:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={minStatements}
                                        onChange={(e) => setMinStatements(parseInt(e.target.value))}
                                    />
                                </Form.Group>                    
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Maximum number of statements:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={maxStatements}
                                        onChange={(e) => setMaxStatements(parseInt(e.target.value))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <div className="templatelist listgroupcursor">
                                    <div className="table-container">
                                        {renderPaperList(filterPapersByStatementCount())}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Tab>

                </Tabs>
            </Card.Body>
        </Card>
        </>
    );

}

export default StatementsPaper;
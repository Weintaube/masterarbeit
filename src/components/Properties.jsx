import {React, useEffect, useState} from "react";
import store from './storing';
//import "./styles.css";
import { Pie} from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";

Chart.register(CategoryScale);

const Test = () => {
  console.log("Start rendering Test");
  const [allprops, setAllProps] = useState(0);
  const [chartData, setChartData] = useState({
    labels: ["a", "b"], 
    datasets: [
      {
        label: "Users Gained ",
        data: [10,20],
        backgroundColor: [
          "#50AF95",
          "#2a71d0"
        ],
        borderColor: "black",
        borderWidth: 2
      }
    ]
  });
  const [endpointURL, , ] = store.useState("endpointURL");
  const [endpointLabel, , ] = store.useState("endpointLabel");

  const fetchSPARQLData = async () => {
    console.log("Fetch sparql data");
    try {
      
      console.log("before fetch");
      const response = await fetch('https://orkg.org/api/predicates/');
      //const response = await fetch('https://wikidata.org/w/rest.php/wikibase/v0/entities/properties');
      console.log("after fetch");

      if(response.ok){ //Anfrage erfolgreich Statuscode 200
        console.log("Response (OK)",  response)
        const result = await response.json();
        console.log(result);
        console.log(result.totalElements);
        console.log("content");
        console.log(result.content);
        
        const allpropsValue = result.totalElements;
        const propsWith = parseInt(20);
        setAllProps(allpropsValue);
          //setData([{name:"Properties with a description", value: propsWith}, {name:"Properties without a description", value: 50}]);
          //console.log([{name:"Properties with a description", value: propsWith}, {name:"Properties without a description", value: 50}]);

          setChartData({
            labels: ["Properties with a description", "Properties without a description"], 
            datasets: [
              {
                label: [],
                data: [propsWith, (allpropsValue-propsWith)],
                backgroundColor: [
                  "#50AF95",
                  "#2a71d3"
                ],
                borderColor: "black",
                borderWidth: 2
              }
            ],
            options: {
              responsive:true,
              maintainAspectRatio: false
            }
          });
 
      }else{
        throw new Error("Error while requesting the REST API data.")
      }
     } catch (error) {
      console.error(error);
     }
     //console.log("Render finsished Test")
  };

  useEffect(() => {
    console.log("FIRST USE EFFECT");    
    console.log("Label ", endpointLabel);
        
    fetchSPARQLData(); 
  }, [endpointLabel]);
 

  //console.log(data.results.bindings[0].allprops.value);

  //Todo: check if responded data ist vorhanden, da aufruf asynchron
     // <div>Anzahl der Properties: {data.results.bindings[0].allprops.value}</div> 
     //responsive container dispatcher null, evtl einfügen wenn orkg wieder funzt? liegt prob eh nicht daran
    
  return (
    <div>
      <div>{endpointLabel}</div>
      {allprops ? (
        <div>Anzahl der Properties: {allprops}</div>
          ) : (
        <div>Loading...</div>
      )}

      <div className="pie-chart-container">
        <Pie
          data={chartData}
          width={300}
          height={300}
          options={{
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Properties"
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Test;

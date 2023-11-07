import React, {useEffect, useState} from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export default function PropertyStats() {

  const [orkgdata, setData] = useState(null); //variable data wird aktuell gehalten mithilfe der Funktion setData

  const ORKG_PREFIXES = `
  PREFIX orkgp: <http://orkg.org/orkg/predicate/>
  PREFIX orkgc: <http://orkg.org/orkg/class/>
  PREFIX orkgr: <http://orkg.org/orkg/resource/>
  `;

  function getPrefixes(standard=ORKG_PREFIXES) {
    return standard;
  }

  useEffect(() => {
    const fetchSPARQLData = async () => {
      try {
        const prefixes = getPrefixes();
        const query = encodeURIComponent(`
        ${prefixes}

        SELECT (COUNT(DISTINCT ?p) AS ?allprops) (COUNT(distinct ?d) as ?descrpop)
        WHERE { 
            ?p rdf:type orkgc:Predicate.
          OPTIONAL{?p orkgp:description ?d}
        }
        `);
        const url = `http://localhost:5000/sparql?query=${query}`;   
        const response = await fetch(url);

        if(response.ok){
          const result = await response.json();
          setData(result);
        }else{
          throw new Error("Error while requesting SPARQL data.")
        }
       } catch (error) {
        console.error(error);
       }
    };
    fetchSPARQLData();
  }, []);

  const renderData = () => {
    if(orkgdata){
      console.log("ok");
      console.log(orkgdata);

     const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Bar Chart',
          },
        },
      };
      
      const labels = ['January', 'February', 'March'];
      
       const data = {
        labels,
        datasets: [
          {
            label: 'Dataset 1',
            data: [10, 20, 30],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Dataset 2',
            data: [1, 2, 3],
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      };

      //<Bar options={options} data={data}/>
      return(
        <div>Test</div>
      )
    }else{
      return <p>Lade Daten...</p>
    }
  }

 return (
    <div>{renderData()}</div>                                                         
  );
}

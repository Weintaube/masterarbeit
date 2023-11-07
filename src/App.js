//import TestComponent from './TestComponent';
//import PropertyStats from './PropertyStats';
import PieChart from './components/PieChart';
import Navbar from './components/Navbar';

import "bootstrap/dist/css/bootstrap.min.css"; //still required in react-bootstrap


export default function App() {
  return (
    <div>
      <Navbar/>  
      <PieChart/>
    </div>                                                    
  );
}
//import logo from './logo.svg';
import './App.css';
import NavBar from './components/NavBar';
import Test from './components/Properties';

import "bootstrap/dist/css/bootstrap.min.css"; 
import PropsCard from './components/PropsCard';

function App() {
  return (
    <>
      <NavBar/>
      <Test/>
      <PropsCard/>
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
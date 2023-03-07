import './App.css'
import { Link, Route, Router, Switch } from "wouter";
import Home from './components/Home';
import Converter from './components/Converter';
import RngGamePage from './components/RngGame';
import IpGamePage from './components/SubnetGame';


// Routing of the "pages" --- using wouter to keep dependencies/size low
export default function App(){
  const basePath : string ="/vite-subnetting"; // base path= reponame for gh-pages
  // to note we MUST use trailing "/" on Links for gh pages

  return(
  <div className="App">
    <nav>
      <div className="menu">
        <Link href="/vite-subnetting/">Home</Link>
        <Link href="/vite-subnetting/converter/">Binary-Hexa-Decimal</Link>
        <Link href="/vite-subnetting/rng-game/">Rng-Game</Link>
        <Link href="/vite-subnetting/ip-game/">Subnetting-Trainer</Link>
      </div>
    </nav>
    <Router base={basePath}>
      <Switch >        
        <Route path="/"><Home/></Route>
        <Route path="/converter"><Converter/></Route>
        <Route path="/rng-game"><RngGamePage/></Route>
        <Route path="/ip-game"><IpGamePage/></Route>
        <Route><h2>404, Not Found!</h2></Route>
      </Switch>
    </Router>
  </div>
  )}
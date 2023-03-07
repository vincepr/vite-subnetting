import './App.css'
import { Link, Route, Switch } from "wouter";
import Home from './components/Home';
import Converter from './components/Converter';
import RngGamePage from './components/RngGame';
import IpGamePage from './components/SubnetGame';


// Routing of the "pages" of the Single-Page-Application using wouter to keep dependencies low
const App = () => (
  <div className="App">
    <nav>
      <div className="menu">
        <Link href="/vite-subnetting/">Home</Link>
        <Link href="/vite-subnetting/converter">Binary-Hexa-Decimal</Link>
        <Link href="/vite-subnetting/rng-game">Rng-Game</Link>
        <Link href="/vite-subnetting/ip-game">Subnetting-Trainer</Link>
      </div>
    </nav>
    <Switch>        
      <Route path="/vite-subnetting/"><Home/></Route>
      <Route path="/vite-subnetting/converter"><Converter/></Route>
      <Route path="/vite-subnetting/rng-game"><RngGamePage/></Route>
      <Route path="/vite-subnetting/ip-game"><IpGamePage/></Route>
    </Switch>
  </div>
  )

export default App
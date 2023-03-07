import './App.css'
import { Link, Router,  Route, Switch } from "wouter";
import Home from './components/Home';
import Converter from './components/Converter';
import RngGamePage from './components/RngGame';
import IpGamePage from './components/SubnetGame';


// Routing of the "pages" of the Single-Page-Application using wouter to keep dependencies low
const App = () => (
  <div className="App">
    <nav>
      <div className="menu">
        <Link href="/">Home</Link>
        <Link href="/converter">Binary-Hexa-Decimal</Link>
        <Link href="/rng-game">Rng-Game</Link>
        <Link href="/ip-game">Subnetting-Trainer</Link>
      </div>
    </nav>
    <Switch>
      <Router base="/vite-subnetting">
        <Route path="/"><Home/></Route>
        <Route path="/converter"><Converter/></Route>
        <Route path="/rng-game"><RngGamePage/></Route>
        <Route path="/ip-game"><IpGamePage/></Route>
      </Router>
    </Switch>
  </div>
  )

export default App
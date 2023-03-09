import './App.css'
import { Link, Route, Router, Switch, useLocation} from "wouter";
import Home from './components/Home';
import Converter from './components/Converter';
import RngGamePage from './components/RngGame';
import IpGamePage from './components/SubnetGame';
import Ip4Calc from './components/ipcalculator/Ip4Calc';
import Ip6Calc from './components/ipcalculator/Ip6Calc';



// Routing of the "pages" --- using wouter to keep dependencies/size low
export default function App(){
  const basePath : string ="/vite-subnetting"; // base path= reponame for gh-pages
  // to note we MUST use trailing "/" on Links for gh pages
  const [location, setLocation] = useLocation()

  // check if url includes#!# -> we got redirected by 404.html - because user refreshed singlepage-app
  const urlHash = window.location.hash        //...vite-subnetting/#!#rng-game/ -> "#!#rng-game/"
  if (urlHash.includes("#!#")){
    setLocation(location+urlHash.replaceAll("#!#", ""), {replace:true})
  }

  return(
  <div className="App">
    <nav>
      <div className="menu">
        <Link href="/vite-subnetting/">Home</Link>
        <Link href="/vite-subnetting/converter/">Binary-Hexa-Decimal</Link>
        <Link href="/vite-subnetting/rng-game/">Rng-Game</Link>
        <Link href="/vite-subnetting/calculator-v4/">Subnet-Calculator IPv4</Link>
        <Link href="/vite-subnetting/calculator-v6/">Subnet-Calculator IPv6</Link>
        <Link href="/vite-subnetting/ip-game/">Subnetting-Trainer</Link>
      </div>
    </nav>
    <Router base={basePath} >
      <Switch >        
        <Route path="/"><Home/></Route>
        <Route path="/converter"><Converter/></Route>
        <Route path="/rng-game"><RngGamePage/></Route>
        <Route path="/calculator-v4"><Ip4Calc/></Route>
        <Route path="/calculator-v6"><Ip6Calc/></Route>
        <Route path="/ip-game"><IpGamePage/></Route>
        <Route><h2>404, Not Found! inpage-routing went bad.</h2></Route>
      </Switch>
    </Router>
  </div>
  )}

 
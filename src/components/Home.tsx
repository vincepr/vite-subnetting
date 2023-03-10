import { Link, Route, Router, Switch } from "wouter";

export default function Home(){
    return <div>
        <p> ___________________________________</p>
        <h1>Subnetting-Aufgaben</h1>
        <p>Eine Sammlung an Elementen zum training von Subnetting Aufgaben, a'la IHK-Prüfung
        Und von Subnetting Rechnern zum überprüfen von Gerechneten Aufgaben</p>

        <Link href="/converter/"><h3>Binary-Hexa-Decimal</h3></Link>
        <label>Beliebiges umrechnung von Binär - Dezimal - Hexadezimal.</label>


        <Link href="/calculator-v4/"><h3>Subnet-Calculator IPv4</h3></Link>
        <label>Berechnet Subnetze für Ipv4 Adressen.</label>


        <Link href="/calculator-v6/"><h3>Subnet-Calculator IPv6</h3></Link>
        <label>Berechnet Subnetze für Ipv6 Adressen.</label>


        <Link href="/ip-game/"><h3>Subnetting-Trainer</h3></Link>
        <label>Generiert Ipv4 und oder Ipv6 Subnetting-Aufgaben zufällig, mit Lösungen.</label>
        <p>___________________________________</p>


        <h3>Quellcode</h3>
        <p>Geschrieben in JavaScript / React mit Vite als module-bundler, gehosted auf Github-Pages per Auto-Deployment (Github-Workflow/Action) </p>
        <p>Quellcode zu finden auf: </p>
        <a href="https://github.com/vincepr/vite-subnetting">https://github.com/vincepr/vite-subnetting</a>



        
        

    </div>
}
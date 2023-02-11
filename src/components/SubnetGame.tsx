import { useState } from "react";
import IpGame from "./ipgame/IpGame";


export type GameModes = "All" | "Basic" | "Ipv4" | "Ipv6"

export default function IpGamePage(){
    const [gameMode, setGameMode] = useState<GameModes>("All")
    const[resetterKey ,setForceReset] = useState(1)             //used as "unique" key of IpGame to force it to reset fully once it changes

    function forceResetComponent(){
      setForceReset( resetterKey===1 ? 2:1)
    }
    function updateGameMode (val:GameModes) {
        setGameMode(val)
        forceResetComponent()
    }

    return <div>
        <h2>Subnetting Trainer</h2>
        <button onClick={forceResetComponent}>
          Next Question
        </button>
        <OptionSelector 
            value={gameMode}
            onChange={updateGameMode}/>
        <IpGame key={resetterKey} gameMode={gameMode}/>
    </div>
}



function OptionSelector({value: selected, onChange: setGameMode }:{value: GameModes, onChange: (val: GameModes) => void}) {      // deconstcruction to get to the selected without "props.selected" not pretty maybe write a interface if it get bigger
    return (
      <label>
        What questions to select:
        <select
          value={selected}
          onChange={e =>setGameMode(e.target.value as GameModes)} 
        >
          <option value="All">All</option>
          <option value="Basic">IPv4-Basic</option>
          <option value="Ipv4">IPv4-Subnetting</option>
          <option value="Ipv6">IPv6-Subnetting</option>
        </select>
      </label>
    );
  }
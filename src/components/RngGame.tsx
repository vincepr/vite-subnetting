import { useState } from "react";


export default function RngGamePage(){
    return <div>
        <h2>RNG game</h2>
        <p> Testing out how to pass down state data</p>
        <p> with react-state for functions</p>
        <Game/>
        <br/>
        <Game/>
    </div>
}


function Game(){
    const [buttonState, setButtonState] = useState(0);

    function onClickHandler(){
        setButtonState(buttonState+1)
        console.log("clicked")}

    return <div>
            <button
                onClick={onClickHandler} 
                type="button"
            > {buttonState} times clicked </button>

            <br/>
            RNG-Counter= { Math.floor(Math.random()*999) }
        </div>
}
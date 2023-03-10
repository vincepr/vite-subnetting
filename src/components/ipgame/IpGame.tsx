import { useState } from "react"
import { GameModes } from "../SubnetGame"
import { DrawQuestions } from "./DrawQuestions"
import { createDataV4Basic } from "./ipv4/createDataV4Basic"
import { createDataV4Subnet } from "./ipv4/createDataV4Subnetting"
import createDataIPv6Game from "./ipv6/createDataV6Game"


//input:
type gameProps = {
    gameMode: GameModes,
    key?: React.Key
}
/** Draw the whole Game-Elements*/
export default function IpGame({gameMode:mode}:gameProps){
    let data = createGamedataByMode(mode)      //get the actual game data (subnets generated questions-answers ....)
    return(
        <>
            <Assignment headerText={data.headerText}/>
            <QuestionsWithSubmitButton data={data.subnets}/>
        </>
    )
}


/** fetch data for currently selected game mode*/
function createGamedataByMode(mode:GameModes){
    if (mode ==="Basic")        return createDataV4Basic()
    else if (mode ==="Ipv4")    return createDataV4Subnet()
    else if (mode ==="Ipv6")    return createDataIPv6Game()
    else if (mode==="All") {
        let rng = Math.random()
        if (rng <0.4) {
                                return createDataV4Subnet()
        } else if (rng <0.7){
                                return createDataIPv6Game()
        } else {
                                return createDataV4Basic()
        }
    }
    else {throw new Error("Something Broke! cant create gamedata since no fitting mode selected. (in getGamedataByMode)");
    }
}


/*draw each of the lines of the Header Assignment in it's own <p></p>*/
const Assignment = (props:{headerText:string[]}) =>{
    return <>
             { props.headerText.map((txt, index)=><p key={index}>{txt}</p>) }
        </>
}


// input for function below:
type SubnetsDataProps = {data:
    {
    name: string
    questionAnswers: {
        question: string
        answer: string | string[]
    }[] 
    }[]
}
/** Handles the submit signal */
const QuestionsWithSubmitButton = (props: SubnetsDataProps) => {
    const [isShowResultsVisible, setState] = useState(false)        // set default state false, flip it if "submitted the answers"
    function submitAnswers(){
        setState(true)
    }
    return (
        <div>
            <button onClick={submitAnswers}>Submit Answers</button>
            {props.data.map((subnet, index)=>{return <DrawQuestions key ={index} data={subnet} isAnswerVisible={isShowResultsVisible} submitAnswers={submitAnswers}/>})}
        </div>
    )
}

import React, {useState} from "react";

// input:
type SubnetDataProps = {data:
    {
    name: string
    questionAnswers: {
        question: string
        answer: string | string[]
    }[] 
    },
    isAnswerVisible:boolean,
    submitAnswers: () => void,
}


/** for each subnet draw a question-answer block with a iinput-field*/
export const DrawQuestions = (props:SubnetDataProps) =>{

    return (
            <div>
                <h3>{props.data.name}:</h3>
                {props.data.questionAnswers.map((line)=>{
                    return QuestionInputAnswer(line, props.isAnswerVisible, props.submitAnswers)})}
            </div>
    )
}


/** one Row/Line of the Question an Input and the Correct Answer */
function QuestionInputAnswer(line: {question: string, answer:string|string[]}, isAnswerVisible:boolean, submitAnswers:()=>void){

    // states
    const [inputValue, setInputValue] = useState("")
    const [isCorrectAnswer, setisCorrectAnswer] = useState(false)

    // keypress Enter to submit
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            submitAnswers()         // lives one abstraction above in IpGame 
        }
    }

    // handle input-field change by user typing:
    function handleNewInput(event:React.ChangeEvent<HTMLInputElement>){
        let input = event.target.value
        // repalce , to . (for quick numpad typing)
        input = input.replace(",", ".")
        //check if input is correct -> change state accordingly
        let isCorrectAnswer = false
        if (typeof(line.answer)==='string'){
            // only one correct possible answer:
            if (input === line.answer)  isCorrectAnswer=true
        } else {
            //multiple correct answers possible, so check them all
            for (let possibleAnswer of line.answer){
                if (possibleAnswer === input) isCorrectAnswer=true
            }
        }
        setInputValue(input)
        setisCorrectAnswer(isCorrectAnswer)
    }

    return (
        <p key={line.question+line.answer}>
            <label className="labelLeft">{line.question} </label>
            <input type="text" value={inputValue} onChange={e => handleNewInput(e)} onKeyDown={handleKeyDown}/>
            <label className="labelRight" style={{
                color: isCorrectAnswer ? "black" : "#b1354c",
                visibility: isAnswerVisible ? 'visible' : 'hidden'
                }}>{line.answer}</label>
        </p>
    )
}



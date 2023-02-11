// from https://developer.okta.com/blog/2022/03/14/react-vite-number-converter

import React, {useState} from 'react'

export default function Converter() {
    const [value, setValue] = useState<number>()
    const [origin, setOrigin] = useState<string>()
    const isDisabled = (base:string) => (origin !== undefined && origin !==base)

    const updateValue = (baseName: string, base: number) =>
    (e: React.ChangeEvent<HTMLInputElement>)=> {
        if (e.target.value===""){
            setValue(oldValue => undefined)
            setOrigin(oldOrigin =>undefined)
        } else {
            setValue(oldValue=>{
                const newValue = parseInt(e.target.value, base)
                return isNaN(newValue) ? oldValue : newValue
            })
            setOrigin(orldOrigin => baseName)
        }
    }


    return <div className="Converter">
        <label>
            Decimal:
            <input type='string'
                value={value?.toString(10) || ""}
                name='decimal'
                onChange={updateValue("decimal",10)}
                disabled={isDisabled("decimal")} />
        </label>
        <label>
            Hexadecimal:
            <input type="string"
                value={value?.toString(16) || ""}
                name = "hex"
                onChange={updateValue("hex",16)}
                disabled={isDisabled("hex")}/>
        </label>
        <label>
            Binary:
            <input
                value={value?.toString(2) || ""}
                name="binary"
                onChange={updateValue("binary",2)}
                disabled={isDisabled("binary")}
            />
        </label>
        <p>clear all input to change the conversion target.</p>
    </div>
}
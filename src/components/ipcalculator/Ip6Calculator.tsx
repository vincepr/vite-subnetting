import { useState } from "react"
import getSubnetData, { SubnetData } from "./ipv6"

/* 
*   JSX Elements, styling, rendering and UI-behavior
*/

/** jsx element that rendes a subnet calculator */
export default function Ip6Calc(){
    const [ip ,setIp] = useState("fe80:d02c::")
    const [oldCidr ,setOldCidr] = useState<number>(12)

    const [activeElement, setActiveElement] = useState<string>()
    const [newCidr ,setnewCidr] = useState<number>()
    const [countSubnets ,setCountSubnets] = useState<number>()

    const [subnets, setSubnets] = useState<SubnetData[]>([])
    const isValidIp = isValidIpAddr(ip)
    const isValidCidr = newCidr ? oldCidr < newCidr : false
    const isDisabled = (elmentName:string) => (activeElement !== undefined && activeElement !==elmentName)

    // ONCHANGE HANDLERS:
    const handleChangeIp =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        let str = ev.target.value
        if (str.includes(",")) str=str.replaceAll(",",".") 
        setIp(str)
    }

    const handleChangeOldCidr =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        let nr = Number(ev.target.value)
        if (isNaN(nr)) return
        if (nr > 63) nr = 63
        setOldCidr(nr)
        if (newCidr && newCidr>nr){
            setCountSubnets(Math.pow(2,(newCidr-nr)))
        }
    }

    const handleChangeNewCidr =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        if (ev.target.value===""){
            setnewCidr(undefined); setCountSubnets(undefined);
            setActiveElement(undefined)
        } else {
            setActiveElement("NewCidr")
            if (!isNaN(Number(ev.target.value))) {
                let cidr = Number(ev.target.value)
                if (cidr >64) cidr =64
                setnewCidr(cidr)
                if (cidr>oldCidr){
                    setCountSubnets(Math.pow(2,(cidr-oldCidr)))
                }
            }
         } 
    }

    const handleChangeCountSubnets =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        if (ev.target.value===""){
            setnewCidr(undefined); setCountSubnets(undefined)
            setActiveElement(undefined)
        } else {
            setActiveElement("CountSubnets")
            if (!isNaN(Number(ev.target.value))) {
                let subnetNr = Number(ev.target.value)
                //if (subnetNr >4194304) subnetNr = 4194304
                setCountSubnets(subnetNr)

                let add = Math.ceil(Math.log2(subnetNr))
                if (add === 0) add = 1
                let cidr = add + oldCidr
                if (cidr >64) {
                    cidr =64
                    setCountSubnets(Math.pow(2,(cidr-oldCidr)))
                }
                setnewCidr(cidr)   
            }
         } 
    }
    
    // ON SUBMIT logic:
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitAnswers()
    }
    const submitAnswers = ()=>{
        // only execute if all is valid:
        if (!isValidIp) return 
        if (!isValidCidr) return
        if (!newCidr) return
        let subs = getSubnetData(ip, oldCidr, newCidr)
        setSubnets(subs)
    }

    // HELPER FUNCTION to validate
    function isValidIpAddr(ip:string){
        let ipv6_regex = /^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/gm;     
        return ipv6_regex.test(ip)
    }

    return(
        <div className="SubnetCalculator">
            <h2>IPv6-Subnet Calculator</h2>
            <p>berechne Subnetze für gewünschte cidr oder Subnetzanzahl:</p>
            <label>
                Ip:
                <input type="text" value={ip} onChange={e => handleChangeIp(e)} onKeyDown={handleKeyDown} style={isValidIp?{}:{color:"red"}}/>
                <> / </>
                <input type="text" value={oldCidr} onChange={e => handleChangeOldCidr(e)} onKeyDown={handleKeyDown} style={{width:"2rem"}}/>
            </label>  
            <label>neue CIDR:
                <input type="text" className="formatInput" value={newCidr ? newCidr : "" } 
                    onChange={e => handleChangeNewCidr(e)} 
                    onKeyDown={handleKeyDown} 
                    disabled={isDisabled("NewCidr")}
                    style={(!isDisabled("NewCidr") && !isValidCidr) ?{color:"red"}: {}}/>
            </label> 
            <label> Subnetzanzahl: 
                <input type="text" className="formatInput" value={countSubnets ? countSubnets : "" } 
                    onChange={e => handleChangeCountSubnets(e)} 
                    onKeyDown={handleKeyDown} 
                    disabled={isDisabled("CountSubnets")}
                    style={(!isDisabled("CountSubnets") && !isValidCidr) ?{color:"red"}: {}}/>
            </label> 
            <button onClick={submitAnswers}>Calculate</button>
            <DrawSubnets subnets={subnets}/>
        </div>
    )
}



/** Jsx-Element that maps out the subnet-data array */
function DrawSubnets({subnets:subs}:{subnets:SubnetData[]}){
    // if were undefinded we dont draw anything
    if ((subs.length<=0)){
        return <div></div>
    }
    //otherwise we draw our Headline then map the data
    return(<>
        <h4>
            NeueCIDR: {subs[0].cidr}, 
            Subnetz-Anzahl: {subs[0].subnetCount}, 
        </h4>
        <h4>
            Neue Netzmaske: {subs[0].newMask}, 
            originale Netzmaske: {subs[0].oldMask}
        </h4>
        <div style={{display:"flex", flexDirection: "row", alignItems: "stretch"}}>
            <div style={{flex:1}}><b>Nr</b></div>
            <div style={{flex:2}}><b>Subnetze</b></div>
            <div style={{flex:2}}><b>Erste Adresse</b></div>
            <div style={{flex:2}}><b>Letzte Adresse</b></div>
        </div>
        {subs.map(sub=>oneSubnet(sub))}
    </>)


    // helper to map one subnet worth of data
    function oneSubnet(s:SubnetData){
        return (
        <div key={s.subnet} style={{display:"flex", flexDirection: "row", alignItems: "stretch"}}>
            <div style={{flex:1}}> {s.nthSubnet}</div>
            <div style={{flex:2}}>{s.subnet+" / "+s.cidr}</div>
            <div style={{flex:2}}>{s.firstHost}</div>
            <div style={{flex:2}}>{s.lastHost}</div>
        </div>)
    }
}




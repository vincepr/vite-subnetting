import { useState } from "react"
import getSubnetData, {SubnetData} from "./ipcalculator/ipv4"


/* 
*   JSX Element, dynamically calculate all Subnets for given user input, 
*    like start-subnet, cidr, maxhosts needed ec
*/

/** jsx element that rendes a subnet calculator */
export default function Ip4Calc(){
    const [ip ,setIp] = useState("10.0.0.0")
    const [oldCidr ,setOldCidr] = useState<number>(8)
    const [newCidr ,setnewCidr] = useState<number>()
    const [activeElement, setActiveElement] = useState<string>()
    const [countSubnets ,setCountSubnets] = useState<number>()
    const [countHosts ,setCountHosts] = useState<number>()
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
        if (nr > 29) nr = 29
        setOldCidr(nr)
        if (newCidr && newCidr>nr){
            setCountSubnets(Math.pow(2,(newCidr-nr)))
        }
    }

    const handleChangeNewCidr =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        if (ev.target.value===""){
            setnewCidr(undefined); setCountSubnets(undefined); setCountHosts(undefined);
            setActiveElement(undefined)
        } else {
            setActiveElement("NewCidr")
            if (!isNaN(Number(ev.target.value))) {
                let cidr = Number(ev.target.value)
                if (cidr >30) cidr =30
                setnewCidr(cidr)
                if (cidr>oldCidr){
                    setCountHosts(-2+Math.pow(2,(32-cidr)));
                    setCountSubnets(Math.pow(2,(cidr-oldCidr)))
                }
            }
         } 
    }

    const handleChangeCountSubnets =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        if (ev.target.value===""){
            setnewCidr(undefined); setCountSubnets(undefined); setCountHosts(undefined);
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
                if (cidr >30) {
                    cidr =30
                    setCountSubnets(Math.pow(2,(cidr-oldCidr)))
                }
                setnewCidr(cidr)
                if (cidr>oldCidr){
                    setCountHosts(-2+Math.pow(2,(32-cidr)));
                }
                
            }
         } 
    }

    const handleChangeCountHosts =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        if (ev.target.value===""){
            setnewCidr(undefined); setCountSubnets(undefined); setCountHosts(undefined);
            setActiveElement(undefined)
        } else {
            setActiveElement("CountHosts")
            if (!isNaN(Number(ev.target.value))) {
                let hostCount = Number(ev.target.value)
                if (hostCount>2147483646) hostCount= 2147483646
                setCountHosts(hostCount)

                let add = 31- Math.floor(Math.log2(hostCount+1))
                let cidr = add
                setnewCidr(cidr)
                if (cidr>oldCidr){
                    setCountSubnets(Math.pow(2,(cidr-oldCidr)))
                }

                
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
        let regex= /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/
        return regex.test(ip)
    }

    return(
        <div className="SubnetCalculator">
            <h2>IPv4-Subnet Calculator</h2>
            <p>berechne (bis zu 200) Subnetze für gewünschte Parameter:</p>
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
            <label> anz. Hosts pro Netz: 
                <input type="text" className="formatInput" value={countHosts ? countHosts : ""} 
                    onChange={e => handleChangeCountHosts(e)} 
                    onKeyDown={handleKeyDown} 
                    disabled={isDisabled("CountHosts")}
                    style={(!isDisabled("CountHosts") && !isValidCidr) ?{color:"red"}: {}}/>
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
            Hosts Per Netz: {subs[0].hostsPerNet}
        </h4>
        <h4>
            Neue Netzmaske: {subs[0].newMask}, 
            originale Netzmaske: {subs[0].oldMask}
        </h4>
        <div style={{display:"flex", flexDirection: "row", alignItems: "stretch"}}>
            <div style={{flex:1}}><b>Nr</b></div>
            <div style={{flex:3}}><b>Subnetze</b></div>
            <div style={{flex:3}}><b>Hosts</b></div>
            <div style={{flex:1, textAlign:"right"}}><b>BroadcastAddr</b></div>
        </div>
        {subs.map(sub=>oneSubnet(sub))}
    </>)


    // helper to map one subnet worth of data
    function oneSubnet(s:SubnetData){
        return (
        <div key={s.subnet} style={{display:"flex", flexDirection: "row", alignItems: "stretch"}}>
            <div style={{flex:1}}> {s.nthSubnet}</div>
            <div style={{flex:3}}>{s.subnet+" / "+s.cidr}</div>
            <div style={{flex:3}}>{s.firstHost+" - "+s.lastHost}</div>
            <div style={{flex:1, textAlign:"right"}}>{s.broadcast}</div>
        </div>)
    }
}


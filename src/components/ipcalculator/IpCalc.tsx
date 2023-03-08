import { useState } from "react"

export default function IpCalc(){
    const [ip ,setIp] = useState("192.0.0.0")
    const [oldCidr ,setOldCidr] = useState<number>(8)
    const [newCidr ,setnewCidr] = useState<number>(12)
    const [activeElement, setActiveElement] = useState<string>()      // :todo
    const [countSubnets ,setCountSubnets] = useState<number>(16)
    const [countHosts ,setCountHosts] = useState<number>(1048574)
    const [subnets, setSubnets] = useState<SubnetData[]>([])
    const isValidIp = isValidIpAddr(ip)
    const isValidCidr = oldCidr < newCidr

    const isDisabled = (elmentName:string) => (activeElement !== undefined && activeElement !==elmentName)

    // ONCHANGE HANDLERS:
    const handleChangeIp =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        let str = ev.target.value
        if (str.includes(",")) str=str.replaceAll(",",".") 
        setIp(str)
    }
    const handleChangeOldCidr =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        let nr = Number(ev.target.value)
        if (nr>=0 && nr<=29){
            setOldCidr(nr)
        } else if (nr >30) setOldCidr(newCidr-1)
    }
    const handleChangeNewCidr =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        let nr = Number(ev.target.value)
        if (nr>=0 && nr<=30){
            setnewCidr(nr)
        } else if (nr>30)setnewCidr(30)
    }
    const handleChangeCountSubnets =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        let nr = Number(ev.target.value)
        setCountSubnets(nr)
    }
    const handleChangeCountHosts =(ev:React.ChangeEvent<HTMLInputElement>) =>{
        let nr = Number(ev.target.value)
        setCountHosts(nr)
    }
    
    // ON SUBMIT logic:
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitAnswers()
    }
    const submitAnswers = ()=>{
        // only execute if all is valid:
        if (!isValidIp) return 
        if (!isValidCidr) return
        let subs = getSubnetData(ip, oldCidr, newCidr)
        setSubnets(subs)
    }
    

    return(
        <div className="SubnetCalculator">
            <h2>IPv4-Subnet Calculator</h2>
            <p>get the Subnets for selected host-count or CIDR</p>
            <label>
                Ip:
                <input type="text" value={ip} onChange={e => handleChangeIp(e)} onKeyDown={handleKeyDown} style={isValidIp?{}:{color:"red"}}/>
                <> / </>
                <input type="text" value={oldCidr} onChange={e => handleChangeOldCidr(e)} onKeyDown={handleKeyDown}/>
                </label>  

            <label>neue CIDR:
                <input type="text" className="formatInput" value={newCidr } 
                    onChange={e => handleChangeNewCidr(e)} 
                    onKeyDown={handleKeyDown} 
                    style={isValidCidr?{}:{color:"red"}}/>
                </label> 
            <label> Subnetzanzahl: 
                <input type="text" className="formatInput" value={countSubnets } 
                    onChange={e => handleChangeCountSubnets(e)} 
                    onKeyDown={handleKeyDown} 
                    style={isValidCidr?{}:{color:"red"}}/>
                </label> 
            <label> anz. Hosts pro Netz: 
                <input type="text" className="formatInput" value={countHosts } 
                    onChange={e => handleChangeCountHosts(e)} 
                    onKeyDown={handleKeyDown} 
                    style={isValidCidr?{}:{color:"red"}}/>
                </label> 
            <button onClick={submitAnswers}>Calculate</button>
            <DrawSubnets subnets={subnets}/>
        </div>
    )
}

function DrawSubnets({subnets:subs}:{subnets:SubnetData[]}){
    if ((subs.length<=0)){
        return <div></div>
    }

    function oneSubnet(s:SubnetData){
        return (
        <div key={s.subnet} style={{display:"flex", flexDirection: "row", alignItems: "stretch"}}>
            <div style={{width:"15%"}}> {s.nthSubnet}</div>
            <div style={{flex:1}}>{s.subnet+" / "+s.cidr}</div>
            <div style={{flex:1}}>{s.firstHost+" - "+s.lastHost}</div>
            <div style={{flex:1}}>{s.broadcast}</div>
            <div style={{flex:1}}>{s.mask}</div>
        </div>)
    }

    return(<>
        <h3>CIDR: {subs[0].cidr}, Subnetz-Anzahl: {subs[0].subnetCount},   Hosts Per Netz: {subs[0].hostsPerNet}</h3>
        <div style={{display:"flex", flexDirection: "row", alignItems: "stretch"}}>
            <div style={{width:"15%"}}><b>Nr</b></div>
            <div style={{flex:1}}><b>Subnetze</b></div>
            <div style={{flex:1}}><b>Hosts</b></div>
            <div style={{flex:1}}><b>BroadcastAddr</b></div>
            <div style={{flex:1}}><b>Netzwerkmaske</b></div>
        </div>
        {subs.map(sub=>oneSubnet(sub))}
    </>)
}


// original calc -> crashes and gets slow on big ones so we modify it
function calcSubnets(ip:string, oldCidr:number, newCidr:number) {
    let newSubnets = []
    let ipNum = (ip.split(".").map(str => parseInt(str))).reduce((acc, x) => (acc << 8) + x)
    let mask = (-1 << (32 - oldCidr)) >>> 0;
    let subnetIpNum = ipNum & mask
    let subnetCount = 2 ** (newCidr - oldCidr)
    for (let i = 0; i < subnetCount; i++) {
        let subnet = (subnetIpNum + (i << (32 - newCidr))) >>> 0
        newSubnets.push(
            [(subnet >>> 24) & 255, (subnet >>> 16) & 255, (subnet >>> 8) & 255, subnet & 255].join(".")
        )
    }
    return newSubnets
}

// quick calc that skips a certain cutoff
function calcSubnetsFast(ip:string, oldCidr:number, newCidr:number, cutoff:number) :SubnetData[] {
    let newSubnets = []
    let ipNum = (ip.split(".").map(str => parseInt(str))).reduce((acc, x) => (acc << 8) + x)
    let mask = (-1 << (32 - oldCidr)) >>> 0;
    let subnetIpNum = ipNum & mask
    let subnetCount = 2 ** (newCidr - oldCidr)
    if (subnetCount > cutoff*2){
        // first -> cuttoff : subnets
        for (let i=0; i<cutoff; i++){
            let subnetData = calcData(subnetIpNum, i, newCidr, mask, subnetCount)
            newSubnets.push(subnetData)
        }
        // (last-cutoff) -> last : subnets
        for (let i=(subnetCount-cutoff); i<subnetCount; i++){
            let subnetData = calcData(subnetIpNum, i, newCidr, mask, subnetCount)
            newSubnets.push(subnetData)
        }
    } else {
        // calculate all if were below our cutoff
        for (let i = 0; i < subnetCount; i++) {
            let subnetData = calcData(subnetIpNum, i, newCidr, mask, subnetCount)
            newSubnets.push(subnetData)
        }
    }
    return newSubnets

    

    // helper function calculates all data for one subnet and squezes it in obj
    function calcData(subnetIpNum:number, i:number, newCidr:number, mask:number, subnetCount:number):SubnetData{

        function subnetStringify(subnet:number){
            return [(subnet >>> 24) & 255, (subnet >>> 16) & 255, (subnet >>> 8) & 255, subnet & 255].join(".")
        }

        let subnet = (subnetIpNum + (i << (32 - newCidr))) >>> 0
        let broadcast = -1 + (subnetIpNum + (i+1 << (32 - newCidr))) >>> 0
        return {
            subnet : subnetStringify(subnet) ,
            cidr:   newCidr,
            firstHost: subnetStringify(subnet+1) ,
            lastHost: subnetStringify(broadcast-1) ,
            broadcast: subnetStringify(broadcast) ,
            mask: subnetStringify(mask),
            hostsPerNet: broadcast-subnet-1,
            subnetCount: subnetCount,
            nthSubnet: i+1,
        }
    }
}

type SubnetData = {
    subnet: string;
    cidr: number;
    firstHost: string;
    lastHost: string;
    broadcast: string;
    mask: string;
    hostsPerNet: number;
    subnetCount: number;
    nthSubnet?: number;
}


function getSubnetData(ip:string, oldCidr:number, newCidr:number){
    const cutoff = 100
    let ips = calcSubnetsFast(ip, oldCidr, newCidr, cutoff)
    if (ips.length >= cutoff*2){
        // if did skipp after cutoff we do a set of ...s in the middle to indicate this
        let firstHalf = ips.slice(0, cutoff)
        let secondHalf = ips.slice(cutoff)
        let dotDot = {
            subnet: "...",
            cidr: firstHalf[0].cidr,
            firstHost: "...",
            lastHost: "...",
            broadcast: "...",
            mask: "...",
            hostsPerNet: firstHalf[0].hostsPerNet,
            subnetCount: firstHalf[0].subnetCount,
        }
        ips = [...firstHalf ,dotDot,...secondHalf]
    }
    return ips
}

function isValidIpAddr(ip:string){
    let regex= /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/
    return regex.test(ip)
}
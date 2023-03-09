import { useState } from "react"

/* 
*   JSX Elements, styling, rendering and UI-behavior
*/

/** jsx element that rendes a subnet calculator */
export default function Ip6Calc(){
    const [ip ,setIp] = useState("fe00::")
    const [oldCidr ,setOldCidr] = useState<number>(8)

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
            <div style={{flex:2}}><b>Subnetze</b></div>
            <div style={{flex:2}}><b>Hosts</b></div>
            <div style={{flex:1}}><b>BroadcastAddr</b></div>
        </div>
        {subs.map(sub=>oneSubnet(sub))}
    </>)


    // helper to map one subnet worth of data
    function oneSubnet(s:SubnetData){
        return (
        <div key={s.subnet} style={{display:"flex", flexDirection: "row", alignItems: "stretch"}}>
            <div style={{flex:1}}> {s.nthSubnet}</div>
            <div style={{flex:2}}>{s.subnet+" / "+s.cidr}</div>
            <div style={{flex:2}}>{s.firstHost+" - "+s.lastHost}</div>
            <div style={{flex:1}}>{s.broadcast}</div>
        </div>)
    }
}













function stringToHalfSubnet(str:string):HalfIP{

    return [0xfe00,0xffff,0,0]
}


/* function get data and split it in half with "..."s */
function getSubnetData(ip:string, oldCidr:number, newCidr:number) :SubnetData[]{
    const cutoff = 50
    let halfIP = stringToHalfSubnet(ip)
    let ips:SubnetData[] = calcIpv6Subnets(halfIP, oldCidr, newCidr, cutoff)
    if (ips.length >= cutoff*2){
        // if did skipp after cutoff we do a set of ...s in the middle to indicate this
        let firstHalf = ips.slice(0, cutoff)
        let secondHalf = ips.slice(cutoff)
        let dotDot = {
            subnet: "...",
            cidr: firstHalf[0].cidr,
            oldMask: "...",
            newMask: "...",
            subnetCount: firstHalf[0].subnetCount,
            nthSubnet: cutoff+1,
        }
        ips = [...firstHalf ,dotDot,...secondHalf]
    }
    return ips
}



/* 
*
*   CALCULATING DATA AND FORMATING IT:
*
*/

type SubnetData = {
    subnet: string;
    cidr: number;
    firstHost?: string;
    lastHost?: string;
    broadcast?: string;
    oldMask: string;
    newMask: string;
    hostsPerNet?: number;
    subnetCount: number;
    nthSubnet: number;
}


type HalfIP = [number, number, number, number]        // ["fe00":"ffff":"ff00":"00ff"] -> []


function calcIpv6Subnets(ip:HalfIP , oldCidr:number, newCidr:number, cutoff:number) :SubnetData[]{
    let subnetsData = []
    let mask   = createIpv6Masks(oldCidr)
    let zeroSub = bitwiseAND(ip, mask)
    let differential = findOneDigit(newCidr)
    let subnetCount = 2 ** (newCidr - oldCidr)
    if (subnetCount <= cutoff*2){
        // calculate everything if were below our cutoff:
        for (let i = 0; i<subnetCount; i++){
            let subnet = add(zeroSub, multiply(differential,i))     //basically: subnet = zeroSubnet + i*differential
            subnetsData.push(calcData(subnet,newCidr,mask,i))
        }
    } else {
        // first -> cuttoff : subnets
        for (let i=0; i<cutoff; i++){
            let subnet = add(zeroSub, multiply(differential,i))
            subnetsData.push(calcData(subnet,newCidr,mask,i))
        }
        // (last-cutoff) -> last : subnets
        for (let i=(subnetCount-cutoff); i<subnetCount; i++){
            let subnet = add(zeroSub, multiply(differential,i))
            subnetsData.push(calcData(subnet,newCidr,mask,i))
        }
    }
    return subnetsData

    // helper function calculates all data for one subnet and squezes it in obj
    function calcData(subnet:HalfIP, newCidr:number, mask:HalfIP, i:number):SubnetData{
        let newMask   = createIpv6Masks(newCidr)
        return {
            subnet : subnetStringify(subnet) ,
            cidr:   newCidr,
            oldMask: subnetStringify(mask),
            newMask: subnetStringify(newMask),
            subnetCount: subnetCount,
            nthSubnet: i+1,
        }
        function subnetStringify(x:HalfIP) :string{
            return x[0].toString(16) +":"+ x[1].toString(16) +":"+ x[2].toString(16) +":"+ x[3].toString(16)+"::"
        }
    }
}


//** HELPER Functions */
function createIpv6Masks(cidr:number) : HalfIP{
    let str = "1".repeat(cidr)+"0".repeat(64-cidr)                                                                                                                      //  cidr=6 -> "11111100..." 
    //let negativeStr = "0".repeat(cidr)+"1".repeat(64-cidr) 
    const splitParse= (str:string) => [parseInt(str.slice(0,16),2), parseInt(str.slice(16,32),2), parseInt(str.slice(32,48),2), parseInt(str.slice(-16),2)] as HalfIP   //->[0xfc00, 0, 0,0]
    let mask: HalfIP = splitParse(str)
    //let negativeMask: HalfIP = splitParse(negativeStr)
    return mask
}


function bitwiseAND(x:HalfIP, y:HalfIP) : HalfIP{
    let bitwiseAnd = []
    for (let i in  x) {
        bitwiseAnd.push( x[i] & y[i] )
    }
    return bitwiseAnd as HalfIP
}

function multiply(x:HalfIP, times:number){
    const max = 0xffff      // maxInt for each segment
    let result : HalfIP = [0,0,0,0]
    let ubertrag = 0

    for (let i=x.length-1; i>=0; i--){
        let s = x[i] * times + ubertrag
        let {remainder:value, transfer:newTransfer} =getOverflow(s)
        result[i]=value
        ubertrag = newTransfer
    }
    if (ubertrag>=1) console.error("halfIPMultiplication() overrunn!!! sum is to big",x,times)
    return result
}

function add(x:HalfIP, y:HalfIP): HalfIP{
    let sum: HalfIP = [0,0,0,0]
    let ubertrag = 0

    for (let i=x.length-1; i>=0; i--){
        let s = x[i] + y[i] + ubertrag
        let {remainder:value, transfer:newTransfer} =getOverflow(s)
        sum[i]=value
        ubertrag = newTransfer
    }
    if (ubertrag>=1) console.error("halfIPAddition() overrunn!!! sum is to big", x, y)
    return sum
}

// get a Addr with  only binary0s and only one "1" at the cidr location
function findOneDigit(cidr:number) : HalfIP{
    const splitParse= (str:string) => [parseInt(str.slice(0,16),2), parseInt(str.slice(16,32),2), parseInt(str.slice(32,48),2), parseInt(str.slice(-16),2)] as HalfIP  
    let str = "0".repeat(cidr-1)+"1"+"0".repeat(64-cidr)
    return splitParse(str)
}


// for a block of digits of numbersystem:base(2binary, 16hex) how much of nr fits into it
// and how much of does have to be transfered into the next higher digit
// example 1110+0101 -> 0011 with transfer of 1 -> ...1 0011
function getOverflow(nr:number, base?:number, digits?:number):{transfer:number, remainder:number}{
    const bas = base? base : 16
    const dig = digits ? digits : 4
    const totalBase = Math.pow(bas,dig)         // theoretical base of our block if it was a number system
    const maxVal = totalBase -1                 // basically 0xFFFF for this
    
    if (nr <= maxVal) return {transfer:0, remainder:nr}

	let remainder = nr % totalBase
	let transfer = Math.floor(nr/totalBase)
    return {transfer:transfer, remainder:remainder}
}
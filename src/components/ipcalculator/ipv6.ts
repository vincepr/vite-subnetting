

/* function get data and split it in half with "..."s */
export default function getSubnetData(ip:string, oldCidr:number, newCidr:number) :SubnetData[]{
    const cutoff = 100
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


// isValid-check ipv6-addr must be done before!
function stringToHalfSubnet(str:string):HalfIP{
    const maxlen = 8;      // length of the full ip in required blocks
    // removing the :: short-form if it exists:
    let ip : string[] = []
    if (str.includes("::") ){
        let undot = str.split("::")
        let u1 = undot[0].split(":").filter(str=>str!=="")
        let u2 = undot[1].split(":").filter(str=>str!=="")
        for (let i=0; i<8;i++){
            if (u1.length>0) { 
                let s = u1.shift()
                s &&ip.push(s)
            }
            else if (maxlen-ip.length>u2.length) {
                ip.push("0")
            } else{
                let s = u2.shift()
                s &&ip.push(s)
            }
        }

    } else{
        ip = str.split(":").filter(str=>str!=="")
    }
    //so far: -> [fe12:1:2::3ff1:ff] ->  ['fe12', '1', '2', '0', '0', '0', '3ff1', 'ff']
    // now we do the string-> ints and double the elements: ["fe12", "f1de"... -> [0xfe, 0x12, 0xf1, 0xde ...]
    let halfIP:any[] = []
    ip.forEach((val, idx, arr)=>{
        if (val.length<3){
            halfIP.push(0)
            let slice = (parseInt(val))
            if (!isNaN(slice))     halfIP.push(slice)
        } else{
            let slice1 = parseInt( val.slice(-4,-2)   ,16 )
            let slice2 = parseInt( val.slice(-2) ,16 )
            if (!isNaN(slice1))     halfIP.push(slice1)
            if (!isNaN(slice2))     halfIP.push(slice2)
        }
    })
    return  halfIP.filter((val, idx)=>idx<maxlen) as HalfIP
}





/* 
*
*   CALCULATING DATA AND FORMATING IT:
*
*/

export type SubnetData = {
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



// 64Bit/half of ipv6 split into chunks: ex: [ff,00,f0,12,0,0,0,0,ff,ff,ff,ff,1f,d2,c3,e4]
//               fe      00    :     e1   00    :      0      :      0      d1   ::
export type HalfIP = [number, number,  number, number,  number, number,  number, number]


function calcIpv6Subnets(ip:HalfIP , oldCidr:number, newCidr:number, cutoff:number) :SubnetData[]{
    let subnetsData = []
    let {mask:mask}   = createIpv6Masks(oldCidr)
    let zeroSub = bitwiseAND(ip, mask)
    let differential = findOneDigit(newCidr)

    // subnet count will overflow if new-old>53 so we protect against it with the max safe int as default
    let subnetCount = Number.MAX_SAFE_INTEGER
    if ((newCidr-oldCidr)<52) {
        subnetCount = 2 ** (newCidr - oldCidr) 
    }

    if (subnetCount <= cutoff*2){                                       //we need "overflow" safety for these following comparisons against subnetCount
        // calculate everything if were below our cutoff:
        for (let idx = 0; idx<subnetCount; idx++){
            let subnet = add(zeroSub, multiply(differential,idx))       //<- subnet = zeroSubnet + idx*differential
            subnetsData.push(calcData(subnet,newCidr,mask,idx, oldCidr))
        }
    } else {
        // first -> cuttoff 
        for (let idx=0; idx<cutoff; idx++){
            let subnet = add(zeroSub, multiply(differential,idx))
            subnetsData.push(calcData(subnet,newCidr,mask,idx, oldCidr))
        }
        // (last-cutoff) -> last 
        for (let i=0; i<cutoff; i++){
            let idx = subnetCount-cutoff+i                              //if we overflow these might be incorrect but whatever, to big to read anyways
            let subnet= add(zeroSub, multiply(differential,idx))
            subnetsData.push(calcData(subnet,newCidr,mask,idx, oldCidr))
        }
    }
    return subnetsData

    // helper function calculates all data for one subnet and squezes it in obj
    function calcData(subnet:HalfIP, newCidr:number, mask:HalfIP, i:number, oldCidr:number):SubnetData{
        let {mask:newMask, negativeMask:newNegativeMask}   = createIpv6Masks(newCidr)
        let lastHost = add(subnet, newNegativeMask)
        return {
            subnet : subnetStringify(subnet)+":" ,
            cidr:   newCidr,
            oldMask: subnetStringify(mask)+":",
            newMask: subnetStringify(newMask)+":",
            subnetCount: 2 ** (newCidr - oldCidr) ,
            nthSubnet: i+1,
            firstHost: subnetStringify(subnet)+":",
            lastHost: subnetStringify(lastHost)+"ffff:ffff:ffff:ffff",
        }

        
    }
}


//** HELPER Functions */
function subnetStringify(x:HalfIP) :string{
    const blocksize=16*16
    let b1 = ( blocksize*x[0]+x[1] ).toString(16)+":"
    let b2 = ( blocksize*x[2]+x[3] ).toString(16)+":"
    let b3 = ( blocksize*x[4]+x[5] ).toString(16)+":"
    let b4 = ( blocksize*x[6]+x[7] ).toString(16)+":"
    if((b2+b3+b4) === "0:0:0:") return b1
    if((b3+b4) === "0:0:") return b1+b2
    if((b4) === "0:") return b1+b2+b3
    return b1+b2+b3+b4
}

function binaryStrToIpv6Half(str:string){
    return [
        parseInt(str.slice(0,8),2), parseInt(str.slice(8,16),2), 
        parseInt(str.slice(16,24),2), parseInt(str.slice(24,32),2), 
        parseInt(str.slice(32,40),2), parseInt(str.slice(40,48),2), 
        parseInt(str.slice(48,56),2), parseInt(str.slice(56,64),2)] as HalfIP

}

function createIpv6Masks(cidr:number) {
    let str         = "1".repeat(cidr)+"0".repeat(64-cidr)                                                                                                                      //  cidr=6 -> "11111100..." 
    let negativeStr = "0".repeat(cidr)+"1".repeat(64-cidr) 
    let mask: HalfIP         = binaryStrToIpv6Half(str)
    let negativeMask: HalfIP = binaryStrToIpv6Half(negativeStr)
    return {mask:mask, negativeMask: negativeMask}
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
    let result : HalfIP = [0,0,0,0, 0,0,0,0]
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
    let sum: HalfIP = [0,0,0,0, 0,0,0,0]
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
    let str = "0".repeat(cidr-1)+"1"+"0".repeat(64-cidr)
    return binaryStrToIpv6Half(str)
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
// class that holds an ipv4 and all relevant data to it. Random if no default. 
// .getInfo() -> info regarding the ip adress.
// .getRandomSubnet() -> creates a random subnet combination of the subnet and passes back info about it.

// output
export type V6OutputIpInfo = {
    ip: string[];
    cidr: number;
    netid: string[];
    firstHost: string[];
    lastHost: string[];
    maxPossibleSubnets: number;
}

export type V6OutputSubnetInfo = {
    newCidr: number;
    subnetCount: number;
    rngSubnetCount: number;
    firstSubnet: V6OutputIpInfo;
    lastSubnet: V6OutputIpInfo;
}




export default class IPv6{
    ipArray : number[]
    cidr: number
    netid: number[]
    firstHost: number[]
    lastHost: number[]
    info: V6OutputIpInfo
    
    constructor(ip:number[] | "random" = "random", cidr:number=32){
        if (ip==="random"){
            let rng = getRandomIp()
            this.ipArray = rng.ip
            this.cidr= rng.cidr
        }
        else{
            this.ipArray=ip
            this.cidr = cidr
        }
        let calculated = getCalculatedInfo(this.ipArray, this.cidr)
        this.netid=calculated.netid
        this.firstHost=this.netid
        this.lastHost=calculated.lastHost
        this.info=this.getInfo()
    }

    getInfo(): V6OutputIpInfo{
        return  {
            ip:         humanizeIp(this.ipArray),
            cidr:       this.cidr,
            netid:      humanizeIp(this.netid),
            firstHost:  humanizeIp(this.firstHost),
            lastHost:   humanizeIp(this.lastHost),
            maxPossibleSubnets: Math.pow(2, (64-this.cidr) ),
        }
    }

    getRandomSubnet(): V6OutputSubnetInfo{
        let newCidr = getRandomIntInclusive(this.cidr+2, 64)
        let subnetCount = Math.pow(2, newCidr-this.cidr)
        let rngSubnetCount = getRandomIntInclusive(1+Math.pow(2, newCidr-this.cidr-1),subnetCount)
        
        let FirstSubnet = new IPv6(this.netid, newCidr)
        let LastSubnet = new IPv6(this.lastHost, newCidr)
        


        return {
            newCidr : newCidr,
            subnetCount: subnetCount,
            rngSubnetCount: rngSubnetCount,
            firstSubnet: FirstSubnet.info,
            lastSubnet: LastSubnet.info,
        }
    }

}



function getRandomIntInclusive(min:number, max:number):number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);   // The maximum is inclusive and the minimum is inclusive
}



// we just subnet on the 32bit before the hostpart -> so its not the full subnetmask-range possible. partNetid partFirsthost etc...
function getCalculatedInfo(ipArray:number[], cidr:number){
    // extract the 32 bit out of the Array then calculate netid, firsthost, lasthost on 32 relevant bits:
    let partIp = ipArray[2]*65536+ipArray[3]
    let masks=calcNetMasks(cidr-32)
    let partSubnetMask = masks.sub
    let partHostnetMask = masks.host
    let partNetid = bitwiseAnd_32bit(partIp,  partSubnetMask)
    let partFirsthost = partNetid+1
    let partLasthost = partIp+ partHostnetMask
    // bring those 32 bit back into the ipArray:
    return {
        netid: pushIntoArray(partNetid, ipArray),
        lastHost: pushIntoArray(partLasthost, ipArray)
    }

    //helper functions for the code above:
    //funkcion to make out of a 32 bit number 2 16bit blocks and squeeze them into the array
    function pushIntoArray(twoBlocks:number, ipArray: number[]){
        let highBlockBits = Math.floor(twoBlocks / 65536)
        let lowBlockBits = twoBlocks % 65536
        return [ipArray[0],ipArray[1], highBlockBits, lowBlockBits, 0,0,0,0,]
    }
    function bitwiseAnd_32bit(value1:number, value2:number) {
        const maxInt32Bits = 65536; // 2^16 Split 32 bit into 2 16 bit chunks
    
        const value1_highBits = value1 / maxInt32Bits;
        const value1_lowBits = value1 % maxInt32Bits;
        const value2_highBits = value2 / maxInt32Bits;
        const value2_lowBits = value2 % maxInt32Bits;
        return (value1_highBits & value2_highBits) * maxInt32Bits + (value1_lowBits & value2_lowBits)
    }
    function calcNetMasks(cidr:number){
        /**flip all bits for some-ammount of digits */
        function flipbits(v:number, digits:number) {
            return ~v & (Math.pow(2, digits) - 1);
        }
    
        // get 11110000... for cidr times 1s
        let binaryDigits = ``
        for (let i =0; i<32; i++){
            if (i<cidr){binaryDigits+="1"}
            else {binaryDigits+="0"}
        }
        // calculate the 2 masks
        let decimalSubnetMask = parseInt(binaryDigits,2)
        let decimalHostMask = flipbits(decimalSubnetMask, 32)
    
        return {sub: decimalSubnetMask, host: decimalHostMask}
    }
}




function getRandomIp(){
    let rngIp= [0xfe00,]                                            // start with a "private ip block"
    if (Math.random() < 0.5){
        for (let i of [1,2,3]){
            rngIp.push(rngChunk())                                  // priorize subnet part
        }
        for (let i of [1,2,3,4]){
            rngIp.push(0)                                           // for training purpose priorize :: at host
        }
    } else {
        for (let i=0; i<7 ; i++){
            rngIp.push(rngChunk())                                  // failback of total random ip (with random hostpart)
        }
    }
    let rng = {ip:rngIp, cidr:getRandomIntInclusive(32,63)}
    return rng

    //helper functions for the code above:

    
    function rngChunk(){
        if (Math.random()<0.4){
                return getRandomIntInclusive(0, 0xFFF)              // priorize 0 as the first hexa-digit -> or it is statistically way to unlikely.
        }
        else if (Math.random()<0.3){
            return getRandomIntInclusive(0, 0xFFFF)                 // default full random range
        }
        return 0                                                    // priroize 0 or it is way to unlikely
    }
}




/** from numbers[99251,0,300,0,0,0,0] make string like fe1:0:20:: */
function humanizeIp(hexaIp: number[]){
    let asStrings = toNumbersArray(hexaIp)
    let combinations = allPossibleCombinations(asStrings)
    combinations = filterCombinations(combinations)
    return stringify(combinations, asStrings)

    // helper functions for the code above:

    type SliceOfZeros = 
        {slice:string[], start:number, end:number}

    function toNumbersArray(array: number[]) : string[] {
        let hexaIpInStrings = []
        for (let chunk of array){
            hexaIpInStrings.push(chunk.toString(16))
        }
        return hexaIpInStrings
    }
    function allPossibleCombinations(arr: string[]){
        let combinations:SliceOfZeros[] = []
        // find all combinations of concurrent chunks
        for(let start=0; start<arr.length; start++){
            for(let end=start+1; end<arr.length+1; end++){
                let slice = arr.slice(start, end)
                if(slice.length>1){combinations.push({slice:slice, start:start, end:end})}
            }
        }
        return combinations
    }
    function filterCombinations(arr: SliceOfZeros[]){    
        let combinations= arr
        // filter out all that include  a NOT "0" chunk
        combinations = combinations.filter((a)=>isAllZeros(a.slice))
        // get longest repetition/repetitions of "0"s
        let lengths = combinations.map(a=>a.slice.length)
        let maxLength = Math.max(...lengths)
        let possibleSubstitutions = combinations.filter((a) => (a.slice.length===maxLength))
        return possibleSubstitutions
        // return true if every element of the array is "0"
        function isAllZeros(arr:string[]){
            let isAllZeros = true
            arr.forEach(
                (string)=>{
                    if(!(string==="0")){isAllZeros = false}}
            )
            return isAllZeros}
    }
    //make string of every valid shortened ipv6 (with ":"s and one "::"):
    function stringify(possibleSubstitutions: SliceOfZeros[], hexaIp:string[]){
        if(possibleSubstitutions.length===0){
            return [ hexaIp[0]+":"+hexaIp[1]+":"+hexaIp[2]+":"+hexaIp[3]+":"+hexaIp[4]+":"+hexaIp[5]+":"+hexaIp[6]+":"+hexaIp[7], ]     // case no substitutions -> no ::
        }
        let strArray: string[] = []
        for (let subst of possibleSubstitutions){
            let substituteString = ""
            hexaIp.forEach((chunk, index)=>{
                if(index===7 && !(index===subst.end-1)){
                    substituteString+=chunk                             //reached end -> no finishing : needed
                }else if(!(subst.start<=index && index<subst.end)){
                    substituteString+=chunk+":"                         //build normal chunk + ":"
                } else if( index===subst.start){
                    substituteString+=":"                               //substitute the :: for the successive 0s
                }
            })
            strArray.push(substituteString)
        }
        return strArray
    }
}

















/*

class IPv4{
    // using numbers not human like "10.2.3.4" patterns for ips
    ip: number
    cidr: number
    subnetmask: number
    hostnetmask: number
    netid:number
    broadcast: number
    firstHost: number
    lastHost: number
    info: OutputIpInfo


    constructor(ip:number=0, cidr= 8){
        if (ip===0){                                        // using for random ip
            let random = getRandomPrivateIp()               // returns everything in decimal values / normal numbers
            this.ip = random.ip
            this.cidr = random.cidr
        }else{
            this.ip=ip
            this.cidr = cidr
        }

        // calc net-masks:
        let masks=calcNetMasks(this.cidr)
        this.subnetmask = masks.sub
        this.hostnetmask = masks.host

        //calc netz-id
        this.netid = bitwiseAnd_53bit(this.ip,  this.subnetmask)
        this.broadcast = this.netid+ this.hostnetmask
        this.firstHost = this.netid + 1
        this.lastHost = this.broadcast -1
        this.info=this.getInfo()
    }

    getInfo(): OutputIpInfo{
        let info = {
            ip: humanizeIp(this.ip),
            //ip_dec: this.ip,
            cidr: this.cidr,
            subnetmask: humanizeIp(this.subnetmask),
            //subnetmask_dec: this.subnetmask,
            hostnetmask: humanizeIp(this.hostnetmask),
            netid: humanizeIp(this.netid),
            //netid_dec: this.netid,
            broadcast: humanizeIp(this.broadcast),
            firstHost: humanizeIp(this.firstHost),
            lastHost: humanizeIp(this.lastHost),
            maxPossibleHosts: Math.pow(2, (32-this.cidr) )-2,
        }
        return info
    }

    getRandomSubnet():OutputSubnetInfo{
        let newCidr = getRandomIntInclusive(this.cidr+1, 30)
        let subnetCount = Math.pow(2, newCidr-this.cidr)
        let rngSubnetCount = getRandomIntInclusive(1+Math.pow(2, newCidr-this.cidr-1),subnetCount)
        
        let FirstSubnet = new IPv6(this.netid, newCidr)
        let SecondSubnet = new IPv6(FirstSubnet.broadcast+1 , newCidr)
        let LastSubnet = new IPv6(this.broadcast, newCidr)

        let maxHosts =      Math.pow(2, (32-newCidr) )-2
        let minHosts = 1 +  Math.pow(2, (32-newCidr-1) )-2
        let rngHosts = getRandomIntInclusive(minHosts, maxHosts)
        

        let data:OutputSubnetInfo = {
            newCidr : newCidr,
            maxHostsPerSubnet : maxHosts,
            rngHostsPerSubnet:rngHosts,
            subnetCount: subnetCount,
            rngSubnetCount: rngSubnetCount,
            firstSubnet: FirstSubnet.info,
            lastSubnet: LastSubnet.info,
        }
        // case more than 2 Subnets:
        if (!(SecondSubnet.netid===LastSubnet.netid)){
            data.secondSubnet= SecondSubnet.info
            
        }
        return data
    }
}


// cidr->4->1111000000....0 -> int 
function calcNetMasks(cidr:number){
    //flip all bits for some-ammount of digits 
    function flipbits(v:number, digits:number) {
        return ~v & (Math.pow(2, digits) - 1);
    }

    // get 11110000... for cidr times 1s
    let binaryDigits = ``
    for (let i =0; i<32; i++){
        if (i<cidr){binaryDigits+="1"}
        else {binaryDigits+="0"}
    }
    // calculate the 2 masks
    let decimalSubnetMask = parseInt(binaryDigits,2)
    let decimalHostMask = flipbits(decimalSubnetMask, 32)

    return {sub: decimalSubnetMask, host: decimalHostMask}
}


// Bitwise AND Works with values up to 2^53 since 32Bit-SIGNED! numbers are not enough for full IP-Adresses
function bitwiseAnd_53bit(value1:number, value2:number) {
    const maxInt32Bits = 65536.0; // 2^16 Split 32 bit into 2 16 bit chunks

    const value1_highBits = value1 / maxInt32Bits;
    const value1_lowBits = value1 % maxInt32Bits;
    const value2_highBits = value2 / maxInt32Bits;
    const value2_lowBits = value2 % maxInt32Bits;
    return (value1_highBits & value2_highBits) * maxInt32Bits + (value1_lowBits & value2_lowBits)
}





// get a random PRIVATE Ipv4 Adress. (Broadcast or ) 
function getRandomPrivateIp(){
    // randomize with "equal" chances
    let rng = Math.random()
    let ip
    if (rng < 0.33) {
        ip = {min: 167772160, max: 184549375, cidr:  8}                 // 10.0.0.0/8 -> von 10*2^24 bis 10*2^24+255*2^16+255*2^8+255
    }
    else if (rng<0.66){
        ip = {min: 2886729728, max: 2887843839, cidr: 12}               // 172.16.0.0/12
    }
    else {
        ip = {min: 3232235520, max: 3232301055, cidr: 16}               // 192.168.0.0/16
    }

    // half the time we want to use the default cidr, since it's most commonly used. 
    // Otherwise we set it to a random possible number: (ex 8-30)
    rng = Math.random()
    if (rng<0.5){
        ip.cidr = getRandomIntInclusive(ip.cidr, 29)    	            // cidr=/29 ->2subnets-> /30 last possible subnet configuration
    }

    return { ip: getRandomIntInclusive(ip.min, ip.max), cidr: ip.cidr}

}


// deicmal INT to human dottet-IP. example: 259 -> 0.0.1.3 
function humanizeIp(inputInt:number):string{
    // split INT into chunks of (x ammounts of bits)-Sized chunks 
    function splitIntoChunks(inputInt:number, maxBits = 32, bitsPerChunk = 8):string{
        function recursion(inputInt:number, exponent:number, bitsPerChunk:number):string{
            let currentChunk = Math.pow(2, exponent)
            if (exponent <= 0){return inputInt.toString()}
            let digit = Math.floor(inputInt/currentChunk)
            let digitString:string
            if (digit === 0){digitString = "0"}
            else{digitString = digit.toString()}
            let followingDigits = recursion(inputInt%currentChunk, (exponent-8), bitsPerChunk )
            return  digitString + "."+followingDigits
        }
        return recursion(inputInt, (maxBits-bitsPerChunk), bitsPerChunk)          // 24 bit to get the frist 32-24 bit and then 
    }
    return splitIntoChunks(inputInt)
}


// 10.0.0.0 -> 167772160  
function humanToDecimal(str:string):number{
    if (!(typeof str === 'string')){throw "error: cant parse Ipv4-adress, no string"}
    let chunks = str.split(".")
    if (!(chunks.length ===4)){throw "error: cant parse Ipv4-adress, format broken"}
    let currentPow = 24               // 2^24 -> 2^16 -> 2^8 -> 2^0
    let sum = 0
    for (let chunk of chunks){
        let int = parseInt(chunk)
        if (isNaN(int) || int >255){throw "error: cant parse Ipv4-adress, NaN or >255"}
        sum += int * Math.pow(2, currentPow) 
        currentPow -=8
    }
    return sum
}

*/
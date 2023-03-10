import getSubnetData, { HalfIP, stringToHalfSubnet, SubnetData } from "./ipv6"

// create a new ip & Subnet combination and only pass on relevant info for the IpGame


type gameData= {
    headerText: string[]
    subnets: IPv6_OneSubnet[]
}

type IPv6_OneSubnet = {
    name: string
    questionAnswers: {
        question: string
        answer: string[]
    }[] 
}


export default function createDataIPv6Game():gameData{
    let {oldCidr:oldCidr, newCidr:newCidr, rngSubCount:rngSubCount } = randomizeCidrs()
    let rngIp = getRandomIPv6()
    let subs = getSubnetData(rngIp, oldCidr, newCidr)
    let data = getQsAndAnswers(subs)
    
    return {
        headerText: getHeaderTxt(rngIp, oldCidr, rngSubCount, newCidr),
        subnets: data,
    }

    function getHeaderTxt(ipname:string, oldCidr:number, rngSubnetCount:number, newCidr:number){
        if (Math.random()<0.6){
            return [
                `Gegeben ist die Ip adresse: ${ipname}/${oldCidr}.`,
                `Es werden ${rngSubnetCount} Subnetze benötigt.`,
                `Berechne:`,
            ]
        }else{
            return [
                `Für das Netz ${ipname}/${oldCidr} werden Subnetze`,
                `mit der neuen CIDR: /${newCidr} benötigt.`,
                `Berechne:`,
            ]
        }
    }
}


function getQsAndAnswers(subs:SubnetData[]) :IPv6_OneSubnet[] {
    let questionsData = []
    const cidr = subs[0].cidr
    const firstNet =  humanizeIp( FullSubnet( stringToHalfSubnet(subs[0].subnet)              ))
    const lastNet =   humanizeIp( FullSubnet( stringToHalfSubnet(subs[subs.length-1].subnet)  ))
    
    let subnet = {
        name: "Erstes Subnetz",
        questionAnswers: createRowsArray(firstNet, cidr)
    }
    questionsData.push(subnet)

    //only add 2-3rd subnet if it exists (if only 2 subnets exist -> only first and last exist)
    if (subs.length>2){
        const secondNet = humanizeIp( FullSubnet( stringToHalfSubnet(subs[1].subnet)              ))
        const thirdNet =  humanizeIp( FullSubnet( stringToHalfSubnet(subs[2].subnet)              ))
    
         subnet = {
             name: "Zweites Subnetz",
             questionAnswers: createRowsArray(secondNet, cidr)
        }
        questionsData.push(subnet)

        subnet = {
            name: "Drittes Subnetz",
            questionAnswers: createRowsArray(thirdNet, cidr)
        }
        questionsData.push(subnet)
    }

    // add Last subnet:
    subnet = {
        name: "Letztes Subnetz",
        questionAnswers: createRowsArray(lastNet, cidr)
    }
    questionsData.push(subnet)

    return questionsData

    // helpers:
    function FullSubnet (h:HalfIP): number[]{
        return [
            h[0]*16*16+h[1],
            h[2]*16*16+h[3],
            h[4]*16*16+h[5],
            h[6]*16*16+h[7], 
            0,0,0,0]
    }
    function createRowsArray(sunetAllSpellings: string[], cidr:number) {
        return [
            {
                question: "Netzwerk:",
                answer: sunetAllSpellings.map( val => val+"/"+cidr ) // "fe12:: => fe12::/66"
            },
        ]
    }
}


/** 
* HELPER Functions 
* */

// The maximum is inclusive and the minimum is inclusive
function getRandomIntIncl(min:number, max:number):number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); 
}

function getRandomIPv6():string{
    const randomBlock =()=> "XXXX:".replace(/X/g, ()=>{return "0123456789ABCDEF".charAt(getRandomIntIncl(0,15))})
    
    let rng = Math.random()
    if (rng<0.2) return "fe80:c08::"
    if (rng<0.4) return "fe80:"+randomBlock()+":"
    if (rng<0.6) return "2001" +randomBlock()+randomBlock()+":"
    if (rng<0.8) return "2001" +randomBlock()+randomBlock()+randomBlock()+randomBlock()+randomBlock()+randomBlock()+randomBlock()
    return "fe80::"
}

function randomizeCidrs(){
    let rng = Math.random()
    let difference  = undefined
    let newCidr     = undefined
    if      (rng <0.2) difference = 1
    else if (rng <0.4) difference = 2
    else if (rng <0.6) difference = 3
    else if (rng <0.8) difference = 4
    else difference = getRandomIntIncl(5,10)
    
    rng = Math.random()
    if      (rng <0.2) newCidr=64
    else if (rng <0.6) newCidr=16
    else if (rng <0.8) newCidr=32
    else if (rng <0.4) newCidr=30
    else newCidr = getRandomIntIncl(16,64)
    let  oldCidr = newCidr-difference

    // get random subnetCount for game: (by design of above ranges this must not overflow!)
    rng = Math.random()
    let subnetCount = Math.pow(2, newCidr-oldCidr)
    let rngSubnetCount = getRandomIntIncl(1+Math.pow(2, newCidr-oldCidr-1),subnetCount)
    if (rng<0.5) rngSubnetCount = subnetCount

    return {oldCidr: oldCidr, newCidr:newCidr, rngSubCount:rngSubnetCount}
}






/** from numbers[99251,0,300,0,0,0,0,0] make string like fe1:0:20:: 
 * returns array of all correct identifiers for that subnet if there is more than one
*/
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


















































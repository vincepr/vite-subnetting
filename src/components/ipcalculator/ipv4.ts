
/* 
*
*   CALCULATING DATA AND FORMATING IT:
*
*/


export type SubnetData = {
    subnet: string;
    cidr: number;
    firstHost: string;
    lastHost: string;
    broadcast: string;
    oldMask: string;
    newMask: string;
    hostsPerNet: number;
    subnetCount: number;
    nthSubnet?: number;
}


/* function get data and split it in half with "..."s */
export default function getSubnetData(ip:string, oldCidr:number, newCidr:number){
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
            oldMask: "...",
            newMask: "...",
            hostsPerNet: firstHalf[0].hostsPerNet,
            subnetCount: firstHalf[0].subnetCount,
        }
        ips = [...firstHalf ,dotDot,...secondHalf]
    }
    return ips
}


/* function to calculate our subnets, cutoff to only calculate 2*cutoff subnets on the start and end */
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
        let newMask = (-1 << (32 - newCidr)) >>> 0;
        return {
            subnet : subnetStringify(subnet) ,
            cidr:   newCidr,
            firstHost: subnetStringify(subnet+1) ,
            lastHost: subnetStringify(broadcast-1) ,
            broadcast: subnetStringify(broadcast) ,
            oldMask: subnetStringify(mask),
            newMask: subnetStringify(newMask),
            hostsPerNet: broadcast-subnet-1,
            subnetCount: subnetCount,
            nthSubnet: i+1,
        }
    }
}


/* original calc -> crashes and gets slow so we calculate only a part instead */
function deprec_CalculationSubnets(ip:string, oldCidr:number, newCidr:number) {
    let newSubnets = []
    let ipNum = (ip.split(".").map(str => parseInt(str))).reduce((acc, x) => (acc << 8) + x)
    let mask =    (-1 << (32 - oldCidr)) >>> 0;
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
import Ipv4 from "./ipv4"
import {OutputSubnetInfo, OutputIpInfo} from "./ipv4"

// create a new ip & Subnet combination and only pass on relevant info for the IpGame

// output
type gameData = {
    headerText: string[],
    subnets: SubnetData[],
}

export type SubnetData = {
    name: string
    questionAnswers: QuestionAndAnswers[] 
}

export type QuestionAndAnswers = {
    question: string
    answer: string
}

/** create new ramdon ipv4 & subnet data -> pass only relevant info along */
export function createDataV4Basic():gameData{
    let ip = new Ipv4
    let subnets:OutputSubnetInfo = ip.getRandomSubnet()
    // console.log(ip)
    // console.log(subnets)
    let headerText= getAssignmentHeaderText(ip.info.ip, ip.info.cidr, subnets.rngHostsPerSubnet, subnets.rngSubnetCount)
    let subnetsData =getQuestionsAndAnswers(ip.info)
    return {
        headerText: headerText,
        subnets: subnetsData
    }
}


/** create the text Assignment text with the necessary text for the following answers*/
function getAssignmentHeaderText(ip:string, cidr:number, rngHostsPerSubnet:number, rngSubnetCount:number){
    let rng = Math.random()
    let aufgabenText : string[] = []
    if (rng<0.5){
        // let rngHostsPerSubnet = subnet.rngHostsPerSubnet
        aufgabenText=[
            `Gegeben ist die Ip adresse: ${ip}/${cidr}. \u000A`,
            `Gesucht werden:`,
        ] 
    }
    else {
        aufgabenText=[
            `Gegeben ist die Ip adresse: ${ip} mit der CIDR Zahl von ${cidr}.`,
            `Gesucht werden:`,
        ] 
    }
    return aufgabenText
}

/** format questions and answers*/
function getQuestionsAndAnswers(info:OutputIpInfo){
    return[{
        name: "Erstens",
        questionAnswers: [
            {
                question: 'Broadcastadresse',
                answer: info.broadcast
            },
            {
                question: 'Subnetzmaske',
                answer: info.subnetmask
            },
            {
                question: 'ErsterHost',
                answer: info.firstHost
            },
            
        ]
    },
    {
        name: "Zweitens",
        questionAnswers: [
            {
                question: 'Letzter Host',
                answer: info.lastHost
            },
            {
                question: 'Host-Netzmaske',
                answer: info.hostnetmask
            },
            {
                question: 'Max. Hostanzahl',
                answer: info.maxPossibleHosts.toString()
            },
        ]
    }
    ]
}

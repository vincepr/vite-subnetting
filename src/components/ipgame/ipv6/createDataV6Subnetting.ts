import {V6OutputSubnetInfo, V6OutputIpInfo} from "./ipv6"
import Ipv6 from "./ipv6"

// create a new ip & Subnet combination and only pass on relevant info for the IpGame

// output
type gameData = {
    headerText: string[],
    subnets: V6SubnetData[],
}

export type V6SubnetData = {
    name: string
    questionAnswers: V6QuestionAndAnswers[] 
}

export type V6QuestionAndAnswers = {
    question: string
    answer: string[]
}

/** create new ramdon ipv4 & subnet data -> pass only relevant info along */
export function createDataV6Subnet():gameData{
    let ip = new Ipv6
    // console.log(ip)
    // console.log(ip.getRandomSubnet())
  
    let subnets:V6OutputSubnetInfo = ip.getRandomSubnet()
    let subnetsData =getQuestionsAndAnswers(subnets)
    return {
        headerText: getAssignmentHeaderText(ip.info.ip, ip.info.cidr, subnets.rngSubnetCount),
        subnets: subnetsData,
    }
}


/** create the text Assignment text with the necessary text for the following answers*/
function getAssignmentHeaderText(ip:string[], cidr:number, rngSubnetCount:number){

    return [
        `Gegeben ist die Ip adresse: ${ip[0]}/${cidr}.`,
        `Es werden ${rngSubnetCount} Subnetze benötigt.`,
        `Berechne:`,
    ] 

}


/** format questions and answers for 1th, 2nd, last subnet*/
function getQuestionsAndAnswers(subnets:V6OutputSubnetInfo) :V6SubnetData[] {    
    // array 1 entry per subnet:
    let questionsData:V6SubnetData[] = []
    // add first subnet:
    let subnet = {
        name: "Erstes Subnetz",
        questionAnswers: createRowsArray(subnets.firstSubnet)
    }
    questionsData.push(subnet)

    // only add second subnet if it exists (if only 2 subnets exist -> only first and last exist)
    // if (subnets.secondSubnet){
    //     subnet = {
    //         name: "Zweites Subnetz",
    //         questionAnswers: createRowsArray(subnets.secondSubnet)
    //     }
    //     questionsData.push(subnet)
    // }
    // add third subnet:
    subnet = {
        name: "Letztes Subnetz",
        questionAnswers: createRowsArray(subnets.lastSubnet)
    }
    questionsData.push(subnet)

    return questionsData


    function createRowsArray(subnet:V6OutputIpInfo) :V6QuestionAndAnswers[] {
        return [
            {
                question: "NetzID mit CIDR:",
                answer: subnet.netid.map( val => val+"/"+subnet.cidr ) // "fe12:: => fe12::/66"
            },
            {
                question: "Erster Host:",
                answer: subnet.firstHost
            },
            {
                question: "Letzter Host:",
                answer: subnet.lastHost

            },
        ]
    }
}
"use strict";

//Dependencies
const jsonHood = require("json-hood")
const request = require("request")
const chalk = require("chalk")

// Variables
const args = process.argv.slice(2)

// Main
if(!args.length) return console.log(chalk.yellowBright("usage: node index.js <http/tls> <domain>"))

args[0] = args[0].toLowerCase()

if(!args[1]) return console.log(`${chalk.blueBright("[") + chalk.redBright("ERROR") + chalk.blueBright("]")} Invalid url.`)

if(args[0] === "http"){
    console.log(`${chalk.blueBright("[") + chalk.yellowBright("INFO") + chalk.blueBright("]")} Scanning the website HTTP please wait(This might take a long time, depends).`)

    request.post(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${args[1]}&hidden=true&rescan=true`, function(err, res, body){
        if(err) return console.log(`${chalk.blueBright("[") + chalk.redBright("ERROR") + chalk.blueBright("]")} Something went wrong while scanning the website HTTP.`)

        body = JSON.parse(body)

        if(body.state !== "FINISHED"){
            function untilFinished(){
                setTimeout(function(){
                    request.post(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${args[1]}&hidden=true&rescan=true`, function(err, res, body){
                        if(err) return console.log(`${chalk.blueBright("[") + chalk.redBright("ERROR") + chalk.blueBright("]")} Something went wrong while scanning the website HTTP.`)

                        if(!body.match("FINISHED")) return untilFinished()
            
                        jsonHood.printJSONasArrowDiagram(body)
                    })
                }, 1000)
            }

            untilFinished()
        }else{
            jsonHood.printJSONasArrowDiagram(body)
        }
    })
}else if(args[0] === "tls"){
    console.log(`${chalk.blueBright("[") + chalk.yellowBright("INFO") + chalk.blueBright("]")} Scanning the website TLS please wait(This might take a long time, depends).`)
    
    request.post(`https://tls-observatory.services.mozilla.com/api/v1/scan?target=${args[1]}&hidden=true&rescan=true`, function(err, res, body){
        if(err) return console.log(`${chalk.blueBright("[") + chalk.redBright("ERROR") + chalk.blueBright("]")} Something went wrong while scanning the website TLS.`)

        body = JSON.parse(body)

        request(`https://tls-observatory.services.mozilla.com/api/v1/results?id=${body.scan_id}`, function(err, res, body){
            if(err) return console.log(`${chalk.blueBright("[") + chalk.redBright("ERROR") + chalk.blueBright("]")} Something went wrong while scanning the website TLS.`)

            if(body.match("last")) return console.log(`${chalk.blueBright("[") + chalk.yellowBright("INFO") + chalk.blueBright("]")} The API is has a limit in requesting, please try again in a few minutes.`)
            
            body = JSON.parse(body)

            jsonHood.printJSONasArrowDiagram(body)
        })
    })
}else{
    console.log(`${chalk.blueBright("[") + chalk.redBright("ERROR") + chalk.blueBright("]")} Invalid argument, make sure to use http/tls.`)
}

//Dependencies
const JSON_Hood = require("json-hood")
const Request = require("request")
const Chalk = require("chalk")

//Variables
const Self_Args = process.argv.slice(2)

//Main
if(Self_Args.length == 0){
    console.log(Chalk.magentaBright(`========================================
    ██   ██ ████████  ██████  ██████  
    ██   ██    ██    ██    ██ ██   ██ 
    ███████    ██    ██    ██ ██████  
    ██   ██    ██    ██    ██ ██   ██ 
    ██   ██    ██     ██████  ██████  
========================================`))
    console.log(Chalk.yellowBright(`node index.js <http/tls> <domain>
Example: node index.js http www.google.com

--- http/tls ---
http | Scan the website HTTP.
tls | Scan the website TLS.

--- domain ---
domain | The website domain.
    `))
    process.exit()
}

if(Self_Args[0] == ""){
    console.log(`${Chalk.blueBright("[") + Chalk.redBright("ERROR") + Chalk.blueBright("]")} Invalid argument, make sure to use http/tls.`)
    process.exit()
}

Self_Args[0] = Self_Args[0].toLowerCase()

if(Self_Args[1] == ""){
    console.log(`${Chalk.blueBright("[") + Chalk.redBright("ERROR") + Chalk.blueBright("]")} Invalid url.`)
    process.exit()
}

if(Self_Args[0] == "http"){
    console.log(`${Chalk.blueBright("[") + Chalk.yellowBright("INFO") + Chalk.blueBright("]")} Scanning the website HTTP please wait(This might take a long time, depends).`)

    Request.post(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${Self_Args[1]}&hidden=true&rescan=true`, function(err, res, body){
        if(err){
            console.log(`${Chalk.blueBright("[") + Chalk.redBright("ERROR") + Chalk.blueBright("]")} Something went wrong while scanning the website HTTP.`)
            process.exit()
        }

        body = JSON.parse(body)

        if(body.state != "FINISHED"){
            Until_Finished()
            function Until_Finished(){
                setTimeout(function(){
                    Request.post(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${Self_Args[1]}&hidden=true&rescan=true`, function(err, res, body){
                        if(err){
                            console.log(`${Chalk.blueBright("[") + Chalk.redBright("ERROR") + Chalk.blueBright("]")} Something went wrong while scanning the website HTTP.`)
                            process.exit()
                        }

                        if(body.indexOf("FINISHED") == -1){
                            Until_Finished()
                            return
                        }
            
                        JSON_Hood.printJSONasArrowDiagram(body)
                        process.exit()
                    })
                }, 1000)
            }
        }else{
            JSON_Hood.printJSONasArrowDiagram(body)
            process.exit()
        }
    })
}else if(Self_Args[0] == "tls"){
    console.log(`${Chalk.blueBright("[") + Chalk.yellowBright("INFO") + Chalk.blueBright("]")} Scanning the website TLS please wait(This might take a long time, depends).`)
    
    Request.post(`https://tls-observatory.services.mozilla.com/api/v1/scan?target=${Self_Args[1]}&hidden=true&rescan=true`, function(err, res, body){
        if(err){
            console.log(`${Chalk.blueBright("[") + Chalk.redBright("ERROR") + Chalk.blueBright("]")} Something went wrong while scanning the website TLS.`)
            process.exit()
        }

        body = JSON.parse(body)

        Request(`https://tls-observatory.services.mozilla.com/api/v1/results?id=${body.scan_id}`, function(err, res, body){
            if(err){
                console.log(`${Chalk.blueBright("[") + Chalk.redBright("ERROR") + Chalk.blueBright("]")} Something went wrong while scanning the website TLS.`)
                process.exit()
            }

            if(body.indexOf("last") != -1){
                console.log(`${Chalk.blueBright("[") + Chalk.yellowBright("INFO") + Chalk.blueBright("]")} The API is has a limit in requesting, please try again in a few minutes.`)
                process.exit()
            }
            
            body = JSON.parse(body)

            JSON_Hood.printJSONasArrowDiagram(body)
            process.exit()
        })
    })
}else{
    console.log(`${Chalk.blueBright("[") + Chalk.redBright("ERROR") + Chalk.blueBright("]")} Invalid argument, make sure to use http/tls.`)
    process.exit()
}

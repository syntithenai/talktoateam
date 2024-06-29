import {useState, useRef	} from 'react'
import nlp from 'compromise'
import agenticLlmApiClient from './agent/agenticLlmApiClient'

export default function useTeamLlm({files, fileManager, token, modelSelector, abortController, onReady, aiUsage, tools, config, engines, onUpdate, onComplete, onStart, onError, teams, roles, utils}) {
    //console.log("AI LLM INI ",url)
    const isBusy = useRef(false);
    function setIsBusy(v) {
		isBusy.current = v
	}
    const aiKey = useRef('')
    const eventSource = useRef()
    // var controller = useRef(new AbortController())
   	var client = agenticLlmApiClient({files, fileManager, token, modelSelector, onReady, aiUsage, onError, tools , onStart , abortController})

	function stop() {
		//console.log("ai stop")
		if (isBusy.current) {
			try {
				if (abortController.current) abortController.current.abort('click') //.catch(function(e) {console.log(e)})	
			} catch (e) {
				console.log(e)
			}
			setIsBusy(false)
		}
	}

	async function start(message, currentTeam, chatHistory) {
		// controller.current = new AbortController()
		// var signal = abortController.current.signal;
		//console.log("START TEAM", message, chatHistory, engine, currentTeam, roles, teams)
		if (currentTeam && teams[currentTeam]) {
			//console.log("START TEAM",teams[currentTeam])
			let useTeam = JSON.parse(JSON.stringify(utils.exportTeam(teams,currentTeam,roles)))
		
			//let members = []
			//if (Array.isArray(teams[currentTeam].members)) {
				////console.log("TEAM members",teams[currentTeam])
				//teams[currentTeam].members.forEach(function(memberId) {
					//if (roles[memberId]) {
						////console.log("TEAM member",roles[memberId])
						//// ensure id
						//members.push(Object.assign({}, roles[memberId], {id: memberId}))
					//}
				//})
				//useTeam.members = members
			//}
			//console.log("ssssssSTART TEAM",  useTeam)
			//onStart()
			setIsBusy(true)
			client.startTeam({message, messages: chatHistory, team: useTeam, onUpdate, onComplete: function(content, usage) {console.log("OC",content, usage); setIsBusy(false); onComplete(content, usage)} ,onStart })
		}
		
		
		
		//onUpdate()
		//onComplete('Team chat is not working yet ....', { 
								//tokens_in:  0,
								//tokens_out:0,
								//model: '',
								//key: ''
							//})
		//onError()
		
		
	}
	
    
    return {stop, start, isBusy, init: function() {if (onReady) onReady()}}
}




		
		//const enc = getEncoding("gpt2");

		//let ch = JSON.parse(JSON.stringify(chatHistory))
		//// TODO SETUP SYSTEM MESSAGE WITH EXAMPLES ....
		//ch.unshift({role:"system", content:(systemMessage ? systemMessage : '')})
		//setIsBusy(true)
		//let formData = {
			//model: model,
			//messages: ch
		//}
		//if (modelConfig) {
			//if (modelConfig.outputType === 'json')  formData.response_format = { "type": "json_object" }
			//if (modelConfig.temperatureOpenAI) formData.temperature = parseFloat(modelConfig.temperatureOpenAI) > 0 ? parseFloat(modelConfig.temperatureOpenAI) : 0
			//if (modelConfig.topPOpenAI) formData.top_p = parseFloat(modelConfig.topPOpenAI) > 0 ? parseFloat(modelConfig.topPOpenAI) : 0
			//if (modelConfig.maxTokens) formData.max_tokens = parseFloat(modelConfig.maxTokens) > 0 ? parseFloat(modelConfig.maxTokens) : 0
			//if (modelConfig.stopTokens && modelConfig.stopTokens.length > 0) formData.stop = modelConfig.stopTokens 
			//// OPENAI ONLY
			//if (modelConfig.frequencyPenalty) formData.frequency_penalty = parseFloat(modelConfig.frequencyPenalty) > -2 ? parseFloat(modelConfig.frequencyPenalty) : 0
			//if (modelConfig.presencePenalty) formData.presence_penalty = parseFloat(modelConfig.presencePenalty) > -2	 ? parseFloat(modelConfig.presencePenalty) : 0
		//}
		
		//formData.stream = true
		//if (url === 'https://api.openai.com') formData.stream_options = {include_usage: true}
		//console.log("ai start",model,"CH",chatHistory, "CO",modelConfig,"FD",formData)
		
		//let sent = []
		//let buffer = []
		//let lastSentenceCount = 0
		//let sentences = []
		//let tokensIn = 0
		//let tokensOut = 0
		//try {
			//let response = await fetch(url + '/v1/chat/completions', {
				//signal,
				//method: 'POST',
				//headers: {
					//'Authorization': 'Bearer '+key,
					//'Content-Type': 'application/json'
				//},
				//body: JSON.stringify(formData),
			//})
			//const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
			//while (true) {
				//const {value, done} = await reader.read();
				////console.log('Received', value);
				//if (done) break;
				//value.split("data: ").forEach(function(t) {
					////console.log("parse",t)
					//let j 
					//try {
							//j = JSON.parse(t)
							////console.log("parsed",j)
					//} catch (e) {
						////console.log(e)
					//}
					//if (j && j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.hasOwnProperty('content')) {
						//buffer.push(j.choices[0].delta.content)
						//let n = nlp(sent.join("") + buffer.join("")).clauses().out("array")
						//sentences = n
						////console.log(n,JSON.parse(JSON.stringify(sent)),JSON.parse(JSON.stringify(buffer)))
						//// finished a sentence ?
						//if (n.length > 1 && n.length > lastSentenceCount) {
							////console.log("push buffer",buffer.slice(0,-1).join(""),sent.join("")+buffer.slice(0,-1).join(""))
							//// send everything but last token in buffer, plus second param the whole transcript to date
							//let newText = n[n.length - 2]//buffer.slice(0,-1).join("")
							//let fullText = sent.join("") + newText
							//onUpdate(newText, fullText)
							//// push the buffer into sent and clear it
							//let sentCounter = ''
							//while (buffer.length > 0 && sentCounter.length < newText.length) {
								//let b = buffer.shift()
								//sentCounter += b
								//sent.push(b)
							//}
							//lastSentenceCount = n.length
						//}	
					//} else if (j && j.usage) {
						//tokensOut = j.usage.completion_tokens > 0 ? j.usage.completion_tokens : 0
						//tokensIn = j.usage.prompt_tokens > 0 ? j.usage.prompt_tokens : 0
					//}
					
					
				//})
				
			//}
			//setIsBusy(false)
			//aiUsage.log({tokens_in: tokensIn, tokens_out: tokensOut, model: model, key: key})
			//// send buffer dregs as update
			//onUpdate(buffer.join(""),sent.join("")+buffer.join(""))
			//// send complete message
			//onComplete(sent.join("")+buffer.join(""), { 
				//tokens_in: tokensIn, //countMessagesTokens(formData.messages),
				//tokens_out: tokensOut, //enc.encode(sent.join("")+buffer.join("")).length,
				//model: formData.model,
				//key: aiKey.current
			//})
			
			//setIsBusy(false)
		//} catch (error) {
			//console.error('Stopped:', error);
		//}

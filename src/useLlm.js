import agenticLlmApiClient from './agent/agenticLlmApiClient'
import {useState, useRef} from 'react'


export default function useLlm({files, fileManager, token, modelSelector, abortController, onUpdate, onComplete, onReady, onError,onStart, forceRefresh, aiUsage, currentChatHistory, tools, nlp}) {
    //console.log("AI LLM INI ",url)
    const isBusy = useRef(false);
    function setIsBusy(v) {
		isBusy.current = v
	}

	var client = agenticLlmApiClient({files, fileManager, token, modelSelector, onReady, aiUsage, onError, tools , onStart, abortController })

    const aiKey = useRef('')
    const eventSource = useRef()
    // var controller = useRef(new AbortController())
   	
	function init() { 
		if (onReady) onReady()
	}
	
	
	
	function stop() {
		client.stop()
		//console.log("ai stop")
		if (isBusy.current) {
			try {
				if (abortController.current) abortController.current.abort('click')
			} catch (e) {
				console.log(e)
			}
			setIsBusy(false)
		}
	}
	

	async function start(persona, chatHistory) {
		console.log("AI LLM START ",persona, chatHistory)
		//controller.current = new AbortController()
		//var signal = controller.current.signal;
		let messages = client.prependSystemMessage(persona, chatHistory)
		// console.log(chatHistory,messages, persona)
		setIsBusy(true)
		onStart()
		client.start({
				messages, 
				modelConfig: persona ? persona.config : {}, 
				onUpdate, 
				onComplete: function(content, log) {
					// console.log("AI LLM complete",content,log)
					setIsBusy(false); 
					onComplete(content, log)
				}
			}
		)
		
		//onStart()
		////const enc = getEncoding("gpt2");

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
			
			////setIsBusy(false)
		//} catch (error) {
			//console.error('Stopped:', error);
		//}
		
	}
	
	function startNoStream(systemMessage, chatHistory, model='gpt-3.5-turbo-0125', modelConfig = {}) {
		console.log("ai start",model,chatHistory, modelConfig)
		let ch = JSON.parse(JSON.stringify(chatHistory))
		ch.unshift({role:"system", content:(systemMessage ? systemMessage : '')})
		setIsBusy(true)
		forceRefresh()
		let formData = {
			model: model,
			messages: ch
		}
		if (modelConfig) {
			if (modelConfig.outputType === 'JSON')  formData.response_format = { "type": "json_object" }
			if (modelConfig.temperatureOpenAI) formData.temperature = parseFloat(modelConfig.temperatureOpenAI) > 0 ? parseFloat(modelConfig.temperatureOpenAI) : 0
			if (modelConfig.topPOpenAI) formData.top_p = parseFloat(modelConfig.topPOpenAI) > 0 ? parseFloat(modelConfig.topPOpenAI) : 0
			if (modelConfig.maxTokens) formData.max_tokens = parseFloat(modelConfig.maxTokens) > 0 ? parseFloat(modelConfig.maxTokens) : 0
			if (modelConfig.stopTokens && modelConfig.stopTokens.length > 0) formData.stop_tokens = modelConfig.stopTokens > 0 ? modelConfig.maxTokens : []
			// OPENAI ONLY
			if (modelConfig.frequencyPenalty) formData.frequency_penalty = parseFloat(modelConfig.frequencyPenalty) > 0 ? parseFloat(modelConfig.frequencyPenalty) : 0
			if (modelConfig.presencePenalty) formData.presence_penalty = parseFloat(modelConfig.presencePenalty) > 0 ? parseFloat(modelConfig.presencePenalty) : 0
		}
		
		try {
			fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer '+aiKey.current,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData),
			}).then(function(response) {
				//console.log("ai response",response)
				if (!response.ok) {
					try {
						response.json().then(function(data) {
							//console.log("ai response data err",data)
							if (data && data.error && data.error.message) {
								onError(data.error.message)
								setIsBusy(false)
								forceRefresh()
							}
						})
					} catch (e) {}
					//throw new Error('Failed to transcribe audio');
				}  else {

					response.json().then(function(data) {
						//console.log(data)
						
						if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content  && onComplete) {
							setIsBusy(false)
							onComplete(data.choices[0].message.content, { 
								tokens_in: data.usage && data.usage.prompt_tokens ? parseInt(data.usage.prompt_tokens) : 0,
								tokens_out: data.usage && data.usage.completion_tokens ? parseInt(data.usage.completion_tokens) : 0,
								model: data.model,
								key: aiKey.current
							})
						} else {
							setIsBusy(false)
							forceRefresh()
						}
					})
				}
			})
		} catch (error) {
			console.error('Transcription error:', error);
		}
		
	}
			
    
    return {init, stop, start, isBusy, fixCode: client.fixCode, fixGraph: client.fixGraph}
}

import {useState, useRef	} from 'react'
import nlp from 'compromise'

//import assert from "node:assert";
//import { getEncoding, encodingForModel } from "js-tiktoken";

//const enc = getEncoding("gpt2");
//assert(enc.decode(enc.encode("hello world")) === "hello world");

export default function useSelfHostedLlm({url, onUpdate, onComplete, onReady, onError,onStart, forceRefresh, currentChatHistory}) {
    //console.log("AI LLM INI ",url)
    const isBusy = useRef(false);
    function setIsBusy(v) {
		isBusy.current = v
	}
    const eventSource = useRef()
    var controller = useRef(new AbortController())
   	
	function init() { //openAIKey, modelConfigIn) {
		// TODO PING /health TO CHECK IF API IS ALIVE BEFORE TRIGGER ONREADY
		if (onReady) onReady()
	}
	
	function abortRequest() {
		try {
			if (controller.current) controller.current.abort('click') //.catch(function(e) {console.log(e)})	
		} catch (e) {
			console.log(e)
		}
	}
	
	function stop() {
		//console.log("ai stop")
		if (isBusy.current) {
			abortRequest()
			setIsBusy(false)
		}
	}
	
	

	async function start(systemMessage, chatHistory, modelConfig = {}) {
		controller.current = new AbortController()
		var signal = controller.current.signal;

		onStart()
		//const enc = getEncoding("gpt2");

		let ch = JSON.parse(JSON.stringify(currentChatHistory()))
		ch.unshift({role:"system", content:(systemMessage ? systemMessage : '')})
		setIsBusy(true)
		let formData = {
			//model: model,
			messages: ch,
			format: modelConfig && modelConfig.config &&  modelConfig.config.outputType ? modelConfig.config.outputType : '',
			format_config: modelConfig && modelConfig.config && (modelConfig.config.outputType === 'json') ?  modelConfig.config.schema : ((modelConfig && modelConfig.config && modelConfig.config.examples && modelConfig.config.examples.split && modelConfig.config.outputType === 'choice') ? modelConfig.config.examples.split("\n") : ''),
			examples: modelConfig && modelConfig.config &&  modelConfig.config.outputExamples ? modelConfig.config.outputExamples : '',
			config: {
				temperature: modelConfig && modelConfig.config &&  modelConfig.config.temperature ? modelConfig.config.temperature : '',
				top_p: modelConfig && modelConfig.config &&  modelConfig.config.topP ? modelConfig.config.topP : '',
				top_k: modelConfig && modelConfig.config &&  modelConfig.config.topK ? modelConfig.config.topK : '',
				max_tokens: modelConfig && modelConfig.config &&  modelConfig.config.maxTokens ? modelConfig.config.maxTokens : '',
				stop_at: modelConfig && modelConfig.config &&  Array.isArray(modelConfig.config.stopTokens) ? modelConfig.config.stopTokens : '',
				beams:  modelConfig && modelConfig.config &&  modelConfig.config.beams ? modelConfig.config.beams : '',
			},
			//modelConfig ? modelConfig.config : {},
			system_message: systemMessage,
		}
		console.log("ai start",chatHistory, modelConfig, formData)
		formData.stream = true
		
		let sent = []
		let buffer = []
		let lastSentenceCount = 0
		let sentences = []
		try {
			let response = await fetch(url + '/llm', {
				signal,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData),
			})
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
			while (true) {
				const {value, done} = await reader.read();
				//console.log('Received', value);
				if (done) break;
				value.split("data: ").forEach(function(t) {
					if (t) {
						buffer.push(t)
						let n = nlp(sent.join("") + buffer.join("")).clauses().out("array")
						sentences = n
						// finished a sentence ?
						if (n.length > 1 && n.length > lastSentenceCount) {
							//console.log("push buffer",buffer.slice(0,-1).join(""),sent.join("")+buffer.slice(0,-1).join(""))
							// send everything but last token in buffer, plus second param the whole transcript to date
							let newText = n[n.length - 2]//buffer.slice(0,-1).join("")
							let fullText = sent.join("") + newText
							onUpdate(newText, fullText)
							// push the buffer into sent and clear it
							let sentCounter = ''
							while (buffer.length > 0 && sentCounter.length < newText.length) {
								let b = buffer.shift()
								sentCounter += b
								sent.push(b)
							}
							lastSentenceCount = n.length
						}	
					}
				})
				
			}
			setIsBusy(false)
			// send buffer dregs as update
			onUpdate(buffer.join(""),sent.join("")+buffer.join(""))
			// send complete message
			onComplete(sent.join("")+buffer.join(""), { 
				model: formData.model,
			})
			
			//setIsBusy(false)
		} catch (error) {
			console.error('Stopped:', error);
		}
		
	}
	
	//function startNoStream(systemMessage, chatHistory, model='gpt-3.5-turbo-0125', modelConfig = {}) {
		//console.log("ai start",model,chatHistory, modelConfig)
		//let ch = JSON.parse(JSON.stringify(chatHistory))
		//ch.unshift({role:"system", content:(systemMessage ? systemMessage : '')})
		//setIsBusy(true)
		//forceRefresh()
		//let formData = {
			//model: model,
			//messages: ch
		//}
		//if (modelConfig) {
			//if (modelConfig.outputType === 'JSON')  formData.response_format = { "type": "json_object" }
			//if (modelConfig.temperatureOpenAI) formData.temperature = parseFloat(modelConfig.temperatureOpenAI) > 0 ? parseFloat(modelConfig.temperatureOpenAI) : 0
			//if (modelConfig.topPOpenAI) formData.top_p = parseFloat(modelConfig.topPOpenAI) > 0 ? parseFloat(modelConfig.topPOpenAI) : 0
			//if (modelConfig.maxTokens) formData.max_tokens = parseFloat(modelConfig.maxTokens) > 0 ? parseFloat(modelConfig.maxTokens) : 0
			//if (modelConfig.stopTokens && modelConfig.stopTokens.length > 0) formData.stop_tokens = modelConfig.stopTokens > 0 ? modelConfig.maxTokens : []
			//// OPENAI ONLY
			//if (modelConfig.frequencyPenalty) formData.frequency_penalty = parseFloat(modelConfig.frequencyPenalty) > 0 ? parseFloat(modelConfig.frequencyPenalty) : 0
			//if (modelConfig.presencePenalty) formData.presence_penalty = parseFloat(modelConfig.presencePenalty) > 0 ? parseFloat(modelConfig.presencePenalty) : 0
		//}
		
		//try {
			//fetch('https://api.openai.com/v1/chat/completions', {
				//method: 'POST',
				//headers: {
					//'Content-Type': 'application/json'
				//},
				//body: JSON.stringify(formData),
			//}).then(function(response) {
				////console.log("ai response",response)
				//if (!response.ok) {
					//try {
						//response.json().then(function(data) {
							////console.log("ai response data err",data)
							//if (data && data.error && data.error.message) {
								//onError(data.error.message)
								//setIsBusy(false)
								//forceRefresh()
							//}
						//})
					//} catch (e) {}
					////throw new Error('Failed to transcribe audio');
				//}  else {

					//response.json().then(function(data) {
						////console.log(data)
						
						//if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content  && onComplete) {
							//setIsBusy(false)
							//onComplete(data.choices[0].message.content, { 
								//model: data.model,
							//})
						//} else {
							//setIsBusy(false)
							//forceRefresh()
						//}
					//})
				//}
			//})
		//} catch (error) {
			//console.error('Transcription error:', error);
		//}
		
	//}
			
    
    return {init, stop, start, isBusy}
}


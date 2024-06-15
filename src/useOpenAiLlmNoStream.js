import {useState, useRef	} from 'react'

export default function useOpenAiLlm({forceRefresh, onUpdate, onComplete, onReady, onError}) {
    const isBusy = useRef(false);
    function setIsBusy(v) {
		isBusy.current = v
	}
    const aiKey = useRef('')
    
	function init(openAIKey, modelConfigIn) {
		console.log("ai init", openAIKey, modelConfigIn)
		aiKey.current = openAIKey
		if (onReady) onReady()
	}
	
	function stop() {
		//console.log("ai stop")
		setIsBusy(false)
		forceRefresh()
	}
	
	function start(systemMessage, chatHistory, model='gpt-3.5-turbo-0125', modelConfig = {}) {
		//console.log("ai start",model,chatHistory, modelConfig)
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
			
    
    return {init, stop, start, isBusy}
}


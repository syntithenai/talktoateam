import { FrameProcessor } from '@ricky0123/vad-web'
import nlp from 'compromise'
import {JSONPath} from 'jsonpath-plus';
import jsonic from 'jsonic'

//const config = require('./config')

//const nlp = window.nlp
function agenticLlmApiClient({ files, fileManager, token, modelSelector, aiUsage, tools , onError, onStart, abortController}) {
	// force local api
	// url = import.meta.env.VITE_API_URL
	// console.log("AGENTIC",token)
	tools = typeof tools === 'object' ? tools : {}
	// tools.get_current_weather = function(args) {return new Promise(function(resolve,reject) { console.log("GET CURRENT WEATHER",args); resolve("GET CURRENT WEATHER "+ args.location)})}
	let isStopped = true
	
	//console.log("TOOLS",tools)

	let isBusy = false
	function setIsBusy(v) { isBusy = v}
	// var controller = new AbortController()

	function fixBrackets(jsonString) {
		const openBraces = jsonString.match(/{/g) || [];
		const closeBraces = jsonString.match(/}/g) || [];
		const openBrackets = jsonString.match(/\[/g) || [];
		const closeBrackets = jsonString.match(/\]/g) || [];
		while (openBraces.length > closeBraces.length) jsonString += '}';
		while (closeBraces.length > openBraces.length) jsonString = '{' + jsonString;
		while (openBrackets.length > closeBrackets.length) jsonString += ']';
		while (closeBrackets.length > openBrackets.length) jsonString = '[' + jsonString;
		return jsonString;
	}
	
	function removeTrailingCommas(jsonString) {
		return jsonString.replace(/,(\s*[}\]])/g, '$1');
	}

	function addMissingCommas(jsonString) {
		return jsonString.replace(/}\s*{/g, '},{');
	}

	function parseLenientJSON(jsonString) {
		try {
		  return jsonic(jsonString);
		} catch (e) {
		  console.error("Failed to parse JSON:", e);
		  return null;
		}
	}
	function fixAndParseJSON(jsonString) {
		// Apply fixes
		jsonString = fixBrackets(jsonString);
		jsonString = addMissingCommas(jsonString);
		jsonString = removeTrailingCommas(jsonString);
		
		// Parse leniently
		return parseLenientJSON(jsonString);
	}

	function extractJSONChunks(text) {
		const jsonChunks = [];
		let inJson = false;
		let bracketCount = 0;
		let jsonString = '';
		
		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			if (char === '{') {
				if (!inJson) {
					inJson = true;
				}
				bracketCount++;
			}
			if (inJson) {
				jsonString += char;
			}
			if (char === '}') {
				bracketCount--;
				if (bracketCount === 0) {
					inJson = false;
					try {
						const jsonChunk = fixAndParseJSON(jsonString);
						jsonChunks.push(jsonChunk);
					} catch (e) {
						console.error("Invalid JSON found, skipping:", jsonString);
					}
					jsonString = '';
				}
			}
		}
		return jsonChunks;
	}
	tools.extractJSONChunks = extractJSONChunks

	function shouldMemberUseExitGate(member, response) {
		// console.log("EXIT???",member, response, member.config, member.config.exit_on)
		// if (isStopped) return true
		if (member && member.config && response && response.content) {
			// console.log("EXIT??? ha ccc", member.config.exit_on, member.config.exit_on === 'json')
			
			if (member.config.exit_on === "containstext" && member.config.exit_on_text) {
				// console.log("EXIT??? text")
				if (response.content.indexOf(member.config.exit_on_text) !== -1) {
					return true
				}
			} else if (member.config.exit_on === "notcontainstext" && member.config.exit_on_text) {
				// console.log("EXIT??? not text")
				if (response.content.indexOf(member.config.exit_on_text) === -1) {
					return true
				}
			} else if (member.config.exit_on === "json" || member.config.exit_on === "notjson")  {
				// console.log('JSONOK ?', response.content)
				let canParse = false
				// TODO JSONPATH FILTER
				if (member.config.exit_on_jsonpath) {
					const result = JSONPath({path: member.config.exit_on_jsonpath, json: response.content});
					console.log("PATHRES",result)
					if (Array.isArray(result) && result.length > 0) {
						found = true
						if (member.config.exit_on === "json") {
							return true
						} else if (!found && member.config.exit_on === "notjson") {
							return true
						}
					}
				}  else {
					try {
						let j = fixAndParseJSON(response.content)
						canParse = true
						// console.log('JSONOK parsed')
					} catch (e) {}
					if (canParse && member.config.exit_on === "json") {
						// console.log('exit on found json')
						return true
					} else if (!canParse && member.config.exit_on === "notjson") {
						// console.log('exit on not found json')
						return true
					} else {
						// console.log('NOM',canParse, member.config.exit_on)
					}
				}

			} else if (member && member.config && (member.config.exit_on === "containsjson" || member.config.exit_on === "notcontainsjson" ))  {
				console.log('JSONOK contains ?')
				let canParse = false
				let chunks = extractJSONChunks(response.content) 
				let found = false
				for (let c in chunks) {
					if (member.config.exit_on_jsonpath) {
						const result = JSONPath({path: member.config.exit_on_jsonpath, json: chunks[c]});
						console.log("PATHRES",result)
						if (Array.isArray(result) && result.length > 0) {
							found = true
							if (member.config.exit_on === "containsjson") {
								console.log("JSONcontains match ")
								return true
							}
						}
					}  else {
						try {
							let j = fixAndParseJSON(c)
							canParse = true
							found = true
						} catch (e) {}
						if (canParse && member.config.exit_on === "containsjson") {
							console.log("JSONcontains match ")
							return true
						} 
					}
				}
				console.log(found,member.config)
				if (!found && member.config.exit_on === "notcontainsjson") {
					console.log("JSON not contains match ")
					return true
				}
			} 
		}
		return false
	}
	
	function stop() {
		isStopped = true
		if (isBusy) {
			try {
				if (abortController.current) abortController.current.abort('click') 
			} catch (e) {
				console.log(e)
			}
			setIsBusy(false)
		}
	}
	
	
	let toolCallPromises = []
	let toolCalls = {}
	
	function parseCSVLine(csvLine) {
		const regex = /("([^"]|"")*"|'([^']|'')*'|[^,]+)(?=\s*,|\s*$)/g;
		let matches = [];
		let match;
		while (match = regex.exec(csvLine)) {
			matches.push(match[0].replace(/^["']|["']$/g, '').replace(/""/g, '"').replace(/''/g, "'"));
		}
		return matches;
	}
	
	function startToolCall(toolCall) {
		console.log('startToolCall',toolCall)
		let results = null
		if (toolCall &&  toolCall.name && tools.hasOwnProperty(toolCall.name)) {
			try {
				let args = []
				if (toolCall.arguments) {
					let argsJSON = fixAndParseJSON(toolCall.arguments)
					args = Object.values(argsJSON)
				}
				console.log('startToolCall real',toolCall.name, args)
				let callResult = tools[toolCall.name](...args)
				if (callResult.then) {
					toolCallPromises.push(callResult)
				} else {
					toolCallPromises.push(new Promise(function(resolve,reject) {resolve(callResult)}))
				}
			} catch (e) {
				onError(e)
			}
		}
		return results
	}
	
	function renderToolCalls(fullText, toolCallResults) {
		console.log("rednerToolCalls", toolCallResults)
		return fullText + toolCallResults.join("\n")
	}

	function getSystemMessage(persona) {
		// console.log("GET SYSTEM MESSAGE", persona)
		let systemMessage = persona && persona.message ? persona.message : ''
		systemMessage = systemMessage + (persona && persona.skills ? "\n" + persona.skills : '')
		systemMessage = systemMessage + (persona && persona.backStory ? "\n" + persona.backStory : '')
		if (persona && persona.config && persona.config.outputType === 'json') { 	
			systemMessage = systemMessage + (persona.config && persona.config.outputExamples ? "\n" + persona.config.outputExamples : '')
			systemMessage = systemMessage + (persona.config && persona.config.outputSchema ? "\n" + persona.config.outputSchema : '')
		} else if (persona && persona.config && persona.config.outputType === 'choice') { 	
			systemMessage = systemMessage + (persona.config && persona.config.outputExamples ? "\n###CHOICES\n" + persona.config.outputExamples : '')
		}
		return {role:"system", content: systemMessage}
	}

	function getSystemMessageContent(persona) {
		let message = getSystemMessage(persona)
		return message && message.content ? message.content : ''
	}

	function mergeChatHistory(systemMessage, userMessage) {
		let newHistory = messages.filter(function(m) {
			if (m.role === 'user' || m.role === 'assistant') {
				return true
			}
			return false
		}).map(function(m) {
			return {role: m.role, content: Array.isArray(m.content) ? m.content.map(function(m) {return m.content}).join("\n") : m.content} 
		})
		if (systemMessage) newHistory.unshift(systemMessage)
		if (userMessage) {
			let a = newHistory.pop()
			if (a.role ==='user') {
				newHistory.push(userMessage)
			} else {
				let b = newHistory.pop()
				if (b.role === 'user') {
					newHistory.push(userMessage)
					newHistory.push(a)
				} else {
					newHistory.push(b)
					newHistory.push(a)
				}
			}
		}
		return newHistory
	}
	
	function combinedMessages(chatHistory, addMessages = null, newSystemMessage=null) {
		// console.log('COMBINED MESSAGES', chatHistory, addMessages, addToSystemMessage)
		let systemMessage = null
		let firstElement = null
		// console.log("TO COMBINE",JSON.parse(JSON.stringify(chatHistory)), addMessages, addToSystemMessage)
		// clear messages from the beginning until we find the first user message, save the systemMessage
		while ((!firstElement || firstElement.role !== 'user') && chatHistory.length > 0) {
			firstElement = chatHistory.shift()
			if (firstElement && firstElement.role === 'system') {
				systemMessage = firstElement 
			} else if (firstElement && firstElement.role === 'assistant') {
				// discard assistant message
			} else if (firstElement && firstElement.role === 'user') {
				// keep user message
				chatHistory.unshift(firstElement)
			} 
		}
		if (newSystemMessage) {
			chatHistory.unshift({role:'system', 'content': newSystemMessage})
		} else if (systemMessage)  {
			chatHistory.unshift(systemMessage)
		}

		if (Array.isArray(addMessages)) chatHistory.concat(addMessages)
		chatHistory = chatHistory.map(function(m) {
			return {role: m && m.role ? m.role : {}, content: m && Array.isArray(m.content) ? m.content.map(function(m) {return m && m.content ? m.content : ''}).join("\n") : m && m.content ? m.content : '', log: m && m.log ? m.log : null} 
		})
		// console.log("CLENED",chatHistory)
		return chatHistory
	}

	function prependSystemMessage(persona, chatHistory) {
		let systemMessage = getSystemMessage(persona)
		let newHistory = JSON.parse(JSON.stringify(chatHistory))
		newHistory.unshift(systemMessage)	
		return newHistory
	}
	
	function cleanHistoryAndAddSystemMessage (chatHistory, addToSystemMessage) {
		let systemMessage = null
		let firstElement = null
		// console.log("TO CLENED",JSON.parse(JSON.stringify(chatHistory)))
		// clear messages from the beginning until we find the first user message, save the systemMessage
		while ((!firstElement || firstElement.role !== 'user') && chatHistory.length > 0) {
			firstElement = chatHistory.shift()
			if (firstElement && firstElement.role === 'system') {
				systemMessage = firstElement 
			} else if (firstElement && firstElement.role === 'assistant') {
				// discard assistant message
			} else if (firstElement && firstElement.role === 'user') {
				// keep user message
				chatHistory.unshift(firstElement)
			} 
		}
		if (systemMessage)  {
			systemMessage.content = systemMessage.content ? systemMessage.content + addToSystemMessage : addToSystemMessage
			chatHistory.unshift(systemMessage)
		} else {
			chatHistory.unshift({role:'system', 'content': addToSystemMessage})
		}
		chatHistory = chatHistory.map(function(h) {
			return {'role':h.role, 'content': h.content}
		})
		// console.log("CLENED",chatHistory)
		return chatHistory
	}
	
	function getLastUserMessage(c) {
		//console.log('get last message index',c)
		if (c) {
			let r = JSON.parse(JSON.stringify(c)).reverse()
			for (let entry in r) {
				//console.log(entry,r[entry])
				if (entry && r[entry] && r[entry].role === 'user') {
					//console.log('get last message index FOUND',r.length - entry - 1)
					return r[entry]
				}
			}
		}
		//console.log('get last message index NOT FOUND')
		return null
	}
	
	function propertiesFromArguments(args) {
		let properties = {}
		if (Array.isArray(args)) args.forEach(function(argument) {
			properties[argument.name] = {type: argument.type, description: argument.description}
		})
		return properties
	}

	function openAIParametersFromConfig(modelConfig, url) {
		let formData = {}
		if (modelConfig) {
			if (modelConfig.outputType === 'json')  formData.response_format = { "type": "json_object" }
			if (modelConfig.temperatureOpenAI) formData.temperature = parseFloat(modelConfig.temperatureOpenAI) > 0 ? parseFloat(modelConfig.temperatureOpenAI) : 0
			if (modelConfig.topPOpenAI) formData.top_p = parseFloat(modelConfig.topPOpenAI) > 0 ? parseFloat(modelConfig.topPOpenAI) : null
			if (modelConfig.maxTokens) formData.max_tokens = parseFloat(modelConfig.maxTokens) > 0 ? parseFloat(modelConfig.maxTokens) : null
			if (Array.isArray(modelConfig.stopTokens) && modelConfig.stopTokens.length > 0) formData.stop = modelConfig.stopTokens 
			if (Array.isArray(modelConfig.tools)) formData.tools = modelConfig.tools.map(function(t) {
				return {type:'function', 'function': {
					name:t.name, 
					description: t.description, 
					parameters: {
						type:'object',
						properties:propertiesFromArguments(t.arguments),
						required: Array.isArray(t.required) ? t.required : []
					}
				}}
			})
			// OPENAI ONLY
			if (modelConfig.frequencyPenalty) formData.frequency_penalty = parseFloat(modelConfig.frequencyPenalty) > -2 ? parseFloat(modelConfig.frequencyPenalty) : 0
			if (modelConfig.presencePenalty) formData.presence_penalty = parseFloat(modelConfig.presencePenalty) > -2	 ? parseFloat(modelConfig.presencePenalty) : 0
			
		}
		if (!modelConfig || (modelConfig && modelConfig.outputType !== 'json')) formData.stream = true
		if ((modelConfig && modelConfig.outputType !== 'json' && url === 'https://api.openai.com')) formData.stream_options = {include_usage: true}
		if (url.startsWith(import.meta.env.VITE_API_URL) && modelConfig && modelConfig.config && Array.isArray(modelConfig.config.stopTokens)) {
			formData.stop_tokens = modelConfig.config.stopTokens
		}
		if (url.startsWith(import.meta.env.VITE_API_URL) && modelConfig && modelConfig.config && Array.isArray(modelConfig.config.maxSentences)) {
			formData.max_sentences = modelConfig.config.maxSentences
		}

		return formData
	}
	
	async function start({messages, modelConfig, onUpdate, onComplete,onStart}) {

		// function appendToMessages(newMessages) {
		// 	let m = Array.isArray(messages) ? JSON.parse(JSON.stringify(messages)) : []
		// 	if (Array.isArray(newMessages)) {
		// 		m.concat(newMessages)
		// 	}
		// 	return m
		// }
		// console.log("AGENTIC START",modelConfig, fileManager)	
		let finalFiles = {}
		let finalWholeFiles = {}
		let filesIndex = {}
		if (Array.isArray(files)) files.forEach(function(f) {
			if (f && f.id)  filesIndex[f.id] = f
		})
		if (modelConfig && Array.isArray(modelConfig.files)) {
			modelConfig.files.forEach(function(id) {
				if (filesIndex[id]) {
					if (f.embed_whole_file === 'yes') {
						finalWholeFiles[id] = filesIndex[id]
					} else {
						finalFiles[id] = filesIndex[id]
					}
				}
			})
		}
		// console.log("AGENTIC START files", files, finalFiles, filesIndex)	
		let startTime = new Date()
		if (modelConfig && modelConfig.type ==="algorithmic" ) {
			isStopped = false
			console.log(modelConfig,modelConfig && modelConfig.processingFunctionType, modelConfig && modelConfig.processingFunction )
			let functionResult = null
			if (modelConfig && modelConfig.processingFunction) {
				if (true || modelConfig.processingFunctionType === 'evaljavascript') {
					//const AsyncFunction = async function () {}.constructor;
					let processorFunction = new Function('message','messages','files', modelConfig.processingFunction);
					let lastUserMessage = getLastUserMessage(messages)
					let message = lastUserMessage ? lastUserMessage.content : ''
					// console.log("Function CALL:", message, messages, lastUserMessage);
					try {
						let functionResult =   processorFunction(message, messages, finalFiles);
						// console.log("Function res:", functionResult);
						if (functionResult && functionResult.then && typeof functionResult.then == 'function') {
							return functionResult.then(function(pRes) {
								// console.log("Function Resultq1:", pRes);
								let ret = {content: pRes, log: {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()}}
								onComplete(pRes, {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()})
								return ret
							}).catch(function(e) {
								onError(e)
							})
						} else {
							// console.log("Function Resultss:", functionResult);
							let ret = {content: functionResult, log: {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()}}
							onComplete(functionResult, {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()})
							return ret
						}
					} catch (error) {
						// console.error("Error evaluating function:", error);
						onError(error)
						return
					}
				} else {
					let ret = {content: '', log: {tokens_in: 0, tokens_out: 0, duration: 0}}
					onComplete('', {tokens_in: 0, tokens_out: 0, duration: 0})
					return ret			
				} 
			} else {
				let ret = {content: '', log: {tokens_in: 0, tokens_out: 0, duration: 0}}
				onComplete('', {tokens_in: 0, tokens_out: 0, duration: 0})
				return ret			
			}
				
		} else { 
			let modelType = modelConfig && modelConfig.preferredModel ? modelConfig.preferredModel : 'large'
			console.log("MT",modelType, modelConfig, messages)
			//let modelObj = modelSelector.getModel(modelType)
			let modelObj = modelSelector.getModel(modelType)
			let model = modelSelector.getModelKey(modelType)
			if (!modelObj) throw new Error('Unable to find a matching model for '+ modelType)
			let url = modelSelector.getModelUrl(modelObj.provider)
			if (!url) throw new Error('Unable to find a model url')
			// key could be provider key for direct cors supported calls
			// OR google access_token for this service
			let key = modelSelector.getModelApiKey(modelObj.provider)
			// console.log("Persona Start:",url, key, messages,modelConfig, modelObj);
			if (!key) key = token && token.access_token ? token.access_token : ''
			isStopped = false
			var signal = abortController.current.signal;
			if (onStart) onStart()
			setIsBusy(true)
			// hack final messages to inject RAG results from files
			let ragData = []
			let text = Array.isArray(messages) && messages.length > 0 && messages[messages.length -1].content ? messages[messages.length -1].content : ''
			// console.log("RAG SESARCH",text)
			// inject rag matches ?
			if (text && Array.isArray(finalFiles)) {
				let vectorResults = await fileManager.searchVectorFiles(text, finalFiles)
				// console.log("VECRESSSSS", vectorResults)
				if (Array.isArray(vectorResults)) {
					// console.log("VECRESSSSS os array", vectorResults, vectorResults.length, vectorResults[0])
					vectorResults.forEach(function(file) {
						// console.log("FOB",file, file.matches)
						if (file && Array.isArray(file.matches)) {
							// console.log("FOB2",file, file.matches)
							file.matches.forEach(function(match) {
								ragData.push((match && match.file ? match.file : '') + ' ' +  (match && match.fragment ? match.fragment : ''))
							})
						}
					})
				}
			}
			// whole files ?
			if (Array.isArray(finalWholeFiles)) {
				ragData.push(finalWholeFiles.map(function(f) {return f.data}).join("\n\n"))
			}
			// console.log("VECRESSSSS", ragData)
			let formData = {
				model: model,
				messages: cleanHistoryAndAddSystemMessage(messages, ragData.length > 0 ? "\n\n" + ragData.join("\n") : '')
			}
			formData = Object.assign(formData,openAIParametersFromConfig(modelConfig, url))
			let sent = []
			let buffer = []
			let lastSentenceCount = 0
			let sentences = []
			let tokensIn = 0
			let tokensOut = 0
			let startTime = new Date()
			let toolCalls = []
			let currentToolCall = {name:'',arguments:''}
			try {
				console.log("START REQUEST",key, formData)
				let response = await fetch(url + '/chat/completions', {
					signal,
					method: 'POST',
					headers: {
						'Authorization': 'Bearer '+key,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData),
				})
				// console.log("response",response)
				if (response.status !== 200) {
					stop()
					onError(new Error("Error querying model - " + formData.model +'. '+ response.statusText))
				}
				// streaming response via onStart, onUpdate, onComplete and resolve promise with complete final result
				const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
				while (true && !isStopped) {
					const {value, done} = await reader.read();
					if (done) break;
					value.split("data: ").forEach(function(t) {
						if (t && t.length > 0) {
							// console.log("response d",t)
							let j 
							try {
									j = JSON.parse(t)
							} catch (e) {}
							// console.log("response json",j)
							if (j && j.error) {
								stop()
								onError(new Error(j.error))
							}
							// console.log("response json2")
							// collate and tokenise into sentences for TTS delivery
							// TODO collate json arguments if talking directly to openai
							if (j && j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.hasOwnProperty('tool_calls') && Array.isArray(j.choices[0].delta.tool_calls)) {
								// console.log("TOOL CALs found",j.choices[0].delta.tool_calls)
								for (let toolKey in j.choices[0].delta.tool_calls) {
									// console.log("TOOL CALs key ",toolKey)
									let tool_call = j.choices[0].delta.tool_calls[toolKey] ? j.choices[0].delta.tool_calls[toolKey].function : null
									// console.log("TOOL CAL FOUND", tool_call)
									
									if (tool_call && tool_call.name && tool_call.name.trim().length > 0) {
										// console.log("TOOL CAL name FOUND", tool_call.name)
										if (currentToolCall.name.trim().length > 0) {
											// console.log("TOOL CAL add row")
											toolCalls.push(currentToolCall)
										}
										currentToolCall = {name:tool_call.name,arguments:tool_call.arguments ? tool_call.arguments : ''}
									} else if (tool_call && tool_call.arguments) {
										// console.log("TOOL CAL args FOUND", tool_call.arguments)
										currentToolCall.arguments += tool_call.arguments
									}
									
									// if (tool_call && tool_call.name) {
									// 	startToolCall(tool_call)
									// }
								}
							}
							// console.log("response choice tool calls started")
							if (j && j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.hasOwnProperty('content')) {
								buffer.push(j.choices[0].delta.content)
								let n = nlp(sent.join("") + buffer.join("")).clauses().out("array")
								sentences = n
								// finished a sentence ?
								if (n.length > 1 && n.length > lastSentenceCount) {
									// send everything but last token in buffer, plus second param the whole transcript to date
									let newText = n[n.length - 2]
									let fullText = sent.join("") + newText
									

									onUpdate(fullText, newText, (new Date() - startTime).valueOf())
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
							// console.log("response 1")
							if (j && j.usage) {
								tokensOut = j.usage.completion_tokens > 0 ? j.usage.completion_tokens : 0
								tokensIn = j.usage.prompt_tokens > 0 ? j.usage.prompt_tokens : 0
							}
							if (j && j.x_groq && j.x_groq.usage) {
								tokensOut = j.x_groq.usage.completion_tokens > 0 ? j.x_groq.usage.completion_tokens : 0
								tokensIn = j.x_groq.usage.prompt_tokens > 0 ? j.x_groq.usage.prompt_tokens : 0
							}
							// console.log("tokens", tokensIn, tokensOut)
						}
					})
					
				}
				toolCalls.push(currentToolCall)
				// console.log('FIN TC',toolCalls)
				toolCalls.forEach(function(toolCall) {
					// console.log('FIN TC ST')
					return startToolCall(toolCall)
				})
				// console.log('FIN TC p',toolCallPromises)
				// read last token
				try {
					const {lastvalue, lastdone} = await reader.read();
					// console.log("LASTVALUE",lastvalue, lastdone)
				} catch (e) {
					// console.log('LASTVALUE ERROR',e)
				}

				setIsBusy(false)
				let logEntry = {tokens_in: tokensIn, tokens_out: tokensOut, model, key, url, duration : ((new Date() - startTime).valueOf())}
				if (aiUsage) aiUsage.log(logEntry)
				// send buffer dregs as update
				if (onUpdate) onUpdate(sent.join("")+buffer.join(""), buffer.join(""), (new Date() - startTime).valueOf())
				// send complete message
				let fullText = sent.join("")+buffer.join("")
				if (modelConfig && modelConfig.wrapBefore) fullText = modelConfig.wrapBefore + fullText
				if (modelConfig && modelConfig.wrapAfter) fullText = fullText + modelConfig.wrapAfter
				if (!isStopped) {
					//startToolCalls(fullText) 
					return Promise.all(toolCallPromises).then(function(toolCallResults) { 
						// console.log("response tool fall scomplete",toolCallResults)
						let final = renderToolCalls(fullText, toolCallResults)
						onComplete(final, logEntry)
						return {content: final, log: logEntry}
					}).catch (function(error) {
						let logEntry = {tokens_in: tokensIn, tokens_out: tokensOut, model, key, url, duration : (new Date() - startTime).valueOf()}
						console.error('Stopped:', error);
						console.log(JSON.stringify(error))
						stop()
						// onError(error)
						onComplete( sent.join("")+buffer.join(""),  logEntry)
						return {content: sent.join("")+buffer.join(""), log: logEntry}   //log_usage(user,'llm', get_price(model_key, tokens_in, tokens_out))
					})
				} else {
					let logEntry = {tokens_in: tokensIn, tokens_out: tokensOut, model, key, url, duration : (new Date() - startTime).valueOf()}
					onComplete( sent.join("")+buffer.join(""), logEntry)
					return {content: sent.join("")+buffer.join(""), log: logEntry}
				}
			} catch (error) {
				let logEntry = {tokens_in: tokensIn, tokens_out: tokensOut, model, key, url, duration : (new Date() - startTime).valueOf()}
				console.error('LLM RUN ERROR:', error);
				onError(error)
				stop()
				onComplete(sent.join("")+buffer.join(""), logEntry)
				return {content: sent.join("")+buffer.join(""), log: logEntry}
				//return sent.join("")+buffer.join("")
			}
		}
	}
	
	
	function chooseExperts(message, experts) {
		// console.log("CHOOSE EXP",message, experts)
		return new Promise(function(resolve, reject) {
			let systemMessage=`You are a human resources expert. 
You understand very well how to find the right person for the job. 
When you are asked a question you decide who is the best person to answer the question.
Choose one or many persons from the following list of experts who would best answer the question. Choose at most three and at least one.
Each row of the list of experts starts with an ID. An example ID is 1715533081877-2tpar0hlv9j .  Respond with a comma seperated list of ids.

###QUESTION
` + message + `

###EXPERTS
` + experts.map(function(expert) { return expert.id + ' ' + expert.name + ' ' + expert.skills }).join("\n") + `
You must ONLY respond with a comma seperated list of ids from the experts provided.`

			start({messages:[{role:'system', content: systemMessage}, {role:'user', content: message}], modelConfig: {}, onUpdate: function() {}, onComplete: function(finalContent, usage) {
				let rolesIndex = []
				experts.forEach(function(expert) {
					if (expert.id) rolesIndex[expert.id] = expert
				})
				let finalRoles = []
				
				finalContent.split(",").forEach(function(id) {
					if (id.trim() && rolesIndex[id.trim()]) finalRoles.push(rolesIndex[id.trim()])
				})
				//console.log("CHOSE EXP",finalRoles)
				resolve({experts: finalRoles, log: usage})
			}})
		})
	}
	
	function generateQuestions(message) {
		//max_generated_items
		//console.log("CHOOSE gen q",message)
		return new Promise(function(resolve, reject) {
			let systemMessage=`You are a curious person and when you hear a question, a bunch of other related questions come to mind that would help you understand the question.
			Reply with a list of additional questions.

###QUESTION
` + message 
			start({messages:[{role:'system', content: systemMessage}, {role:'user', content: message}], modelConfig: {}, onUpdate: function() {}, onComplete: function(finalContent, usage) {
				let finalQuestions = []
				
				finalContent.split("\n").forEach(function(question) {
					if (question.trim()) finalQuestions.push(question.trim())
				})
				//console.log("CHOSE EXP",finalRoles)
				// knock off the first line of commentary
				resolve({questions: finalQuestions.slice(1), log: usage})
			}})
		})
	}
	
	async function startTeam({message,messages, team, onUpdate, onComplete,onStart }) {
		
		// function appendToMessages(newMessages) {
		// 	let m = Array.isArray(messages) ? JSON.parse(JSON.stringify(messages)) : []
		// 	if (Array.isArray(newMessages)) {
		// 		m.concat(newMessages)
		// 	}
		// 	return m
		// }
		
		console.log("START TEAM", messages, team)
		isStopped = false
		let startTime = new Date()
		let generated = []
		let tally = {tokens_in: 0, tokens_out: 0}
		
		function mergeChatHistory(systemMessage, userMessage) {
			let newHistory = messages.filter(function(m) {
				if (m.role === 'user' || m.role === 'assistant') {
					return true
				}
				return false
			}).map(function(m) {
				return {role: m.role, content: Array.isArray(m.content) ? m.content.map(function(m) {return m.content}).join("\n") : m.content} 
			})
			if (systemMessage) newHistory.unshift(systemMessage)
			if (userMessage) {
				let a = newHistory.pop()
				if (a.role ==='user') {
					newHistory.push(userMessage)
				} else {
					let b = newHistory.pop()
					if (b.role === 'user') {
						newHistory.push(userMessage)
						newHistory.push(a)
					} else {
						newHistory.push(b)
						newHistory.push(a)
					}
				}
			}
			return newHistory
		}
		
		function updateTallies(tokens_in,tokens_out) {
			tally.tokens_in = (tally.tokens_in > 0 ? tally.tokens_in : 0) + (tokens_in > 0 ? tokens_in : 0)
			tally.tokens_out = (tally.tokens_out > 0 ? tally.tokens_out : 0) + (tokens_out > 0 ? tokens_out : 0)
		}
		
		function sendUpdate() {
			onUpdate(generated, (new Date() - startTime).valueOf())
		}
		
		function sendComplete() {
			onComplete( generated, { 
				tokens_in: tally.tokens_in,
				tokens_out: tally.tokens_out,
				//model,
				// key,
				// url,
				duration: (new Date() - startTime).valueOf()
			})
		}
		
		function onTeamUpdate(k, content, partial) {
			//console.log("onTeamUpdate",k, content  && content.slice(0,10))
			// handle team
			if (Array.isArray(content)) {
				for (let i = 0; i < content.length; i++) {
					generated[k + i] = {content: content}
				}
			// handle personal
			} else {
				generated[k] = {content: content}
			}
			sendUpdate()
		}
		
		function onTeamComplete(k, content, usage, name) {
			//console.log("onTeamComplete",k, content, usage, name)
			// handle team
			if (Array.isArray(content)) {
				//console.log("onTeamComplete arr",k, content, usage, name)
				for (let i = 0; i < content.length; i++) {
					generated[k + i] = {content: content[i].content, log:content[i].log, name: (name + (content[i].name ? (" - " + content[i].name) : ""))}
				}
				if (usage) updateTallies(usage.tokens_in, usage.tokens_out)
				sendUpdate()
				//console.log("onTeamComplete array ",generated)
			// handle personal
			} else  {
				generated[k] = {content, log:usage, name: name}
				if (usage) updateTallies(usage.tokens_in, usage.tokens_out)
				sendUpdate()
				//console.log("onTeamComplete text ", content && content.slice ? content.slice(0,10) : content)
			}
			
		}
		
		function handleAssistantResponse(response) {
			if (response) {
				let content = response && Array.isArray(response.content) ? response.content.map(function(r) {return r.content}).join("\n") : (response.content ? response.content : '')
				let log = response && response.log ? response.log : ''
				if (log) updateTallies(log.tokens_in, log.tokens_out)
				return content
			} else {
				return ''
			}
		}
				
		async function startCompressedTeam(team,template, offset) {
			//console.log("START COMPRESSED", team,template, offset)
			if (Array.isArray(team.members) && team.members.length > 0) {
				for (let m in team.members) {
					let member = team.members[m]
					if (m && m.id && m.id.startsWith("TEAM:::::")) {
						onError(new Error("A compressed team cannot have nested teams (" + m.name + ')'))
					} else {
						template.push('\n###PERSONA')
						let msg = [member.message]
						if (member.skills) template.push(member.skills)
						if (member.backStory) template.push(member.backStory)
						template.push(msg.join('. ')) 
					}
				}
			}
			let k = offset > 0 ? offset : 0
			function iOnUpdate(content, partial) {
				onTeamUpdate(k,content,partial)
			}
			function iOnComplete(content, usage) {
				onTeamComplete(k,content,usage,'Compressed Team'+((team && team.name) ? ' - ' + team.name : ''))
			}
			let cContentc = await start({messages: combinedMessages(messages,[{role:'user', content:'###QUESTION\n' +message}], template.join('\n')), modelConfig: {}, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
			//console.log("START COMPRESSED RESULT", cContentc)
			let cContent = handleAssistantResponse(cContentc) 
			if (getExpert(team,'formatter')) {
				k = k + 1
				function iOnComplete(content, usage) {
					onTeamComplete(k,content,usage,'Compressed Team Formatter - '+getExpert(team,'formatter').name)
				} 
				let formatterContentc = await start({messages: mergeChatHistory(getSystemMessage(getExpert(team,'formatter')), {role:'user', content:[message, cContent ].join("\n")}) , modelConfig: getExpert(team,'formatter').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
				//let formatterContent = handleAssistantResponse(formatterContentc)
				//generated[1] = {content: formatterContent, log: formatterContentc.log, name: 'Formatter'}
				sendComplete()
			} else {
				sendComplete()
			}
			return {content: generated, log: tally}
		}
		
		async function runExpertsParallel(expertMessage, useExperts, runFormatter = true) {
			//console.log("RUN EXP PAR",useExperts)
			let promises=[]
			let names = []
			let k = 0
			let lastResponse
			let innerGenerated = []
				
				
			function onTeamUpdate(k, content, partial) {
				//console.log("onTeamUpdate",k, content  && content.slice(0,10))
				// handle team
				if (Array.isArray(content)) {
					for (let i = 0; i < content.length; i++) {
						innerGenerated[k + i] = {content: content}
					}
				// handle persona
				} else {
					innerGenerated[k] = {content: content}
				}
				generated = innerGenerated
				sendUpdate()
			}
			
			function onTeamComplete(k, content, usage, name) {
				//console.log("onTeamComplete",k, content, usage, name)
				// handle team
				if (Array.isArray(content)) {
					//console.log("onTeamComplete arr",k, content, usage, name)
					for (let i = 0; i < content.length; i++) {
						innerGenerated[k + i] = {content: content[i].content, log:content[i].log, name: (name + (content[i].name ? (" - " + content[i].name) : ""))}
					}
					if (usage) updateTallies(usage.tokens_in, usage.tokens_out)
					generated = innerGenerated
					sendUpdate()
					//console.log("onTeamComplete array ",generated)
				// handle persona
				} else  {
					innerGenerated[k] = {content, log:usage, name: name}
					if (usage) updateTallies(usage.tokens_in, usage.tokens_out)
					generated = innerGenerated
					sendUpdate()
					//console.log("onTeamComplete text ", content && content.slice ? content.slice(0,10) : content)
				}
				
			}
				
			if (Array.isArray(useExperts)) {
				for (let l in useExperts) {
					let member = useExperts[l]
					if (member) {
						names[l] = member && member.name ? member.name : ''
						function iOnUpdate(content, partial) {
							onTeamUpdate(k,content,partial)
						}
						function iOnComplete(content, usage) {
							//console.log("PAR COMPL", k, offset, names)
							onTeamComplete(k,content,usage,((member && member.name) ? 	member.name : ''))
							//lastResponse = Array.isArray(content) ? content[content.length - 1].content : content 
							if (Array.isArray(content)) {
								k = k + content.length
							} else {
								k = k + 1
							}
						}
						if (member.id && member.id.startsWith('TEAM:::::'))  {
							//console.log("DOteam",member.name)
							promises.push(startTeam({
								message: expertMessage,
								messages:  combinedMessages(messages, [{role:'user', content:expertMessage}]),
								team: member, 
								onUpdate: iOnUpdate, 
								onComplete: iOnComplete, 
								onStart: function() {}
							}))
						} else {
							//console.log("DOpers",member.name)
							promises.push(start({
								messages:  combinedMessages(messages, [{role:'user', content:expertMessage}], getSystemMessage(member)), 
								modelConfig: member.config, 
								onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage 
							}))
						}
					}
				}
			}
			return Promise.all(promises).then(function(results) {
				//console.log("DONE PARALLELL",results,JSON.parse(JSON.stringify(generated)))
				let newGenerated = []
				//let newGenerated = [generated[0]] //JSON.parse(JSON.stringify(generated))
				for (let i in results) {
					let r = results[i]
					if (r && Array.isArray(r.content)) {
						r.content.forEach(function(c, ck) {	
							if (c && c.content) {
								newGenerated.push({content: c.content, log: c.log, name: names[i] + (c.name ? ' - ' + c.name : '')})
							}
						})
					} else {
						newGenerated.push({content: r.content, log: r.log, name: names[i]})
					}
				}
				generated = newGenerated
				if (runFormatter) {
					if (getExpert(team,'formatter')) {
						//let j = results.length -1  + offset
						start({messages: mergeChatHistory(getSystemMessage(getExpert(team,'formatter')), {role:'user', content:[message, generated.map(function(g) {return g.content}).join("\n") ].join("\n")}), modelConfig: getExpert(team,'formatter').config, onUpdate: function(){}, onComplete: function(){}, onError, aiUsage }).then(function(formatterContentc) {
							let formatterContent = handleAssistantResponse(formatterContentc)
							generated.push({content: formatterContent, log: formatterContentc.log, name: getExpert(team,'formatter') ? 'Formatter - ' + getExpert(team,'formatter').name : 'Formatter'})
							sendComplete()
						})
					} else {
						sendComplete()
					}
				} else {
					sendComplete()
				}
				return  {content: generated, log: tally}
			})
		}

		if (onStart) onStart()
		
		function getExpert(team, type) {
			//console.log("	Get eXP",team, type, team && team[type] && team[type].length > 0 ? team[type][0] : null)
			return team && team[type] && team[type] ? team[type] : null
		}
		
		if (team) {
			if (!team.compress || team.type ===  'rolesbased') {	
				let k = 0
				switch (team.type) {
					case 'parallel':
						if (Array.isArray(team.members) && team.members.length > 0) {
							 return runExpertsParallel(message, team.members)
						}
						break
						
					case 'mixtureofexperts':
						if (Array.isArray(team.members) && team.members.length > 0) {
							let memberIdIndex = {}
							let memberNameIndex = {}
							team.members.forEach(function(member) {
								if (member && member.id) memberIdIndex[member.id] = member
								if (member && member.name) memberNameIndex[member.name] = member
							})
							
							function iOnUpdate(content, partial) {
								onTeamUpdate(0,content,partial)
							}
							function iOnComplete(content, usage) {
								onTeamComplete(0,content,usage,'Expert Selector')
							}
							
							if (getExpert(team,'expert_selector')) {
								const selectorRole = getExpert(team,'expert_selector')
								// use custom experts selector
								if (selectorRole && selectorRole.id) {
									// selector MUST return the id of a role or list of comma seperated ids
									let roleIdsc = await start({messages: combinedMessages(messages, [{role:'user', content:message }], getSystemMessageContent(selectorRole)),  modelConfig: selectorRole.config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
									let roleIds = handleAssistantResponse(roleIdsc)
									let experts = []
									roleIds.split(",").forEach(function(roleId) {
										if (roleId && roleId.trim()) {
											Object.keys(memberIdIndex).forEach(function(id) {
												if (roleId.toLowerCase().indexOf(id.toLowerCase()) !== -1) {
													experts.push(memberIdIndex[roleId])
												}
											})
										}
										// allow for name matching
										if (roleId && roleId.trim()) {
											Object.keys(memberNameIndex).forEach(function(id) {
												if (roleId.toLowerCase().indexOf(id.toLowerCase()) !== -1) {
													experts.push(memberNameIndex[roleId])
												}
											})
										}
									})
									let selectorContentRow = {content: roleIds, log: roleIdsc.log, name:'Expert Selector - '+ selectorRole.name}
									generated[0] = selectorContentRow
									sendUpdate()
									return runExpertsParallel(message, experts).then(function({content, log}) {
											content = Array.isArray(content) ? content : []
											content.unshift(selectorContentRow)
											sendUpdate()
											return {content, log}
										})
								} else {
									return chooseExperts(message, team.members).then(function({experts,log}) { 
										let selectorContentRow = {content: experts.map(function(e) {return e.name}).join(","), log, name:'Expert Selector'}
										return runExpertsParallel(message, experts).then(function({content, log}) {
											content = Array.isArray(content) ? content : []
											content.unshift(selectorContentRow)
											sendUpdate()
											return {content, log}
										})
									})
								}
							} else {
								return chooseExperts(message, team.members).then(function({experts,log}) { 
									let selectorContentRow = {content: experts.map(function(e) {return e.name}).join(","), log, name:'Expert Selector'}
									return runExpertsParallel(message, experts).then(function({content, log}) {
										content = Array.isArray(content) ? content : []
										content.unshift(selectorContentRow)
										sendUpdate()
										return {content, log}
									})
								})
							}
						}
						break
						
					case 'generator':
						if (Array.isArray(team.members) && team.members.length > 0) {
							//let memberIdIndex = {}
							//let memberNameIndex = {}
							//team.members.forEach(function(member) {
								//if (member && member.id) memberIdIndex[member.id] = member
								//if (member && member.name) memberNameIndex[member.name] = member
							//})
							const questionGeneratorRole = getExpert(team,'question_generator')
							// use custom experts selector
							if (questionGeneratorRole && questionGeneratorRole.id) {
								function iOnUpdate(content, partial) {
									onTeamUpdate(k,content,partial)
								}
								function iOnComplete(content, usage) {
									onTeamComplete(k,content,usage,getExpert(team,'question_generator').name)
									if (Array.isArray(content)) {
										k = k + content.length
									} else {
										k = k + 1
									}
								}
								let questionGeneratorContent = getSystemMessage(questionGeneratorRole)
								questionGeneratorContent.name = team.name + ' - Question Generator - '+ questionGeneratorRole.name
								let questionGeneratorsc = await start({messages: combinedMessages(messages, [{role:'user', content:message }], questionGeneratorContent.content), modelConfig: questionGeneratorRole.config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
								let questions = handleAssistantResponse(questionGeneratorsc)
								let qa = questions.split("\n")
								// ensure no bloanks
								qa = qa.filter(function(q) {
									if (q && q.trim()) return true
									return false
								})
								if (team.max_generated_items > 0) {
									qa = qa.slice(0,team.max_generated_items)
								} else {
									qa = qa.slice(0,2)
								}
								let promises = []
								qa.forEach(function(question) {
									promises.push(runExpertsParallel(question, team.members))
								})
								return Promise.all(promises).then(function(responses) {
									//console.log("GENER RESPONSES", responses)
									let final = []
									for (let i in responses) {
											let r = responses[i]
											if (r && Array.isArray(r.content)) {
												r.content.forEach(function(c, ck) {	
													if (c && c.content) {
														final.push({content: c.content, log: c.log, name:  team.name + (c.name ? ' - ' + c.name : '')})
													}
												})
											} else {
												final.push({content: r.content, log: r.log, name: team.name + ' - ' +  r.name})
											}
										}
									final.unshift(questionGeneratorContent)
									//let final = responses.map(function(g) {return g.content})
									if (getExpert(team,'formatter')) {
										start({messages: [getSystemMessage(getExpert(team,'formatter')), {role:'user', content:[message, final.map(function(g) {return g.content}).join("\n") ].join("\n")}], modelConfig: getExpert(team,'formatter').config, onUpdate: function(){}, onComplete: function(){}, onError, aiUsage }).then(function(formatterContentc) {
											let formatterContent = handleAssistantResponse(formatterContentc)
											generated = final
											generated[k + 1] = {content: formatterContent, log: formatterContentc.log, name: getExpert(team,'formatter') ? team.name + ' - Formatter - ' + getExpert(team,'formatter').name : 'Formatter'}
											sendComplete()
											if (shouldMemberUseExitGate(getExpert(team,'formatter'), formatterContentc)) {
												stop()
												// break
											}
										})
									} else {
										generated = final
										sendComplete()
									}
									//iOnComplete(final,  {tokens_in: 0, tokens_out:0, duration: 0})
								})
								
								
							} else {
								function iOnUpdate(content, partial) {
									onTeamUpdate(k,content,partial)
								}
								function iOnComplete(content, usage) {
									onTeamComplete(k,content,usage,'')
									if (Array.isArray(content)) {
										k = k + content.length
									} else {
										k = k + 1
									}
								}
								return generateQuestions(message).then(function({questions, log}) { 
									let generatorContent = {content: questions.map(function(e) {return e}).join(","), log, name:team.name + ' - Question Generator'}
									sendUpdate()
									let qa = questions.filter(function(q) {
										if (q && q.trim()) return true
										return false
									})
									if (team.max_generated_items > 0) {
										qa = qa.slice(0,team.max_generated_items)
									} else {
										qa = qa.slice(0,2)
									}
									let promises = []
									
									qa.forEach(function(question) {
										promises.push(runExpertsParallel(question, team.members,1, false))
									})
									return Promise.all(promises).then(function(responses) {
										//let final = responses.map(function(g) {return g.content})
										let final = []
										//let newGenerated = [generated[0]] //JSON.parse(JSON.stringify(generated))
										for (let i in responses) {
											let r = responses[i]
											if (r && Array.isArray(r.content)) {
												r.content.forEach(function(c, ck) {	
													if (c && c.content) {
														final.push({content: c.content, log: c.log, name:  team.name + ' - Question Generator' + (c.name ? ' - ' + c.name : '')})
													}
												})
											} else {
												final.push({content: r.content, log: r.log, name: team.name + ' - Question Generator - ' +r.name})
											}
										}
										final.unshift(generatorContent)
										//console.log("GENEARATION DONE",getExpert(team,'formatter'),generated,final, responses)
										
										
										if (getExpert(team,'formatter')) {
											start({messages: [getSystemMessage(getExpert(team,'formatter')), {role:'user', content:[message, final.map(function(g) {return g.content}).join("\n") ].join("\n")}], modelConfig: getExpert(team,'formatter').config, onUpdate: function(){}, onComplete: function(){}, onError, aiUsage }).then(function(formatterContentc) {
												let formatterContent = handleAssistantResponse(formatterContentc)
												generated = final
												generated[k + 1] = {content: formatterContent, log: formatterContentc.log, name: getExpert(team,'formatter') ? team.name + ' - Formatter - ' + getExpert(team,'formatter').name : 'Formatter'}
												sendComplete()
												if (shouldMemberUseExitGate(getExpert(team,'formatter'), formatterContentc)) {
													stop()
													//break
												}
											})
										} else {
											generated = final
											sendComplete()
										}
										
										//iOnComplete(final,  {tokens_in: 0, tokens_out:0, duration: 0})
									})
								})
							}
						}
						break
					
					case 'rolesbased':
						// console.log(team)
						if (!getExpert(team,'generator')) {
							onError(new Error("A generator is required for roles based teams"))
							sendComplete()
						} else {
							let finished = false
							let feederContent = ''
							let plannerContent = ''
							let generatorContent = ''
							let summariserContent = ''
							let rewriterContent = ''
							let formatterContent = ''
							let blockerContent = ''
							let iterations = 0			
							let max = team.max_iterations > 0 ? team.max_iterations : 2
							if (getExpert(team,'blocker')) {
								function iOnUpdate(content, partial) {
									onTeamUpdate(k,content,partial)
								}
								function iOnComplete(content, usage) {
									onTeamComplete(k,content,usage,'Blocker - ' + getExpert(team,'blocker').name)
									k = k + 1
								}
								let blockerContentc = await start({messages: prependSystemMessage(getExpert(team,'blocker'), [{role:'user', content:[message].join("\n")}]), modelConfig: getExpert(team,'blocker').config, onUpdate: iOnUpdate, onComplete: function() {}, onError, aiUsage })
								 blockerContent = handleAssistantResponse(blockerContentc)
								 onTeamComplete(k, blockerContent, blockerContentc.log, 'Blocker')
								 if (shouldMemberUseExitGate(getExpert(team,'blocker'), blockerContentc)) {
									stop()
									finished = true
									//break
								}
								
							}	 
							if (!blockerContent) blockerContent = "PASS"
							finished = (blockerContent && blockerContent.trim() === 'FAIL') ? true : false
							if (!finished) {
								if (getExpert(team,'feeder')) {
									k+=1
									function iOnUpdate(content, partial) {
										onTeamUpdate(k,content,partial)
									}
									function iOnComplete(content, usage) {
										onTeamComplete(k,content,usage,'Feeder - ' + getExpert(team,'feeder').name)
										if (Array.isArray(content)) {
											k = k + content.length
										} else {
											k = k + 1
										}
									}
									if (getExpert(team,'feeder').id && getExpert(team,'feeder').id.startsWith("TEAM:::::")) {
										let feederContentc = await startTeam({
											message: message ,
											messages:  combinedMessages(messages, [{role:'user', content:[message].join("\n")}]),
											team: getExpert(team,'feeder'), 
											onUpdate: iOnUpdate, 
											onComplete: iOnComplete, 
											onStart: function() {}
										})
										feederContent = handleAssistantResponse(feederContentc)
										if (shouldMemberUseExitGate(getExpert(team,'feeder'), feederContentc)) {
											stop()
											finished = true
											//break
										}
									} else {
										let feederContentc = await start({messages: combinedMessages(messages, [{role:'user', content:[message].join("\n") }], getSystemMessageContent(getExpert(team,'feeder'))) , modelConfig: getExpert(team,'feeder').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
										feederContent = handleAssistantResponse(feederContentc)
										if (shouldMemberUseExitGate(getExpert(team,'feeder'), feederContentc)) {
											stop()
											finished = true
											//break
										}
									}
								}
								if (!finished && getExpert(team,'planner')) {
									k+=1
									function iOnUpdate(content, partial) {
										onTeamUpdate(k,content,partial)
									}
									function iOnComplete(content, usage) {
										//console.log("PAR COMPL", k, offset, names)
										onTeamComplete(k ,content,usage,'Planner - ' + getExpert(team,'planner').name)
										if (Array.isArray(content)) {
											k = k + content.length
										} else {
											k = k + 1
										}
									}
									if (getExpert(team,'planner').id && getExpert(team,'planner').id.startsWith("TEAM:::::")) {
										let plannerContentc = await startTeam({
											message: message ,
											messages:  combinedMessages(messages, [{role:'user', content:[message].join("\n")}]),
											team: getExpert(team,'planner'), 
											onUpdate: iOnUpdate, 
											onComplete: iOnComplete, 
											onStart: function() {}
										})
										plannerContent = handleAssistantResponse(plannerContentc)
										if (shouldMemberUseExitGate(getExpert(team,'planner'), plannerContentc)) {
											stop()
											finished = true
											//break
										}
									} else {
										let plannerContentc = await start({messages:  combinedMessages(messages, [{role:'user', content:[message].join("\n") }], getSystemMessageContent(getExpert(team,'planner'))), modelConfig: getExpert(team,'planner').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
										plannerContent = handleAssistantResponse(plannerContentc)
										if (shouldMemberUseExitGate(getExpert(team,'planner'), plannerContentc)) {
											stop()
											finished = true
											//break
										}
									}
								}
								//console.log("PRE ROLEBASED",blockerContent, feederContent, plannerContent)
								while (!finished && (iterations < max)) {
									iterations += 1
									
									if (!finished) {
										if (!finished && getExpert(team,'generator')) {
											k+=1
											function iOnUpdate(content, partial) {
												onTeamUpdate(k,content,partial)
											}
											function iOnComplete(content, usage) {
												//console.log("PAR COMPL", k, offset, names)
												onTeamComplete(k,content,usage,'Generator - ' + getExpert(team,'generator').name)
												if (Array.isArray(content)) {
													k = k + content.length
												} else {
													k = k + 1
												}
											}
											if (!finished && getExpert(team,'generator').id && getExpert(team,'generator').id.startsWith("TEAM:::::")) {
												let generatorContentc = await startTeam({
													message: message ,
													messages:  combinedMessages(messages, [{role:'user', content:[message, feederContent, plannerContent, generatorContent, summariserContent, rewriterContent].join("\n")}], getSystemMessageContent(getExpert(team,'generator'))),
													team: getExpert(team,'generator'), 
													onUpdate: iOnUpdate, 
													onComplete: iOnComplete, 
													onStart: function() {}
												})
												generatorContent = handleAssistantResponse(generatorContentc)
												if (shouldMemberUseExitGate(getExpert(team,'generator'), generatorContentc)) {
													stop()
													finished = true
													break
												}
											} else if (!finished) {
												let generatorContentc = await start({messages:  combinedMessages(messages, [{role:'user', content:[message, feederContent, plannerContent, generatorContent, summariserContent, rewriterContent].join("\n") }], getSystemMessageContent(getExpert(team,'generator')) ), modelConfig: getExpert(team,'generator').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
												generatorContent = handleAssistantResponse(generatorContentc)
												if (shouldMemberUseExitGate(getExpert(team,'generator'), generatorContentc)) {
													stop()
													finished = true
													break
												}
											}
										}
										if (!finished && getExpert(team,'summariser')) {
											k+=1
											function iOnUpdate(content, partial) {
												onTeamUpdate(k,content,partial)
											}
											function iOnComplete(content, usage) {
												let persona = getExpert(team,'summariser')
												onTeamComplete(k,content,usage,'Summariser '+((persona && persona.name) ? ' - ' + persona.name : ''))
											}
											let summariserContentc = await start({messages: combinedMessages(messages,[{role:'user', content:[message, plannerContent, generatorContent].join("\n")}], getSystemMessageContent(getExpert(team,'summariser')) ), modelConfig: getExpert(team,'summariser').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
											summariserContent = handleAssistantResponse(summariserContentc)
											if (shouldMemberUseExitGate(getExpert(team,'summariser'), summariserContentc)) {
												stop()
												finished = true
												break
											}
										}
										let scorerContent = ''
										if (!finished && getExpert(team,'scorer')) {
											k+=1
											function iOnUpdate(content, partial) {
												onTeamUpdate(k,content,partial)
											}
											function iOnComplete(content, usage) {
												let persona = getExpert(team,'scorer')
												onTeamComplete(k,content,usage,'Scorer '+((persona && persona.name) ? ' - ' + persona.name : ''))
											}
											
											 let scorerContentc = await start({
												messages: combinedMessages(messages, [{role:'user', content:[message,  (summariserContent ? summariserContent : generatorContent)].join("\n")}], getSystemMessageContent(getExpert(team,'scorer'))), 
												modelConfig: getExpert(team,'scorer').config, 
												onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage 
											})
											 scorerContent = handleAssistantResponse(scorerContentc)
											 if (!scorerContentc) scorerContentc = "PASS"
											 if (shouldMemberUseExitGate(getExpert(team,'scorer'), scorerContentc)) {
												stop()
												finished = true
												break
											}
										}	 
										
										finished = (scorerContent && scorerContent.trim() === 'FAIL') ? false : true
										if (!finished &&  (iterations < max)) {
											if (getExpert(team,'rewriter')) {
												k+=1
												function iOnUpdate(content, partial) {
													onTeamUpdate(k,content,partial)
												}
												function iOnComplete(content, usage) {
													let persona = getExpert(team,'rewriter')
													onTeamComplete(k,content,usage,'Rewriter '+((persona && persona.name) ? ' - ' + persona.name : ''))
												}
												let rewriterContentc = await start({messages: combinedMessages(messages, [{role:'user', content:[message, feederContent, plannerContent, generatorContent, summariserContent, rewriterContent].join("\n")}], getSystemMessageContent(getExpert(team,'rewriters'))), modelConfig: getExpert(team,'rewriter').config, onUpdate: iOnUpdate, onComplete: iOnComplete})
												rewriterContent = handleAssistantResponse(rewriterContentc)
												if (shouldMemberUseExitGate(getExpert(team,'rewriter'), rewriterContentc)) {
													stop()
													finished = true
													break
												}
											}
										}
									}
								}
								if (!finished && getExpert(team,'formatter')) {
									k+=1
									function iOnUpdate(content, partial) {
										onTeamUpdate(k,content,partial)
									}
									function iOnComplete(content, usage) {
										let persona = getExpert(team,'formatter')
										onTeamComplete(k,content,usage,'Formatter '+((persona && persona.name) ? ' - ' + persona.name : ''))
									}
									let formatterContentc = await start({messages: [getSystemMessage(getExpert(team,'formatter')), {role:'user', content:[message, generatorContent, summariserContent, ].join("\n")}], modelConfig: getExpert(team,'formatter').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
									formatterContent = handleAssistantResponse(formatterContentc)
									if (shouldMemberUseExitGate(getExpert(team,'formatter'), formatterContentc)) {
										stop()
										finished = true
										//break
									}
								}
							}
							sendComplete()
							return {content: generated, log: tally}
						}
						break
					case 'linear':
					case 'linearcollation':
					default:
						console.log('TYPE LINEAR ',team)
						if (Array.isArray(team.members) && team.members.length > 0) {
							let lastResponse = ''
							for (let i in team.members) {
								let member = team.members[i]
								if (member) {
									function iOnUpdate(content, partial) {
										onTeamUpdate(k,content,partial)
									}
									function iOnComplete(content, usage) {
										onTeamComplete(k,content,usage,((member && member.name) ? 	member.name : ''))
										lastResponse = Array.isArray(content) ? content[content.length - 1].content : content 
										if (Array.isArray(content)) {
											k = k + content.length
										} else {
											k = k + 1
										}
									}
									let nextContent = team.type === 'linear' ? lastResponse  : generated.map(function(g) {return g.content}).join("\n")
									if (member.id.startsWith('TEAM:::::'))  {
										let r = await startTeam({
											message: message + nextContent,
											messages:  combinedMessages(messages, [{role:'user', content:[message, nextContent].join("\n")}]),
											team: member, 
											onUpdate: iOnUpdate, 
											onComplete: iOnComplete, 
											onStart: function() {}
										})
									} else {
										let r = await start({
											messages:  combinedMessages(messages, [{role:'user', content:[message, nextContent].join("\n")}], getSystemMessageContent(member)),
											modelConfig: member.config, 
											onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage 
										})
										if (shouldMemberUseExitGate(member, r)) {
											stop()
											break
										}
									}
								}
							}
							console.log('DONE TEAM MEMBERS NOW FORMAT', getExpert(team,'formatter'))
							if (getExpert(team,'formatter')) {
								let k = generated.length 
								function iOnUpdate(content, partial) {
									onTeamUpdate(k,content,partial)
								}
								function iOnComplete(content, usage) {
									let member = getExpert(team,'formatter')
									onTeamComplete(k,content,usage,'Formatter '+((member && member.name) ? ' - ' + member.name : ''))
								}
								let responsec = await start({messages: prependSystemMessage(getExpert(team,'formatter'), [{role:'user', content:[message, generated.map(function(g) {return g.content}).join("\n") ].join("\n")}]), modelConfig: getExpert(team,'formatter').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
								if (shouldMemberUseExitGate(getExpert(team,'formatter'), responsec)) {
									stop()
									//break
								}
								sendComplete()
								return {content: generated, log: tally}
							} else {
								sendComplete()
								return {content: generated, log: tally}
							}
							
						}
						
						
						break
				}
			} else {
				switch (team.type) {
					case 'parallel':
						await startCompressedTeam(team,['For each of the personas listed below generate a response to the question.'])
						break
					case 'linear':
						await startCompressedTeam(team,['For each of the personas listed below generate a response to the question. Each person takes into account the response of previous personas.'])
						break
					case 'mixtureofexperts':
						if (Array.isArray(team.members) && team.members.length > 0) {
							let memberIdIndex = {}
							let memberNameIndex = {}
							team.members.forEach(function(member) {
								if (member && member.id) memberIdIndex[member.id] = member
								if (member && member.name) memberNameIndex[member.name] = member
							})
							let p = getExpert(team,'expert_selector')
							if (p) {
								const selectorRole = getExpert(team,'expert_selector')
								// use custom experts selector
								if (selectorRole && selectorRole.id) {
									// selector MUST return the id of a role or list of comma seperated ids
									let roleIdsc = await start({messages: combinedMessages(messages, [{role:'user', content:message}], getSystemMessageContent(selectorRole)), modelConfig: selectorRole.config, onUpdate: function() {}, onComplete: function() {}, onError, aiUsage })
									let roleIds = handleAssistantResponse(roleIdsc)
									//console.log("ROLES SELECTED", roleIds)
									generated[0] = {content: roleIds, log: roleIdsc.log, name: 'Role Selector - '+ selectorRole.name}
									let experts = []
									roleIds.split(",").forEach(function(roleId) {
										if (roleId && memberIdIndex[roleId]) {
											experts.push(memberIdIndex[roleId])
										}
										// allow for name matching
										if (roleId && memberNameIndex[roleId]) {
											experts.push(memberNameIndex[roleId])
										}
									})
									return startCompressedTeam({members: experts, formatter: getExpert(team,'formatter')}, ['For each of the personas listed below generate a response to the question.'],1)
								} else {
									chooseExperts(message, team.members).then(function({experts,log}) {
										generated[0] = {content: experts.map(function(e) {return e.name}).join(","), log, name:'Expert Selector'}
									sendUpdate()
									
										return startCompressedTeam({members: experts, formatter: getExpert(team,'formatter')}, ['For each of the personas listed below generate a response to the question.'])
									},1)
								}
							} else {
								chooseExperts(message, team.members).then(function({experts,log}) {
									generated[0] = {content: experts.map(function(e) {return e.name}).join(","), log, name:'Expert Selector'}
									sendUpdate()
									
									return startCompressedTeam({members: experts, formatter: getExpert(team,'formatter')}, ['For each of the personas listed below generate a response to the question.'])
								},1)
							}
						}
						break
					default: 
						break
				}
				sendComplete()
				return {content: generated, log: tally}
			}
		}
	}
	
	
	function fixCode(code, errors, language=null) {
		console.log("FIX CODE",code, errors, language)
		return new Promise(function(resolve, reject) {
			let systemMessage=`You are an expert software engineer.`
			if (language) systemMessage += "You usually write software in "+language+" and have a strong understanding of the language structure and libraries."
			let message = `Given the error message, fix the following code.
###ERROR
` + errors.join("\n") + `
###CODE
` + message + `
`
			start({messages:[{role:'system', content: systemMessage}, {role:'user', content: message}], modelConfig: {}, onUpdate: function() {}, onComplete: function(code, log) {
				console.log("FIXED CODE",code, log)
				resolve({code, log})
			}})
		})
	}
	
	function fixGraph(graph, error) {
		console.log("FIX GRAPH",graph, error)
		return new Promise(function(resolve, reject) {
			let systemMessage=`You are an expert at working with charts to present information. In particular you know all the tricks for using mermaid charts.`
			let message = `Given the error message, fix the following chart.
###CHART
` + message + `
###ERROR
` + error + "\n"

			start({messages:[{role:'system', content: systemMessage}, {role:'user', content: message}], modelConfig: {}, onUpdate: function() {}, onComplete: function(newGraph, log) {
				console.log("FIXED GRAPH",newGraph, log)
				resolve({newGraph, log})
			}})
		})
	}
		
    return {stop, start, startTeam, isBusy, prependSystemMessage, tools, fixGraph, fixCode}
}


export default  agenticLlmApiClient

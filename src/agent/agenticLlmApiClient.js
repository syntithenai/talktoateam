import { FrameProcessor } from '@ricky0123/vad-web'
import nlp from 'compromise'
//const config = require('./config')

//const nlp = window.nlp
function agenticLlmApiClient({token, modelSelector, aiUsage, onError, tools , onStart, abortController}) {
	// force local api
	// url = import.meta.env.VITE_API_URL
	// console.log("AGENTIC",token)
	tools = typeof tools === 'object' ? tools : {}
	let isStopped = true
	
	//console.log("TOOLS",tools)

	let isBusy = false
	function setIsBusy(v) { isBusy = v}
	// var controller = new AbortController()
	
	
	
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
	
	function openAIParametersFromConfig(modelConfig, url) {
		let formData = {}
		if (modelConfig) {
			if (modelConfig.outputType === 'json')  formData.response_format = { "type": "json_object" }
			if (modelConfig.temperatureOpenAI) formData.temperature = parseFloat(modelConfig.temperatureOpenAI) > 0 ? parseFloat(modelConfig.temperatureOpenAI) : 0
			if (modelConfig.topPOpenAI) formData.top_p = parseFloat(modelConfig.topPOpenAI) > 0 ? parseFloat(modelConfig.topPOpenAI) : null
			if (modelConfig.maxTokens) formData.max_tokens = parseFloat(modelConfig.maxTokens) > 0 ? parseFloat(modelConfig.maxTokens) : null
			if (Array.isArray(modelConfig.stopTokens) && modelConfig.stopTokens.length > 0) formData.stop = modelConfig.stopTokens 
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

	async function runToolCall(callText) {
		let parts = callText.split("(")
		let functionName = parts[0]
		// all tool call function names MUST BE lowercase
		if (tools.hasOwnProperty(functionName.toLowerCase())) {
			let parameters = parts.slice(1).join("(")
			let endPos = parameters.lastIndexOf(")")
			let useParams = parameters.slice(0,endPos)
			// tools are called with an array of parameters
			let results = await tools[functionName.toLowerCase()](parseCSVLine(useParams))
			//console.log("TOOL RESULTS",functionName,useParams, results)
			toolCalls[callText] = results
			return [callText,results]
		} else {
			return [callText,'']
		}
	}
	
	function startToolCalls(fullText) {
		let sections = (fullText ? fullText : '').split("```")
		console.log("startToolCalls", tools)
		sections.forEach(function(section) {
			if (section.trim().startsWith('tool')) {
				console.log("startToolCalls TOOL SECTION",section)
				// replace tools in this section
				section.trim().slice(4).split("\n").forEach(function(line) {
					let functionName = line.split("(")[0].trim()
					console.log("startToolCalls TOOL fn",functionName, line)
					if (tools.hasOwnProperty(functionName) && !toolCalls.hasOwnProperty(line.trim()))  {
						toolCalls[line.trim()] = null
						toolCallPromises.push(runToolCall(line.trim()))
					} 
				})
			}
		})
		console.log("TOOLcalls",toolCalls)
		return toolCalls
	}
	
	function renderToolCalls(fullText) {
		console.log("rednerToolCalls")
		let sections = (fullText ? fullText : '').split("```")
		sections.forEach(function(section,sk) {
			if (section.trim().startsWith('tool')) {
				// replace tools in this section
				let final = section.trim().slice(4).split("\n").map(function(line) {
					if (line.trim() === 'tool') {
						return ''
					} else if (toolCalls[line.trim()])  {
						return "\n###RESULT\n" + toolCalls[line.trim()]
					} else {
						return line
					}
				}).join("\n")
				sections[sk] = final
			}
		})
		const final = sections.map(function(s) {return s.trim()}).join("```")
		return final
	}
	
	function cleanHistory (chatHistory) {
		let systemMessage = null
		let firstElement = null
		// clear messages from the beginning until we find the first user message, save the systemMessage
		while ((!firstElement || firstElement.role !== 'user') && chatHistory.length > 0) {
			firstElement = chatHistory.shift()
			if (firstElement && firstElement.role === 'system') {
				systemMessage = firstElement
			} else if (firstElement && firstElement.role === 'assistant') {
				// discard it
			} else if (firstElement && firstElement.role === 'user') {
				chatHistory.unshift(firstElement)
			} 
		}
		if (systemMessage)  chatHistory.unshift(systemMessage)
		chatHistory = chatHistory.map(function(h) {
			return {'role':h.role, 'content': h.content}
		})
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
	
	async function start({messages, modelConfig, onUpdate, onComplete,onStart}) {
		console.log("AGENTIC START",token)	
		let startTime = new Date()
		if (modelConfig && modelConfig.type ==="algorithmic" ) {
			isStopped = false
			console.log(modelConfig,modelConfig && modelConfig.processingFunctionType, modelConfig && modelConfig.processingFunction )
			let functionResult = null
			if (modelConfig && modelConfig.processingFunction) {
				if (true || modelConfig.processingFunctionType === 'evaljavascript') {
					//const AsyncFunction = async function () {}.constructor;
					let processorFunction = new Function('message','messages', modelConfig.processingFunction);
					let lastUserMessage = getLastUserMessage(messages)
					let message = lastUserMessage ? lastUserMessage.content : ''
					console.log("Function CALL:", message, messages, lastUserMessage);
					try {
						let functionResult =   processorFunction(message, messages);
						console.log("Function res:", functionResult);
						if (functionResult && functionResult.then && typeof functionResult.then == 'function') {
							return functionResult.then(function(pRes) {
								console.log("Function Resultq1:", pRes);
								let ret = {content: pRes, log: {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()}}
								onComplete(pRes, {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()})
								return ret
							}).catch(function(e) {
								onError("Error evaluating function:"+ e)
							})
						} else {
							console.log("Function Resultss:", functionResult);
							let ret = {content: functionResult, log: {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()}}
							onComplete(functionResult, {tokens_in: 0, tokens_out: 0, duration: (new Date() - startTime).valueOf()})
							return ret
						}
					} catch (error) {
						console.error("Error evaluating function:", error);
						onError("Error evaluating function:"+ error)
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
			console.log("MT",modelType, modelConfig)
			//let modelObj = modelSelector.getModel(modelType)
			let modelObj = modelSelector.getModel(modelType)
			let model = modelSelector.getModelKey(modelType)
			if (!modelObj) throw new Error('Unable to find a matching model for '+ modelType)
			let url = modelSelector.getModelUrl(modelObj.provider)
			if (!url) throw new Error('Unable to find a model url')
			// key could be provider key for direct cors supported calls
			// OR google access_token for this service
			let key = modelSelector.getModelApiKey(modelObj.provider)
			console.log("Persona Start:",url, key, messages,modelConfig, modelObj);
			if (!key) key = token && token.access_token ? token.access_token : ''
			isStopped = false
			var signal = abortController.current.signal;
			if (onStart) onStart()
			setIsBusy(true)
			let formData = {
				model: model,
				messages: cleanHistory(messages)
			}
			formData = Object.assign(formData,openAIParametersFromConfig(modelConfig, url))
			let sent = []
			let buffer = []
			let lastSentenceCount = 0
			let sentences = []
			let tokensIn = 0
			let tokensOut = 0
			let startTime = new Date()
			
			try {
				console.log("START REQUEST",key, formData.messages)
				let response = await fetch(url + '/chat/completions', {
					signal,
					method: 'POST',
					headers: {
						'Authorization': 'Bearer '+key,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData),
				})
				if (response.status !== 200) {
					stop()
					onError("Error querying model - " + formData.model +'. '+ response.statusText)
				}
				// streaming response via onStart, onUpdate, onComplete and resolve promise with complete final result
				const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
				while (true && !isStopped) {
					const {value, done} = await reader.read();
					if (done) break;
					value.split("data: ").forEach(function(t) {
						let j 
						try {
								j = JSON.parse(t)
						} catch (e) {}
						// collate and tokenise into sentences for TTS delivery
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
						if (j && j.usage) {
							tokensOut = j.usage.completion_tokens > 0 ? j.usage.completion_tokens : 0
							tokensIn = j.usage.prompt_tokens > 0 ? j.usage.prompt_tokens : 0
						}
						if (j && j.x_groq && j.x_groq.usage) {
							tokensOut = j.x_groq.usage.completion_tokens > 0 ? j.x_groq.usage.completion_tokens : 0
							tokensIn = j.x_groq.usage.prompt_tokens > 0 ? j.x_groq.usage.prompt_tokens : 0
						}
					})
					
				}
				// read last token
				try {
					const {lastvalue, lastdone} = await reader.read();
					console.log("LASTVALUE",lastvalue, lastdone)
				} catch (e) {
					console.log('LASTVALUE ERROR',e)
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
					startToolCalls(fullText) 
					return Promise.all(toolCallPromises).then(function(toolCallResults) { 
						let final = renderToolCalls(fullText)
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
				stop()
				onComplete(sent.join("")+buffer.join(""), logEntry)
				return {content: sent.join("")+buffer.join(""), log: logEntry}
				//return sent.join("")+buffer.join("")
			}
		}
	}
	
	function getSystemMessage(persona) {
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
	
	function prependSystemMessage(persona, chatHistory) {
		let systemMessage = getSystemMessage(persona)
		let newHistory = JSON.parse(JSON.stringify(chatHistory))
		newHistory.unshift(systemMessage)	
		return newHistory
	}
	
	function chooseExperts(message, experts) {
		console.log("CHOOSE EXP",message, experts)
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
						onError("A compressed team cannot have nested teams (" + m.name + ')')
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
			let cContentc = await start({messages: mergeChatHistory({role:'system', content: template.join('\n')}, {role:'user', content:'###QUESTION\n' +message}), modelConfig: {}, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
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
								messages:  [{role:'user', content:expertMessage}],
								team: member, 
								onUpdate: iOnUpdate, 
								onComplete: iOnComplete, 
								onStart: function() {}
							}))
						} else {
							//console.log("DOpers",member.name)
							promises.push(start({
								messages:  [getSystemMessage(member), {role:'user', content:expertMessage}],
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
									let roleIdsc = await start({messages: [getSystemMessage(selectorRole), {role:'user', content:message }], modelConfig: selectorRole.config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
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
								let questionGeneratorsc = await start({messages: [questionGeneratorContent, {role:'user', content:message }], modelConfig: questionGeneratorRole.config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
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
						console.log(team)
						if (!getExpert(team,'generator')) {
							onError("A generator is required for roles based teams")
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
											messages:  [{role:'user', content:[message].join("\n")}],
											team: getExpert(team,'feeder'), 
											onUpdate: iOnUpdate, 
											onComplete: iOnComplete, 
											onStart: function() {}
										})
										feederContent = handleAssistantResponse(feederContentc)
									} else {
										let feederContentc = await start({messages: [getSystemMessage(getExpert(team,'feeder')), {role:'user', content:[message].join("\n") }], modelConfig: getExpert(team,'feeder').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
										feederContent = handleAssistantResponse(feederContentc)
									}
								}
								if (getExpert(team,'planner')) {
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
											messages:  [{role:'user', content:[message].join("\n")}],
											team: getExpert(team,'planner'), 
											onUpdate: iOnUpdate, 
											onComplete: iOnComplete, 
											onStart: function() {}
										})
										plannerContent = handleAssistantResponse(plannerContentc)
									} else {
										let plannerContentc = await start({messages: [getSystemMessage(getExpert(team,'planner')), {role:'user', content:[message].join("\n") }], modelConfig: getExpert(team,'planner').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
										plannerContent = handleAssistantResponse(plannerContentc)
									}
								}
								//console.log("PRE ROLEBASED",blockerContent, feederContent, plannerContent)
								while (!finished && (iterations < max)) {
									iterations += 1
									
									if (!finished) {
										if (getExpert(team,'generator')) {
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
											if (getExpert(team,'generator').id && getExpert(team,'generator').id.startsWith("TEAM:::::")) {
												let generatorContentc = await startTeam({
													message: message ,
													messages:  [{role:'user', content:[message, feederContent, plannerContent, generatorContent, summariserContent, rewriterContent].join("\n")}],
													team: getExpert(team,'generator'), 
													onUpdate: iOnUpdate, 
													onComplete: iOnComplete, 
													onStart: function() {}
												})
												generatorContent = handleAssistantResponse(generatorContentc)
											} else {
												let generatorContentc = await start({messages: [getSystemMessage(getExpert(team,'generator')), {role:'user', content:[message, feederContent, plannerContent, generatorContent, summariserContent, rewriterContent].join("\n") }], modelConfig: getExpert(team,'generator').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
												generatorContent = handleAssistantResponse(generatorContentc)
											}
										}
										if (getExpert(team,'summariser')) {
											k+=1
											function iOnUpdate(content, partial) {
												onTeamUpdate(k,content,partial)
											}
											function iOnComplete(content, usage) {
												let persona = getExpert(team,'summariser')
												onTeamComplete(k,content,usage,'Summariser '+((persona && persona.name) ? ' - ' + persona.name : ''))
											}
											let summariserContentc = await start({messages: [getSystemMessage(getExpert(team,'summariser')), {role:'user', content:[message, plannerContent, generatorContent].join("\n")}], modelConfig: getExpert(team,'summariser').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
											summariserContent = handleAssistantResponse(summariserContentc)
										}
										let scorerContent = ''
										if (getExpert(team,'scorer')) {
											k+=1
											function iOnUpdate(content, partial) {
												onTeamUpdate(k,content,partial)
											}
											function iOnComplete(content, usage) {
												let persona = getExpert(team,'scorer')
												onTeamComplete(k,content,usage,'Scorer '+((persona && persona.name) ? ' - ' + persona.name : ''))
											}
											
											 let scorerContentc = await start({messages: [getSystemMessage(getExpert(team,'scorer')), {role:'user', 
												 content:[message,  (summariserContent ? summariserContent : generatorContent)].join("\n")
											}],
												  modelConfig: getExpert(team,'scorer').config, onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage })
											 scorerContent = handleAssistantResponse(scorerContentc)
											 if (!scorerContentc) scorerContentc = "PASS"
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
												let rewriterContentc = await start({messages: [getSystemMessage(getExpert(team,'rewriters')), {role:'user', content:[message, feederContent, plannerContent, generatorContent, summariserContent, rewriterContent].join("\n")}], modelConfig: getExpert(team,'rewriter').config, onUpdate: iOnUpdate, onComplete: iOnComplete})
												rewriterContent = handleAssistantResponse(rewriterContentc)
											}
										}
									}
								}
								if (getExpert(team,'formatter')) {
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
								}
							}
							sendComplete()
							return {content: generated, log: tally}
						}
						break
					case 'linear':
					case 'linearcollation':
					default:
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
											messages:  [{role:'user', content:[message, nextContent].join("\n")}],
											team: member, 
											onUpdate: iOnUpdate, 
											onComplete: iOnComplete, 
											onStart: function() {}
										})
									} else {
										let r = await start({
											messages:  [getSystemMessage(member), {role:'user', content:[message, nextContent].join("\n")}],
											modelConfig: member.config, 
											onUpdate: iOnUpdate, onComplete: iOnComplete, onError, aiUsage 
										})
									}
								}
							}
							sendComplete()
							return {content: generated, log: tally}
						}
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
							sendComplete()
						} else {
							sendComplete()
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
									let roleIdsc = await start({messages: prependSystemMessage(selectorRole, [{role:'user', content:message }]), modelConfig: selectorRole.config, onUpdate: function() {}, onComplete: function() {}, onError, aiUsage })
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
		
    return {stop, start, startTeam, isBusy, startToolCalls, prependSystemMessage, tools, fixGraph, fixCode}
}


export default  agenticLlmApiClient

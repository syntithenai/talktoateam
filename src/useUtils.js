function exportTeam(teams,teamId, roles, files = null) {
	let filesIndex = {}
	if (Array.isArray(files)) {
		files.forEach(function(f) {
			filesIndex[f.id] = f
		})
	}
	let allRoles = []
	let useTeam = JSON.parse(JSON.stringify(teams[teamId]))
		console.log("EXPORT TEAM",useTeam && useTeam.name, useTeam)
		if (Array.isArray(teams[teamId].files)) {
			let files = []
			teams[teamId].files.forEach(function(fileId) {
				if (filesIndex[fileId]) {
					files.push(filesIndex[fileId])
				}
			})
			useTeam.files = files
		}
		if (Array.isArray(teams[teamId].members)) {
			let members = []
			teams[teamId].members.forEach(function(memberId) {
				if (memberId.startsWith("TEAM:::::")) {
					//console.log("CHILD TEAM", memberId)
					let mKey = memberId.slice(9)
					let roleCopy = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
					//console.log("CHILD TEAM full", roleCopy)
					members.push(Object.assign({}, roleCopy, {id: memberId}))
				} else {
					let roleCopy = roles[memberId] ? JSON.parse(JSON.stringify(roles[memberId])) : {}
					members.push(Object.assign({}, roleCopy, {id: memberId}))
				}
				
			})
			useTeam.members = members
		}
		// moe
		if (Array.isArray(useTeam.expert_selector) && useTeam.expert_selector.length > 0) {
			let useId = useTeam.expert_selector[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.expert_selector = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.expert_selector.id = useId
			} else {
				useTeam.expert_selector = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.expert_selector.id = useId
			}
		} else {
			useTeam.expert_selector = null
		}
		// roles based
		if (Array.isArray(useTeam.planner) && useTeam.planner.length > 0) {
			let useId = useTeam.planner[0]
			//console.log("PLANBNN",useId)
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.planner = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.planner.id = useId
			} else {
				//console.log("PLANBNN ROLE",roles[useId])
				useTeam.planner = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.planner.id = useId
			}
		} else {
			useTeam.planner = null
		}
		if (Array.isArray(useTeam.generator) && useTeam.generator.length > 0) {
			let useId = useTeam.generator[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.generator = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.generator.id = useId
			} else {
				useTeam.generator = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.generator.id = useId
			}
		} else {
			useTeam.generator = null
		}
		if (Array.isArray(useTeam.summariser) && useTeam.summariser.length > 0) {
			let useId = useTeam.summariser[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.summariser = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.summariser.id = useId
			} else {
				useTeam.summariser = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.summariser.id = useId
			}
		} else {
			useTeam.summariser = null
		}
		if (Array.isArray(useTeam.scorer) && useTeam.scorer.length > 0) {
			let useId = useTeam.scorer[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.scorer = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.scorer.id = useId
			} else {
				useTeam.scorer = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.scorer.id = useId
			}
		} else {
			useTeam.scorer = null
		}
		if (Array.isArray(useTeam.rewriter) && useTeam.rewriter.length > 0) {
			let useId = useTeam.rewriter[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.rewriter = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.rewriter.id = useId
			} else {
				useTeam.rewriter = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.rewriter.id = useId
			}
		} else {
			useTeam.rewriter = null
		}
		if (Array.isArray(useTeam.formatter) && useTeam.formatter.length > 0) {
			let useId = useTeam.formatter[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.formatter = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.formatter.id = useId
			} else {
				useTeam.formatter = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.formatter.id = useId
			}
		} else {
			useTeam.formatter = null
		}
		
		if (Array.isArray(useTeam.feeder) && useTeam.feeder.length > 0) {
			let useId = useTeam.feeder[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.feeder = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.feeder.id = useId
			} else {
				useTeam.feeder = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.feeder.id = useId
			}
		} else {
			useTeam.feeder = null
		}
		if (Array.isArray(useTeam.blocker) && useTeam.blocker.length > 0) {
			let useId = useTeam.blocker[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.blocker = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.blocker.id = useId
			} else {
				useTeam.blocker = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.blocker.id = useId
			}
		} else {
			useTeam.blocker = null
		}
		if (Array.isArray(useTeam.question_generator) && useTeam.question_generator.length > 0) {
			let useId = useTeam.question_generator[0]
			if (useId.startsWith("TEAM:::::")) {
				let mKey = useId.slice(9)
				useTeam.question_generator = teams[mKey] ? JSON.parse(JSON.stringify(exportTeam(teams, mKey, roles))) : {}
				useTeam.question_generator.id = useId
			} else {
				useTeam.question_generator = roles[useId] ? JSON.parse(JSON.stringify(roles[useId])) : {}
				useTeam.question_generator.id = useId
			}
		}else {
			useTeam.question_generator = null
		}
		
	
	console.log("EXPORTED TEAM",useTeam)
	return useTeam
}

export default function useUtils() {
	return {
		getTeamMemberIndex(teams,teamId,roles) {
			return {}
		},
		exportTeam,
		downloadText: function(text, filename) {
		  const url = URL.createObjectURL(new Blob([text]));
		  const a = document.createElement('a');
		  a.href = url;
		  a.download = filename;
		  document.body.appendChild(a);
		  a.click();
		  setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);  
		  }, 0);
		
		},
		scrollTo: function (id, offset) {
			//console.log('scroll',id,offset)
			var element = document.getElementById(id);
			if (element) {
			  var headerOffset = offset ? offset : 10;
			  var elementPosition = element.offsetTop;
			  var offsetPosition = elementPosition - headerOffset;
			  setTimeout(function() {
				document.documentElement.scrollTop = offsetPosition;
				document.body.scrollTop = offsetPosition; // For Safari
			  }, 300)
			}
		},
		cosineSimilarity: function(
		  vecA,
		  vecB,
		  precision = 6,
		)  {
		  // Check if both vectors have the same length
		  if (vecA.length !== vecB.length) {
			throw new Error('Vectors must have the same length');
		  }

		  // Compute dot product and magnitudes
		  const dotProduct = vecA.reduce((sum, a, i) => {
			const b = vecB[i]; // Extract value safely
			return sum + a * (b !== undefined ? b : 0); // Check for undefined
		  }, 0);
		  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
		  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

		  // Check if either magnitude is zero
		  if (magnitudeA === 0 || magnitudeB === 0) {
			return 0;
		  }

		  // Calculate cosine similarity and round to specified precision
		  return parseFloat(
			(dotProduct / (magnitudeA * magnitudeB)).toFixed(precision),
		  );
		},
		
	    blobToText: function(blob) {
		  return new Promise((resolve, reject) => {
			var reader = new FileReader();

			reader.onload = function() {
			  resolve(reader.result);
			};

			reader.onerror = function() {
			  reject(new Error('Error reading the Blob as text.'));
			};

			// Read the Blob as text
			if (blob instanceof Blob) {
				reader.readAsText(blob);
			} else {
				resolve()
			}
		  });
		},
		stripCodeParts: function (text) {
			let parts = text.split('```')
			let final = []
			//console.log(parts)
			for (let i = 0 ; i < parts.length; i++) {
				//console.log("LOOP",i)
				let part = parts[i]
				if (i%2 === 0) {
					//console.log("EVEN PART",part)
					// new lines
					if (part && part.trim && part.trim().length > 0) final.push(part)
				}
			}
			return final.join("\n")
		},
		readFileAsText: function(f) {
			//console.log('readfile2blb s',f)
			return new Promise(function(resolve,reject) {
				function readFile(file){
					//console.log('readfile2blb',file)
					var reader = new FileReader();
					reader.onloadend = function(){
						//console.log('readfile2blb loaded',reader.result)
						// skip empty files
						if (reader.result) {
						  resolve(reader.result)
						}
					  }
					  if(file){
						  reader.readAsText(file);
					  }
				  }
				readFile(f)
			})
		},
		base64UrlToText: function  (base64Url) {
			// Extract the Base64-encoded part
			const base64String = base64Url.split(',')[1];
		
			// Decode the Base64 string to a binary string
			const binaryString = atob(base64String);
		
			// Convert binary string to text
			let text = '';
			for (let i = 0; i < binaryString.length; i++) {
				text += String.fromCharCode(binaryString.charCodeAt(i));
			}
		
			return text;
		},
		blobToBase64: function(blob) {
			return new Promise(function(resolve,reject) {
				var reader = new FileReader();
				reader.onload = function() {
					var dataUrl = reader.result;
					//var base64 = dataUrl.split(',')[1];
					resolve(dataUrl);
				};
				if (blob instanceof Blob) {
					reader.readAsDataURL(blob);
				} else {
					resolve()
				}
			})
		},
		generateRandomId: function() {
			var timestamp = new Date().getTime();
			var randomNumber = Math.random().toString(36).substr(2);
			return timestamp + '-' + randomNumber;
		},
		
		generateShortRandomId: function() {
			var randomNumber = Math.random().toString(36).substr(2);
			return randomNumber;
		},
		
		summariseConfig: function(config) {
			//console.log("summ conf", config)
		
			let usingOpenAiTts = (config && config.tts && config.tts.use === "openai" && config.tts.openai_key)? true : false
			let usingSelfHostedTts = (config && config.tts && config.tts.use === "self_hosted" && config.tts.self_hosted_url)? true : false
			let usingWebSpeechTts = (config && config.tts && config.tts.use === "web_speech")? true : false
			let usingMeSpeakTts = (config && config.tts && config.tts.use === "me_speak")? true : false
			let usingTts = (usingOpenAiTts || usingSelfHostedTts || usingWebSpeechTts || usingMeSpeakTts)
			
			let usingOpenAiStt = (config && config.stt && config.stt.use === "openai" && config.stt.openai_key)? true : false
			let useGroqStt = (config && config.stt && config.stt.use === "groq" && config.stt.groq_key)? true : false
			let usingSelfHostedStt = (config && config.stt && config.stt.use === "self_hosted" && config.stt.self_hosted_url)? true : false
			let usingLocalStt = (config && config.stt && config.stt.use === "local" && config.stt.local_whisper_model)? true : false
			let usingStt = (usingOpenAiStt || usingSelfHostedStt || usingLocalStt || useGroqStt )
			
			
			let useOpenAi = (config && config.llm && config.llm.use === "openai" && config.llm.openai_key && config.llm.openai_url!=='https://api.groq.com/openai')? true : false
			let useGroq = (config && config.llm && config.llm.use === "openai" && config.llm.openai_key && config.llm.openai_model && config.llm.openai_url==='https://api.groq.com/openai')? true : false
			let useSelfHosted = (config && config.llm && config.llm.use === "self_hosted" && config.llm.self_hosted_url)? true : false
			let useLlm = useOpenAi || useSelfHosted || useGroq
			let openAiBillable = useOpenAi || usingOpenAiTts || usingOpenAiStt
			//console.log(openAiBillable, useOpenAi,  usingOpenAiTts,  usingOpenAiStt)
			return {useGroq, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, useOpenAi, useSelfHosted, useLlm, openAiBillable}
		},
		uniquifyArray: function(a) {
			if (Array.isArray(a)) {
				var index = {}
				a.forEach(function(value) {
					index[value] = true 
				})
				return Object.keys(index)
			} else {
				return []
			}
		},
		
		renderPrompt: function(format, systemMessage, chatHistory, modelConfig, addGenerationPrompt = false) {
				//console.log('REMDER [RP',format, systemMessage, chatHistory, modelConfig)
			function renderOutputTypeComment(modelConfig) {
				if (modelConfig && modelConfig.outputType) {
					if (modelConfig.outputType === 'JavaScript' || modelConfig.outputType === 'Python') {
						return "\nRespond as a block of "+modelConfig.outputType+" code, strictly "+modelConfig.outputType+" code with no comments or explanations and no other format"
					} else {
						return "\nRespond using "+modelConfig.outputType+" notation, strictly "+modelConfig.outputType+" and no other format"
					}
				} else {
					return ''
				}
			}
			
			function capitalize(string) {
			  return string.charAt(0).toUpperCase() + string.slice(1);
			}
			let ch = JSON.parse(JSON.stringify(chatHistory))
			
			let outputTypeComment = renderOutputTypeComment(modelConfig)
			
			switch(format) {
				case 'openai':
					let ch = JSON.parse(JSON.stringify(chatHistory))
					ch.unshift({role:"system", content:systemMessage ? systemMessage + outputTypeComment : ''})
					return JSON.stringify(ch)
				
				// https://huggingface.co/NousResearch/Nous-Hermes-2-Mistral-7B-DPO
				//<|im_start|>system
				//You are "Hermes 2", a conscious<|im_end|>
				//<|im_start|>user
				//Hello, who are you?<|im_end|>
				//<|im_start|>assistant
				//Hi there! My name<|im_end|>
				case 'nous-hermes-2-mistral':
					return "<|im_start|>system\n"
					+ (systemMessage ? systemMessage + outputTypeComment : '') + "<|im_end|>"
					+ chatHistory.map(function(chatItem) {
						return "<|im_start|>" + chatItem.role + "\n" + chatItem.content  + "<|im_end|>"
					}).join("\n")
					//  tag empty assistant to prompt text generation
					+ (addGenerationPrompt ? "\n<|im_start|>assistant\n" : "")
					
				//https://huggingface.co/pankajmathur/orca_mini_3b
				//prompt = f"### System:\n{system}\n\n### User:\n{instruction}\n\n### Input:\n{input}\n\n### Response:\n"
				case 'orca-mini-3':
					return "### System:\n" + (systemMessage ? systemMessage + outputTypeComment : '') + "\n" 
					+ chatHistory.map(function(chatItem) {
						return chatItem.role === 'user' ? "\n### User:\n"+chatItem.content+"\n" : "\n### Response:\n"+chatItem.content+"\n"
					})
					+ (addGenerationPrompt ? "\n### Response:\n" : "")
					
				//// {system prompt}
				////### Human: your prompt here
				////### Assistant:
				//case 'vicuna':
					//return systemMessage 
					//+ '\n'	
					//+ chatHistory.map(function(chatItem) {
						//return (chatItem.role === 'user' ? 'Human': 'Assistant') + ": " + chatItem.content 
					//}).join("\n")
					//+ (addGenerationPrompt ? "\nAssistant:" : "")
					
				//// {system prompt}
				////Human: {Human things}
				////Assistant: {{Response}}
				//case 'claude_legacy_text':
					//return systemMessage 
					//+ '\n'	
					//+ chatHistory.map(function(chatItem) {
						//return (chatItem.role === 'user' ? 'Human': 'Assistant') + ": " + chatItem.content 
					//}).join("\n")
					//+ (addGenerationPrompt ? "\nAssistant:" : "")
				
				////Human: Human things
				////Assistant: {{Response}}
				//case 'claude':
					//ch.unshift({"role":"system", content:systemMessage})
					//return JSON.stringify(ch)
				
				//// system: you are a friendly assistant
				//// user: where is paris
				//// assistant: paris is in france
				//// user: how many people
				//// assistant: 
				//case 'plain':
					//return chatHistory.map(function(chatItem) {
						//return chatItem.role + ": " + chatItem.content 
					//}).join("\n")
					////  tag empty assistant to prompt text generation
					//+ (addGenerationPrompt ? "\nassistant:" : "")
				
				////"You are OrcaPlaty, an LLM trained by Alignment Lab AI and garage-bAInd. Write out your thinking step by step before coming to a conclusion to be sure you get the right answer! User: Hello there<|end_of_turn|>Assistant: Hi, nice to meet you.<|end_of_turn|>User: What's new?<|end_of_turn|>Assistant: "
				
				//// orca-mini-3  - https://huggingface.co/pankajmathur/orca_mini_3b
				////prompt = f"### System:\n{system}\n\n### User:\n{instruction}\n\n### Input:\n{input}\n\n### Response:\n"
				//case 'orca':
					//// system message collated
					//return systemMessage 
					//// conversation	
					//+ chatHistory.map(function(chatItem) {
							//return capitalize(chatItem.role) + ": " + chatItem.content 
					//}).join("<|end_of_turn|>\n")
					//+ (addGenerationPrompt ? "\nAssistant:" : "")	
						
				
				//case 'gemini': 
				
				////### Instruction: {prompt}
				////
				////### Response:
				//case 'alpaca':
					
					
				
				//case 'llaama':
				////<<SYS>>
				////You're are a helpful Assistant, and you only response to the "Assistant"
				////Remember, maintain a natural tone. Be precise, concise, and casual. Keep it short\n
				////<</SYS>>
				////{conversation_history}\n\n
				////[INST]
				////User:{user_message}
				////[/INST]\n
				////Assistant:
					//return ```
					//<s>[INST]SYS
					  //``` +chatHistory
						//.filter(function(val) {return (val.role === 'system') })
						//.map(function(v) {return v.content}).join("/n") 
						//+ "/n"+ ```  
					//<</SYS>>  
					  //user_prompt_1 [/INST]  
					  //assistant_response_1 </s>  
					//<s>[INST] user_prompt_1 [/INST]
					//```
			}
		}
		
	}
}

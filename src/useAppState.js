import {React, useState, useEffect, useRef} from 'react'

import useUtils from './useUtils'
import useIcons from './useIcons'
import isOnline from 'is-online';
export default function useAppState(props) {

	const {scrollTo, generateRandomId} = useUtils()
	const utils = useUtils()
	let abortController = useRef(new AbortController())
	const [accordionSelectedKey, setAccordionSelectedKey] = useState(0)
	
	const utteranceQueue = useRef([])
	
	function setUtteranceQueue(history) {
		utteranceQueue.current = history
	}
	const [categoryFilter, setCategoryFilterInner] = useState([])
	function setCategoryFilter(c) {
		setCategoryFilterInner(c)
		localStorage.setItem("voice2llm_category_filter",JSON.stringify(c))
		props.doSave()
	}
	
	const isOnlineRef = useRef(false)
	let onlineIntervalRef = useRef()
	useEffect(function() {
		onlineIntervalRef.current = setInterval(function() {
			isOnline().then(function(res) {isOnlineRef.current=res; forceRefresh()})
		},10000)
		isOnline().then(function(res) {isOnlineRef.current=res; forceRefresh()})
		// return function() {
		// 	clearInterval(onlineIntervalRef.current)
		// }
	},[])

	const [autoStartMicrophone, setAutoStartMicrophone] = useState(false)
	const [autoStopMicrophone, setAutoStopMicrophone] = useState(false)
	
	
	const [mergeData, setMergeData] = useState(false)
	const [isWaiting, setIsWaiting] = useState(false)
	const [categories, setCategoriesInner] = useState({'fred':3,'mike':9})
	function setCategories(c) {
		setCategoriesInner(c)
		localStorage.setItem("voice2llm_categories",JSON.stringify(c))
		props.doSave()
	}
	
	
	const [userMessage, setUserMessageInner] = useState('')
	const userMessageRef = useRef('')
	function setUserMessage(v) {
		userMessageRef.current = v
		setUserMessageInner(v)
	}
	const [isReady, setIsReady] = useState(false)
	const [isSpeaking, setIsSpeaking] = useState(false)
	const [config, setConfigInner] = useState()
	function setConfig(v) {
		// console.log("appstate set config",v)
		setConfigInner(v)
		localStorage.setItem("voice2llm_config",JSON.stringify(v))
		props.doSave()
	}

	const [exchangeRate, setExchangeRate] = useState(0)
	function updateExchangeRate(access_token) {
		// console.log('rate update',access_token)	
		if (access_token) {
			fetch(import.meta.env.VITE_API_URL + '/rate', {
				method: 'GET',
				headers: {
					'authorization': 'Bearer '+access_token
				}
			}).then(function(response) {
				// console.log("bill respon l", response)
				if (!response.ok) {
					throw new Error('Failed to load rate');
				}
				response.text().then(function(data) {
					// console.log("rate respon DATA", data)
					if (parseFloat(data.replace('"', '')) > 0) {
						// console.log("SETrate respon DATA", parseFloat(data.replace('"', '')))
						setExchangeRate(parseFloat(data.replace('"', '')))
					} else {
						setExchangeRate(0)
					}
				})
			})
		} else {
			setExchangeRate(0)
		}
	}
	useEffect(function() {
		if (props.token && props.token.access_token ) updateExchangeRate(props.token.access_token)
	},[props.token && props.token.access_token])
	
	const [creditBalance, setCreditBalance] = useState(0)
	function updateCreditBalance(access_token) {
		console.log('balance update',access_token)
		
		if (access_token) {
			fetch(import.meta.env.VITE_API_URL + '/balance', {
				method: 'GET',
				headers: {
					'authorization': 'Bearer '+access_token
				}
			}).then(function(response) {
				// console.log("bill respon l", response)
				if (!response.ok) {
					throw new Error('Failed to load balance');
				}
				response.text().then(function(data) {
					// console.log("bill respon DATA", data)
					if (parseFloat(data) > 0) {
						setCreditBalance(parseFloat(data))
					} else {
						setCreditBalance(0)
					}
				})
			})
		} else {
			setCreditBalance(0)
		}
	}

	const [availableModels, setAvailableModels]  = useState([])
	useEffect(function() {
		// console.log("appstate load models", creditBalance, config, props.token)
		if (configRef.current) {
			fetch(import.meta.env.VITE_API_URL + '/pricing', {
				method: 'GET',
				headers: {
					'authorization': 'Bearer '+ (props.token && props.token.access_token ? props.token.access_token : '')
				}
			}).then(function(response) {
				// console.log("bill respon l", response)
				if (!response.ok) {
					throw new Error('Failed to load pricing');
				}
				response.json().then(function(data) {
					// console.log("bill respon DATA", data)
					if (data && data.llm) {
						let availableModels = data.llm.map(function(model) {
							model.id = utils.generateRandomId()
							return model
						})
						let allowedProviders = []
							
						if (props.token && props.token.access_token ) {
							if (creditBalance > 0 && props.token && props.token.access_token) {
								// all the models OK
								allowedProviders = ['openai','groqcloud','togetherai','deepinfra']
							} else {
								if (configRef.current && configRef.current.llm && configRef.current.llm.openai_key) {
									allowedProviders.push('openai')
								}
								if (configRef.current && configRef.current.llm && configRef.current.llm.groqcloud_key) {
									allowedProviders.push('groqcloud')
								}
							}
						} else {
							allowedProviders.push('groqcloud')
						}
						
						// console.log("providers", allowedProviders)
						let models = availableModels.filter(function(model) {
							// console.log(model.provider, allowedProviders)
							if (model.provider && allowedProviders.indexOf(model.provider) !== -1) {
								return true
							}
							return false
						})
						if (configRef.current && configRef.current.llm && configRef.current.llm.self_hosted_url) {
							if (configRef.current && configRef.current.llm && configRef.current.llm.self_hosted_models) {
								configRef.current.llm.self_hosted_models.split(",").forEach(function(m) {
									models.push({provider:'selfhosted', model: m, price_in: 0, price_out:0})
								})
							} else {
								models.push({provider:'selfhosted', model: 'selfhosted', price_in: 0, price_out:0})
							}
						}
						setAvailableModels(models)
						// console.log("LOADED MODELS",models, allowedProviders)
					}
				})
			})
		}

	},[config && config.llm && config.llm.self_hosted_models ? config.llm.self_hosted_models : '',config && config.llm && config.llm.self_hosted_key ? config.llm.self_hosted_key : '',config && config.llm && config.llm.openai_key ? config.llm.openai_key : '', config && config.llm && config.llm.groqcloud_key ? config.llm.groqcloud_key : '', creditBalance, props.token && props.token.access_token ? props.token.access_token  : '' ])
	
	const [llmEnabled, setLlmEnabled] = useState(true)
	const configRef = useRef({})
	const lastLlmTrigger = useRef('')
	const icons = useIcons()
	
	// load config from localStorage
	useEffect(function() {
		if (!config) { 
			try {
				let c = JSON.parse(localStorage.getItem("voice2llm_config"))
				setConfig(c)
				forceRefresh()
			} catch (e) {
				setConfig({llm:{},tts:{},stt:{}})
				forceRefresh()
			}
			try {
				let c = JSON.parse(localStorage.getItem("voice2llm_category_filter"))
				setCategoryFilter(c)
				forceRefresh()
			} catch (e) {
				setCategoryFilter(['featured'])
				forceRefresh()
			}
		}
		// FOR NOW DEFAULT GROQ AND DEV SERVER FOR SPEECH
		//if (!config || !config.llm) setConfig({
		  //"llm": {
			//"use": "openai",
			//"openai_key": "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",
			//"openai_hosted_url": "https://api.groq.com/openai",
			//"openai_model": "llama3-70b-8192"
		  //},
		  //"stt": {
			//"self_hosted_url": "https://peppertrees.asuscomm.com:444/asr",
			//"use": "self_hosted",
		  //},
		  //"tts": {
			//"self_hosted_url": "https://peppertrees.asuscomm.com:446",
			//"use": "self_hosted"
		  //}
		//})
		//try {
			//let c = JSON.parse(localStorage.getItem("voice2llm_categories"))
			//setCategories(c)
			//forceRefresh()
		//} catch (e) {
			//setCategories({})
			//forceRefresh()
		//}
		
	},[])
	
	// trigger wizard if no llm is configured
	function hasRequiredConfig() {
		return true
		//const {useLlm} = utils.summariseConfig(config)
		//console.log("has req conf", useLlm)
		return config && config.llm && config.llm.use
	}
	
	function startWaiting() {
		setIsWaiting(true)
	}
	
	function stopWaiting() {
		setIsWaiting(false)
	}
	const [refreshHash, setRefreshHash] = useState(new Date().getTime())
	function forceRefresh() {
		setRefreshHash(new Date().getTime())
	}

	return {isOnlineRef, exchangeRate, setExchangeRate,updateExchangeRate, abortController, creditBalance, updateCreditBalance, availableModels, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone,autoStopMicrophone, setAutoStopMicrophone, llmEnabled, setLlmEnabled, icons, configRef, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking,  isWaiting, startWaiting, stopWaiting,  userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, categories, setCategories, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter}
}

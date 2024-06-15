import {React, useState, useEffect, useRef} from 'react'

import useUtils from './useUtils'
import useIcons from './useIcons'

export default function useAppState(props) {

	const {scrollTo, generateRandomId} = useUtils()
	const utils = useUtils()
	
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
		//console.log("appstate set config",v)
		setConfigInner(v)
		localStorage.setItem("voice2llm_config",JSON.stringify(v))
		props.doSave()
	}

	const [availableModels, setAvailableModels]  = useState([])
	useEffect(function() {
		console.log("appstate load")
		fetch(import.meta.env.VITE_API_URL + '/pricing', {
			method: 'GET'
		}).then(function(response) {
			console.log("bill respon l", response)
			if (!response.ok) {
				throw new Error('Failed to load pricing');
			}
			response.json().then(function(data) {
				console.log("bill respon DATA", data)
				if (data && data.llm) {
					console.log("LOADED MODELS",data)
					setAvailableModels(data)
				}
			})
		})
	},[])
	
	const [llmEnabled, setLlmEnabled] = useState(false)
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

	return { availableModels, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone,autoStopMicrophone, setAutoStopMicrophone, llmEnabled, setLlmEnabled, icons, configRef, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking,  isWaiting, startWaiting, stopWaiting,  userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, categories, setCategories, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter}
}

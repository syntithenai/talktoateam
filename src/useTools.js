import {useState, useEffect} from 'react'
import tools from "./agent/tools"

export default function useTools({runtimes, config, token, creditBalance, abortController, files, fileManager, onError, forceRefresh}) {
	// console.log("USETOOLS",runtimes, config, token, creditBalance, abortController)
	window.tools = tools({runtimes, config, token, creditBalance, abortController, files, fileManager, onError})
	
	let defaultTools = [
		{name:'websearch', description:'Search the web for an answer to a query', arguments: [{name:'query', type:'string', description:"the topic to query"}], required:['query'], code_type:'local', code:'return window.tools.websearch(query)', no_delete: true}
	]
	const [userTools, setUserToolsInner] = useState([]) //defaultTools)
	function setUserTools(v) {
		console.log("SET USER TOOLS",v)
		if (v && v.length > 0) {
			localStorage.setItem("voice2llm_user_tools", JSON.stringify(v))
			setUserToolsInner(v)
		} else {
			localStorage.setItem("voice2llm_user_tools", JSON.stringify(defaultTools))
			setUserToolsInner(defaultTools)
		}
		forceRefresh()
	}

	useEffect(function() {
		try {
			console.log("LOAD USER TOOLS",localStorage.getItem("voice2llm_user_tools"))
			let json = JSON.parse(localStorage.getItem("voice2llm_user_tools"))
			console.log("LOADed USER TOOLS",json)
			setUserTools(json ? json : defaultTools)
		} catch (e) {
			console.log("LOAD USER TOOLS set def")
			setUserTools(defaultTools)
		}
	},[])
	return {tools: window.tools, userTools, setUserTools}
}

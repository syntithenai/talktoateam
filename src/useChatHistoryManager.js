import {useState, useRef, useEffect} from 'react'

export default function useChatHistoryManager({utils,forceRefresh, doSave, currentRole }) {
	
	const [chatHistoryId, setChatHistoryIdInner] = useState('') // =  useRef(utils.generateRandomId())
	const chatHistoryIdRef = useRef('')
	function setChatHistoryId(id) {
		chatHistoryIdRef.current = id
		setChatHistoryIdInner(id)
		localStorage.setItem('voice2llm_chat_history_id',id)
		doSave()
	}
	
	//const chatHistory = useRef([])
	
	//function setChatHistory(history) {
		//chatHistory.current = history
		//// also to chat Histories
		//if (!chatHistoryId.current) setChatHistoryId(utils.generateRandomId())
		//chatHistories[chatHistoryId.current] = {role: currentRole, history}
		//setChatHistories(chatHistories)
		//doSave()
		//forceRefresh()
	//}

	const [chatHistories, setChatHistoriesInner] = useState({})
	const chatHistoriesRef = useRef({})
	function setChatHistories(h) {
		//console.log("save chat histories",h)
		chatHistoriesRef.current = h
		setChatHistoriesInner(h)
		localStorage.setItem('voice2llm_chat_histories',JSON.stringify(h))
		doSave()
	}
	
	function currentChatHistory() {
		//console.log('cch', chatHistoriesRef.current[chatHistoryIdRef.current])
		if (chatHistoryIdRef.current && chatHistoriesRef.current) return chatHistoriesRef.current[chatHistoryIdRef.current]
	}
	
	function addUserMessage(d) {
		//console.log('add user message',d)
		let c = currentChatHistory()
		c = c ? c : []
		if (!chatHistoriesRef.current) chatHistoriesRef.current = {}
		if (!chatHistoryIdRef.current) setChatHistoryId(utils.generateRandomId())
		if (!chatHistoriesRef.current[chatHistoryIdRef.current]) {
			chatHistoriesRef.current[chatHistoryIdRef.current] = c
		}
		if (d) {
			c.push({role:'user', content: d})
			chatHistoriesRef.current[chatHistoryIdRef.current] = c
		}
		setChatHistories(chatHistoriesRef.current)
		forceRefresh()
	}
	
	function setMessageContent(index,message, log) {
		//console.log('set message content',index,message, log)
		if (message && chatHistoryIdRef.current && chatHistoriesRef.current && chatHistoriesRef.current[chatHistoryIdRef.current] && chatHistoriesRef.current[chatHistoryIdRef.current][index]) {
			chatHistoriesRef.current[chatHistoryIdRef.current][index].content = message
			chatHistoriesRef.current[chatHistoryIdRef.current][index].log = log
			setChatHistories(chatHistoriesRef.current)
			forceRefresh()
		}
	}
	
	function addAssistantMessage(d) {
		//console.log('add asst message',d)
		let c = currentChatHistory()
		c = c ? c : []
		if (!chatHistoriesRef.current) chatHistoriesRef.current = {}
		if (!chatHistoryId) setChatHistoryId(utils.generateRandomId())
		if (!chatHistoriesRef.current[chatHistoryIdRef.current]) {
			chatHistoriesRef.current[chatHistoryIdRef.current] = c
		}
		c.push({role:'assistant', content: d})
		chatHistoriesRef.current[chatHistoryIdRef.current] = c
		setChatHistories(chatHistoriesRef.current)
		forceRefresh()
	}
	
	
	function getLastAssistantChatIndex(type) {
		let c = currentChatHistory()
		//console.log('get last message index',type,c)
		if (c) {
			let r = JSON.parse(JSON.stringify(c)).reverse()
			for (let entry in r) {
				//console.log(entry,r[entry])
				if (entry && r[entry] && r[entry].role === type) {
					//console.log('get last message index FOUND',r.length - entry - 1)
					return r.length - entry - 1
				}
			}
		}
		//console.log('get last message index NOT FOUND')
		return -1
	}
	
	function setLastAssistantMessage(d, usage) {
		//console.log("setlast",d,usage)
		let i = getLastAssistantChatIndex('assistant')
		//console.log('set last asst msg',chatHistoryIdRef.current,i,chatHistoriesRef.current,currentChatHistory())
		if (i !== -1) {
			setMessageContent(i,d, usage)
		} else {
			addAssistantMessage(d)
		}
	}
	
	function setLastUserMessage(d) {
		let i = getLastAssistantChatIndex('user')
		//console.log('set last user msg',i)
		if (i !== -1) {
			setMessageContent(i,d)
		} else {
			addUserMessage(d)
		}
	}
	
	function getLastUserMessage() {
		let i = getLastAssistantChatIndex('user')
		let c = currentChatHistory()
		//console.log('get last asst msg',i,c)
		if (c && i !== -1 && c[i]) {
			//console.log('get last asst msg GOT',c[i].content)
			return c[i].content
		}
	}
	
	function getLastAssistantMessage() {
		let i = getLastAssistantChatIndex('assistant')
		let c = currentChatHistory()
		//console.log('get last asst msg',i,c)
		if (c && i !== -1 && c[i]) {
			//console.log('get last asst msg GOT',c[i].content)
			return c[i].content
		}
	}
	
	function newChatHistory() {
		let c = currentChatHistory()
		//console.log('NEW',c, chatHistoryId, chatHistories)
		//if (!c || (c && c.length > 0)) {
		setChatHistoryId('') //utils.generateRandomId())
		//chatHistories[chatHistoryId] = []
		//setChatHistories(chatHistories)
		//}
	}
	
	
	function revertChatHistory(index = null) {
		//console.log('revert',index)
		let c = currentChatHistory()
		let m = ''
		if (c) {
			//console.log('revert h',c)
			let count = 0
			let startLength = c.length
			while (c.length > 0 && (startLength - count) > index) {
				//console.log('revert l',startLength, count, JSON.parse(JSON.stringify(c)))
				let lastMessageItem = c.pop()
				count += 1
				if (lastMessageItem.role ==='assistant') {
					let lastUserMessageItem = c.pop()
					count += 1
					m = lastUserMessageItem.content
				} else if (lastMessageItem.role ==='user') {
					m = lastMessageItem.content
				}
			}
		}
		return m
	}
	
	function deleteChatHistory(k) {
		delete chatHistoriesRef.current[k]
		setChatHistories(chatHistoriesRef.current)
		forceRefresh()
	}
	
	function duplicateChatHistory(k) {
		//console.log("DUP")
		if (chatHistoriesRef.current[k]) {
			let newHistory = JSON.parse(JSON.stringify(chatHistoriesRef.current[k]))
			chatHistoriesRef.current[utils.generateRandomId()] = newHistory
			setChatHistories(chatHistoriesRef.current)
			forceRefresh()
		}
	}
	
	// load from localStorage
	useEffect(function() {
		//if (!chatHistories) {
			try {
				let id = localStorage.getItem('voice2llm_chat_history_id')
				let c = JSON.parse(localStorage.getItem("voice2llm_chat_histories"))
				//console.log("loaded chat histories",c)
				setChatHistories(c)
				if (id) {
					setChatHistoryId(id)
					//setChatHistory(chatHistories[id])
					// TODO LOAD ROLE
				}
				forceRefresh()
			} catch (e) {
				setChatHistories({})
				forceRefresh()
			}
		//}
	},[])
	
	
	
	return {chatHistoriesRef, chatHistoryId, chatHistoryIdRef, setChatHistoryId,chatHistories, setChatHistories, currentChatHistory,newChatHistory, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage,getLastUserMessage,  revertChatHistory, deleteChatHistory, duplicateChatHistory, getLastAssistantChatIndex, getLastAssistantMessage}
}

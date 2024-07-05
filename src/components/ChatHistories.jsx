import {React, useState, useRef} from 'react'
import {Button, Modal, ListGroup, Form, Tabs} from 'react-bootstrap'

import useIcons from '../useIcons'

import {Link  } from 'react-router-dom'

import ConfirmDialog from './ConfirmDialog'
import { arrayBufferToBase64 } from '@ricky0123/vad-web/dist/_common/utils'

export default function ChatHistories({ allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logou, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
	const hiddenInput = useRef()
	const [refresh,setRefresh] = useState()
	const [filter, setFilter] = useState('')
	const [showConfirm, setShowConfirm] = useState(false)
	const toDelete = useRef()
	
	function loadChatHistory(k) {
		setChatHistoryId(k)
	}
	const newChatId = currentChatHistory() && currentChatHistory().length > 0 ?  utils.generateRandomId() : null
	//console.log("CHHH",chatHistoryId, chatHistoriesRef.current, chatHistories)
	function getFirstUserMessage(chatHistory) {
		let found = null
		if (Array.isArray(chatHistory)) {
			for (let c in chatHistory) {
				if (chatHistory[c] && chatHistory[c].role === "user" && chatHistory[c].content) {
					found = chatHistory[c].content.split(' ').slice(0,20).join(' ')
					break;
				}
			}
		}
		return found
		//chatHistory && chatHistory[0] && chatHistory[0].content && chatHistory[0].content.split ? chatHistory[0].content.split(' ').slice(0,20).join(' ') : ''
	}			
				
	//let chatHistory = chatHistories[chatHistoryId]
	
	return (<div style={{paddingLeft:'0.5em'}}>
	
	<ConfirmDialog forceShow={showConfirm}  setForceShow={setShowConfirm} title="Delete Chat History" message="Do you really want to delete this chat history ?" onCancel={function() {setShowConfirm(false)}} onConfirm={function() {deleteChatHistory(toDelete.current); setShowConfirm(false)}}  />
	
	<Button style={{float:'right',marginTop:'0.4em',marginRight:'0.2em'}} variant="danger" onClick={function() {if (window.confirm("Really delete all chat history?")) {setChatHistories({}) }}} >{icons.bin}</Button> 
	<Link  to={"/chat/"+newChatId} style={{float:'right',marginTop:'0.2em',marginRight:'2em'}}><Button onClick={stopLanguageModels} disabled={!newChatId} style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}}  variant="primary"  >{icons["newchat"]}</Button></Link>
	<h3>Chat History</h3>
	<br/>
	<Form.Control style={{marginBottom:'1em'}}
				type="text"
				value={filter}
				placeholder={"Search"}
				onChange={(e) => {setFilter(e.target.value)}}
				/>
	<ListGroup>
				  {chatHistoriesRef.current && Object.keys(chatHistoriesRef.current).filter(function(chatHistoryKey) {
						let chatHistory = chatHistoriesRef.current[chatHistoryKey]
						if (!filter) {
							return true && chatHistory && chatHistory.length > 0
						} else if (filter && chatHistory && chatHistory[0] && chatHistory[0].content && chatHistory[0].content.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
							return true && chatHistory && chatHistory.length > 0
						} else {
							return false
						}
					  }).map(function(chatHistoryKey, hKey) {
						  let chatHistory = chatHistoriesRef.current[chatHistoryKey]
						 return <ListGroup.Item key={hKey} >
						 <Link to={"/chat/"+chatHistoryKey}  ><Button variant="outline-primary" style={{textAlign:'left',width:'70%'}}  >{getFirstUserMessage(chatHistory)}</Button></Link>
						 <Button style={{float:'right'}} variant="danger" onClick={function() {toDelete.current = chatHistoryKey; setShowConfirm(true)}} >{icons.bin}</Button> 
						 <Button style={{float:'right', marginRight:'0.5em'}} variant="warning" onClick={function() {duplicateChatHistory(chatHistoryKey)}} >{icons.filecopy}</Button></ListGroup.Item> 
					  })}
			</ListGroup>
	</div>)
}

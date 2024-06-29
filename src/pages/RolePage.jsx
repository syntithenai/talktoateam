import {React, useState, useEffect, useRef} from 'react'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, ListGroup, ButtonGroup, Col, Row} from 'react-bootstrap'

import useUtils from '../useUtils'
import TextareaAutosize from 'react-textarea-autosize';
//import SystemMessageEditorModal from '../components/SystemMessageEditorModal'
import useSystemMessageManager from '../useSystemMessageManager'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {Link } from 'react-router-dom'
import RoleForm from '../components/RoleForm'
export default function RolePage(props) {

	const {isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels} = props
	let params = useParams()
	//console.log(params)
	
	let navigate = useNavigate()
	useEffect(function() {
		//console.log('paramchange',params.id, roles,currentRole)
		let useRoles = roles ? roles : {}
		if (!params.id) {
			//console.log('paramchange no id')
			//const lastId = localStorage.getItem("voice2llm_last_role")
			 //lastId ? lastId : 
			 
			const id =utils.generateRandomId()
			setCurrentRole(id)
			let useChatHistoryRoles = chatHistoryRoles
			if (!useChatHistoryRoles) useChatHistoryRoles = {} 
			useChatHistoryRoles[chatHistoryId] = id
			setChatHistoryRoles(useChatHistoryRoles)
			//console.log('paramchange new id',lastId, id)
			navigate("/role/"+id)
		} else if (params.id) {
			console.log('paramchange have id',params.id,params.category,useRoles,useRoles[params.id])
			setCurrentRole(params.id)
			if (params.category) useRoles[params.id].category = [params.category]
			localStorage.setItem("voice2llm_last_role", params.id)
			if (!useRoles.hasOwnProperty(params.id)) {
				console.log('paramchange crate id',params.id,params.category)
				useRoles[params.id] = {id: params.id}
				if (params.category) useRoles[params.id].category = [params.category]
				setRoles(useRoles)
			}
			setRoles(useRoles)
		}
	},[params.id])
	
	function save(field, value) {
		// console.log('save', field, value)
		if (roles && params.id && field) {
			if (!roles.hasOwnProperty(params.id))  {
				roles[params.id] = {}
			}
			roles[params.id][field] = value
			setRoles(roles)
			// setRefresh(utils.generateRandomId())
			forceRefresh()
		}
	}
	const {openAiBillable} = utils.summariseConfig(config)
	return	<div className="App" id={refreshHash} >
		{<>
			
              <Menu {...{isOnlineRef,bodyStyle, creditBalance, refreshHash, token, logout, user,login, utils, usingStt, usingTts, isSpeaking, isMuted, mute, stopAllPlaying, icons, unmute, stopPlaying, lastLlmTrigger, config, aiUsage, forceRefresh, autoStartMicrophone, setAutoStartMicrophone, isPlaying, allowRestart, isWaiting, startWaiting, stopWaiting, onCancel, isReady, setIsReady, onTranscript, onPartialTranscript, setUserMessage}} />
              
			
			<div id="body" style={bodyStyle}  >
				<Button style={{float:'left', marginRight:'0.5em'}} onClick={function(e) {
					save("isStarred", (roles && currentRole && roles[currentRole] && roles[currentRole].isStarred) ? false : true)
				}} variant={(roles && currentRole && roles[currentRole] && roles[currentRole].isStarred) ? "warning"  : 'disabled'} >{icons.star}</Button>
				<h3>Edit Persona {roles && currentRole && roles[currentRole] && roles[currentRole].name ? " - " + roles[currentRole].name : ''}</h3>
				<RoleForm {...props} roleId={params.id} rolesJSON={JSON.stringify(roles)}  />
			</div>
			
			<Footer icons={icons} />
		</>}
	</div>
}

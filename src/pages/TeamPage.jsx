import {React, useState, useEffect, useRef} from 'react'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, ListGroup, ButtonGroup, Col, Row} from 'react-bootstrap'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
import useUtils from '../useUtils'
import TextareaAutosize from 'react-textarea-autosize';
//import SystemMessageEditorModal from '../components/SystemMessageEditorModal'
import useSystemMessageManager from '../useSystemMessageManager'
//import LoadTeamModal from '../components/LoadTeamModal'

import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {Link } from 'react-router-dom'
import TeamForm from '../components/TeamForm'

export default function TeamPage(props) {

	//const {chatHistoryTeams, setChatHistoryTeams, user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, category, setCategory,exportTeams,importTeams,setSystemMessage,systemMessage,setSystemConfig, systemConfig, init, saveTeam, loadTeam, teams, setTeams, currentTeam, setCurrentTeam, newTeam, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, chatHistories, setChatHistories, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, chatHistory, setChatHistory, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, playSpeech, chatHistoryId, categories, setCategories} = props
	const { isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels} = props
	const params = useParams()
	//console.log(params)
	
	let navigate = useNavigate()
	useEffect(function() {
		//console.log('paramchange',params.id, teams,currentTeam)
		let useTeams = teams ? teams : {}
		if (!params.id) {
			const id = utils.generateRandomId()
			setCurrentTeam(id)
			let useChatHistoryTeams = chatHistoryTeams
			if (!useChatHistoryTeams) useChatHistoryTeams = {} 
			useChatHistoryTeams[chatHistoryId] = id
			setChatHistoryTeams(useChatHistoryTeams)
			//console.log('paramchange new id',lastId, id)
			navigate("/team/"+id)
		} else if (params.id) {
			//console.log('paramchange have id',params.id, useTeams[params.id])
			setCurrentTeam(params.id)
			if (params.category) useTeams[params.id].category = [params.category]
			
			//localStorage.setItem("voice2llm_last_team", params.id)
			if (!useTeams.hasOwnProperty(params.id)) {
				//console.log('paramchange create',params.id)
				useTeams[params.id] = {id: params.id}
				if (params.category) useTeams[params.id].category = [params.category]
				setTeams(useTeams)
			}
		}
	},[params.id])
	
	
	function save(field, value) {
		console.log('save',field, value, params.id, teams)
		if (teams && params.id && field) {
			if (!teams.hasOwnProperty(params.id))  {
				teams[params.id] = {type:'linear'}
			}
			teams[params.id][field] = value
			setTeams(teams)
			// setRefresh(utils.generateRandomId())
			forceRefresh()
		}
	}
	
	const {openAiBillable} = utils.summariseConfig(config)
	return	<div className="App" id={refreshHash} >
		{<>
			
              <Menu {...{isOnlineRef, allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}} />
              
			
			<div id="body" style={bodyStyle}  >
				<Button style={{float:'left', marginRight:'0.5em'}} onClick={function(e) {
					save("isStarred", (teams && currentTeam && teams[currentTeam] && teams[currentTeam].isStarred) ? false : true)
				}} variant={(teams && currentTeam && teams[currentTeam] && teams[currentTeam].isStarred) ? "warning"  : 'disabled'} >{icons.star}</Button>
				<h3>Edit Team {teams && currentTeam && teams[currentTeam] && teams[currentTeam].name ? " - " + teams[currentTeam].name : ''}</h3>
				<TeamForm config={config} teamId={params.id} teamsJSON={JSON.stringify(teams)} teams={teams} setTeams={setTeams} icons={icons} forceRefresh={forceRefresh} utils={utils} playSpeech={playSpeech} categories={categories} setCategories={setCategories} roles={roles} />
			</div>
			
			
		</>}
		<Footer icons={icons} />
	</div>
}

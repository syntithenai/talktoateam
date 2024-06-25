import {React, useState, useEffect, useRef} from 'react'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, ListGroup, ButtonGroup, Col, Row} from 'react-bootstrap'

import useUtils from '../useUtils'
import TextareaAutosize from 'react-textarea-autosize';
//import SystemMessageEditorModal from '../components/SystemMessageEditorModal'
import useSystemMessageManager from '../useSystemMessageManager'

import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {Link } from 'react-router-dom'
import ChatHistoriesModal from '../components/ChatHistoriesModal'
import ChatHistories from '../components/ChatHistories'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
export default function ChatHistoryPage(props) {

	const { isOnlineRef,allowRestart, onCancel, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels} = props
	
	function onTranscript(t) {
		//console.log("T",t)
	}
	
	const {openAiBillable} = utils.summariseConfig(config)
	useEffect(function() {
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	},[])
	return	<div className="App" id={refreshHash} >
		{<>
			
              <Menu {...{isOnlineRef,bodyStyle, creditBalance, refreshHash, token, logout, user,login, utils, usingStt, usingTts, isSpeaking, isMuted, mute, stopAllPlaying, icons, unmute, stopPlaying, lastLlmTrigger, config, aiUsage, forceRefresh, autoStartMicrophone, setAutoStartMicrophone, isPlaying, allowRestart, isWaiting, startWaiting, stopWaiting, onCancel, isReady, setIsReady, onTranscript, onPartialTranscript, setUserMessage}} />
			<div id="body" style={bodyStyle}  >
				
				<Row style={{textAlign:'left', marginTop:'0.5em', marginBottom:'1.5em'}} ><Col><ChatHistories {...props} /></Col></Row>
			</div>
			
			
		</>}
		<Footer icons={icons} />
	</div>
}
//</Col><Col>
						//<Link to="/history"><Button style={{fontSize:'1.4em', height: '4em'}}>{icons.history} <br/>Chat History</Button></Link>
					

import logo from './logo.svg';
import './App.css';
import {React, useState, useEffect, useRef} from 'react'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, ListGroup, ButtonGroup} from 'react-bootstrap'

import useUtils from './useUtils'
import useAppState from './useAppState'
import TextareaAutosize from 'react-textarea-autosize';
import ConfigWizard from './components/ConfigWizard'
import ReactGA from "react-ga4";

import useLlm from './useLlm'
import useTeamLlm from './useTeamLlm'
import useGoogleLogin from './useGoogleLogin'
import useAudioPlayQueue from './useAudioPlayQueue'
import useChatHistoryManager from './useChatHistoryManager'
import useConfigManager from './useConfigManager'
import useOpenAiTts from './useOpenAiTts'
import useMeSpeakTts from './useMeSpeakTts'
import useWebSpeechTts from './useWebSpeechTts'
import useOpenAiUsageLogger from './useOpenAiUsageLogger'
import useSystemMessageManager from './useSystemMessageManager'
import usePollingGoogleDocument from './usePollingGoogleDocument'
import MergeWarningModal from './components/MergeWarningModal'
import useFileManager from './useFileManager'
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {HashRouter as  Router,Routes, Route, Link  } from 'react-router-dom'
import ChatHistoriesModal from './components/ChatHistoriesModal'
import ChatHistoryPage from './pages/ChatHistoryPage'
import ErrorWarningModal from './components/ErrorWarningModal'
import SettingsPage from './pages/SettingsPage'
import ChatPage from './pages/ChatPage'
import RoadMapPage from './pages/RoadMapPage';
import RolesPage from './pages/RolesPage'
import RolePage from './pages/RolePage'
import HelpPage from './pages/HelpPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import TeamPage from './pages/TeamPage'
import TokensPage from './pages/TokensPage'
import PricingPage from './pages/PricingPage'
import PaymentPage from './pages/PaymentPage'
import HomePage from './pages/HomePage'
import TransactionsPage from './pages/TransactionsPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import FilesPage from './pages/FilesPage'
import useTools from './useTools'
import useModelSelector from './useModelSelector'


function App({nlp}) {

	// when document is loaded from google because of change elsewhere
	function onMerge(d) {
		let lastId = localStorage.getItem("voice2llm_last_saved_id")
		if (lastId && d && d.id === lastId) {
			//console.log("MERGE skipped, last save from here")
		} else {
			//console.log("MERGE data", d)
			setMergeData(d)
		}
	}
	let bodyStyle = {zIndex:'3',position: 'relative', top: '5em', left: 0, width: '100%',  paddingTop:'0.2em',paddingLeft:'0.5em', height:'100%'}

	const utils = useUtils()
	var {user, token, login, logout, refresh,loadCurrentUser, loadUserImage, breakLoginToken} = useGoogleLogin({clientId:import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID, usePrompt: false, loginButtonId: 'google_login_button', scopes:['https://www.googleapis.com/auth/drive.file']})
	
	useEffect(function() {
		refresh()  // autologin
		ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
	},[])
	
	const [googleDocumentId, setGoogleDocumentId] = useState('')
     const {save, exportDocument, getDocument} = usePollingGoogleDocument({token, logout, refresh, pollingInterval: 10000, onMerge, pausePolling : function() {}, setGoogleDocumentId, googleDocumentId, googleFileName: 'Voice2Llm'})
	//  console.log("APP",getDocument)
  
	
	// save to google document
	function doSave() {
		if (token && token.access_token) {
			let id = localStorage.getItem("voice2llm_last_saved_id") ? localStorage.getItem("voice2llm_last_saved_id") : generateRandomId()
			localStorage.setItem("voice2llm_last_saved_id", id)
			let toSave = {id, currentRole,roles,chatHistoryId, chatHistories, chatHistoryRoles,chatHistoryTeams, currentTeam, config, logs: aiUsage.logs, categories, teams}
			// console.log("DOSAVE",id,toSave)
			save(JSON.stringify(toSave))
		}
	}
	
	const {scrollTo, generateRandomId} = useUtils()
	const {errorMessage, setErrorMessage, isOnlineRef, exchangeRate, setExchangeRate,updateExchangeRate,abortController, creditBalance, updateCreditBalance, availableModels ,utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger,  autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking,  isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, categories, setCategories, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter} = useAppState({doSave, token})
	let modelSelector = useModelSelector({configString: JSON.stringify(config), creditBalance, token, availableModels})

	const [isFileManagerWaiting, setIsFileManagerWaiting] = useState(false)
	const {files, fileManager} = useFileManager({isFileManagerWaiting, setIsFileManagerWaiting,creditBalance, config, storeName:'files', token, logout, allowMimeTypes : ['.txt','text/plain'], loadData : false, onError : function(e) {
		setErrorMessage(e);
		setIsFileManagerWaiting(false)
	}, forceRefresh})
	
	
	const {chatHistoriesRef, chatHistoryId,chatHistoryIdRef,  setChatHistoryId, chatHistories, setChatHistories, newChatHistory, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage,  currentChatHistory, revertChatHistory, deleteChatHistory, duplicateChatHistory, getLastAssistantChatIndex, getLastAssistantMessage} = useChatHistoryManager({utils,forceRefresh, doSave, utils})
	
	const {deleteRole, exportRoles,importRoles,init, roles,rolesRef, setRoles, currentRole, setCurrentRole, newRole, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  currentRoleRef, currentTeam, currentTeamRef,  setCurrentTeam, deleteTeam, duplicateRole, teams, setTeams} = useSystemMessageManager({forceRefresh, doSave, chatHistoryId, categories, setCategories})
	const aiUsage = useOpenAiUsageLogger()
	const configManager = useConfigManager({config, token})
	const {queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, urlAudioPlayer} = useAudioPlayQueue({
		onStopPlaying: function() { forceRefresh()},
		onStartPlaying: function() { forceRefresh()},
		onFinishedPlaying: function() { 
			console.log("on finish play",lastLlmTrigger.current)
			if (lastLlmTrigger.current === 'speech') {
				setAutoStartMicrophone(true)
			}
			forceRefresh()
		}, 
		onError: function() {forceRefresh()},
		forceRefresh: forceRefresh
	})
	
	useEffect(function() {
		updateCreditBalance(token ? token.access_token : '')
	},[token ? token.access_token : null, JSON.stringify(aiUsage.totals)])  // on login and usage total change

	function newChat() {
		stopLanguageModels()
		if (!currentChatHistory() || currentChatHistory().length > 0) { 
			newChatHistory()
		}
	}
 	
	const aiTts = useOpenAiTts({aiUsage})
	const webSpeechTts = useWebSpeechTts({forceRefresh})
	const meSpeakTts = useMeSpeakTts({})
	const [runtimes, setRuntimes] = useState({})
	useEffect(() => {
		try {
			fetch(configManager.codeRunnerEndpoint() + '/runtimes', {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer '+((config && config.tools && config.tools.piston_key) ? config.tools.piston_key : ''),
					'Content-Type': 'application/json'
				},
			}).then(function(response) {
				//console.log("load runtimes",response)
				response.json().then(function(t) {
					//console.log(t)
					setRuntimes(t)
				})
			}).catch(function(e) {
				setErrorMessage("Failed to load code runtimes from "+ configManager.codeRunnerEndpoint())
				console.log(e)
			})
		} catch (error) {
			setErrorMessage("Failed to load code runtimes from "+ configManager.codeRunnerEndpoint())
			console.error('Error loading code runtimes:', error);
		}
	}, [])
	// console.log("PRE",config,configRef)
	const tools = useTools({runtimes, config, token, creditBalance, abortController, files, fileManager, onError : function(e) {
		setErrorMessage(e);
	}})
	
	
	async function playSpeech(text, forceEngine='', forceVoice='', forceSpeed='') {
		//console.log("PLAY",text, roles ? roles[currentRole] : 'noroles')
		if (roles && roles[currentRole] && roles[currentRole].config  && roles[currentRole].config.outputType && roles[currentRole].config.outputType.trim().length > 0) {
			return 
		} else {
			// TODO STRIP TEXT INSIDE ```  ``` - CODE BLOCKS ETC
			return queueSpeech(text,config,{aiTts,webSpeechTts,meSpeakTts}, forceEngine, forceVoice, forceSpeed)
		}
	}
	
	const {usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt} = utils.summariseConfig(config)
	const aiLlm = useLlm({
		files, 
		fileManager,
		modelSelector,
		errorMessage,  setErrorMessage, 
		onStart: function() {
			//console.log('LOCAL LLM START')
			addAssistantMessage('')
			utils.scrollTo('endofdocument')
			forceRefresh()
		},
		onUpdate: function(d, partial, duration) {
			//console.log('LOCAL LLM UPDATE',partial,d)
			setLastAssistantMessage(d,{duration})
			forceRefresh()
			utils.scrollTo('endofdocument')
			playSpeech(partial,'','',roles && roles[currentRole] && roles[currentRole].config  && roles[currentRole].config.ttsSpeed > 0.2 ? roles[currentRole].config.ttsSpeed/100 : 1).then(function() {
				
			})
		},
		onComplete: function(d, usage) {
			console.log('LOCAL LLM complete',d, usage)
			setLastAssistantMessage(d, usage)
			doSave()
			if (lastLlmTrigger.current === 'speech') {
				setAutoStartMicrophone(true)
			}
			updateCreditBalance(token ? token.access_token : '')
			forceRefresh()
			utils.scrollTo('endofdocument')
		},
		onError: function(error) {
			//console.log("LLM ERR",err, typeof err, JSON.stringify(err))
			stopLanguageModels()
			console.log(error.name)
			if (error instanceof DOMException && error.name == 'AbortError') {
				console.log('ABORT: ', error.message);
			} else {
				console.log('LLM error:', error.message);
				setErrorMessage(error.message)
			}
			//alert(err)
			// revertChatHistory()
		},
		forceRefresh,
		aiUsage,
		currentChatHistory,
		tools,
		nlp,
		abortController,
		token
	})
	
	
	const teamLlm = useTeamLlm({
		modelSelector,
		teams,
		roles,
		utils,
		files, 
		fileManager,
		errorMessage,  setErrorMessage, 
		onStart: function() {
			//console.log('TEAM LLM START')
			addAssistantMessage('')
			utils.scrollTo('endofdocument')
			forceRefresh()
		},
		onUpdate: function(d, duration) {
			console.log('TEAM LLM UPDATE', d , duration)
			setLastAssistantMessage(d, {duration})
			setAccordionSelectedKey(d.length - 1)
			forceRefresh()
			utils.scrollTo('endofdocument')
		},
		onComplete: function(d, usage) {
			console.log('TEAM LLM COMPLETE', d , usage)
			//if (!(config && config.llm && config.llm.self_hosted_url)) aiUsage.log(usage)
			setLastAssistantMessage(d, usage)
			//console.log("SET ACCORD",d.length -1)
			setAccordionSelectedKey(d.length - 1)
			doSave()
			updateCreditBalance(token ? token.access_token : '')
			forceRefresh()
			utils.scrollTo('endofdocument')
		},
		onError: function(error) {
			stopLanguageModels()
			if (error instanceof DOMException && error.name == 'AbortError') {
				console.log('ABORT: ', error.message);
			} else {
				console.log('LLM error:', error.message);
				setErrorMessage(error.message)
			}
			// try {
			// 	revertChatHistory()
			// } catch (e) {}
		},
		forceRefresh,
		aiUsage,
		tools,
		abortController,
		token
	}) 
	

	function stopAllPlaying() {
		//console.log("STOP ALL PLAYING")
		if (urlAudioPlayer.current) urlAudioPlayer.current.pause()
		stopPlaying()
		meSpeakTts.stop()
		webSpeechTts.stop()
		forceRefresh()
	}
	
	function stopLanguageModels(setButton = true) {
		console.log("STOP LANG MODELS", setButton)
		stopAllPlaying()
		aiLlm.stop()
		teamLlm.stop()
		if (setButton)  {
			setAutoStopMicrophone(true)
			lastLlmTrigger.current="button" ;
		}
		forceRefresh()
	}
	
	// initialise relevant language model when config changes
	// useEffect(function() {
	// 	const {useOpenAi, useSelfHosted} = utils.summariseConfig(config)
	// 	if (useOpenAi) aiLlm.init()
	// 	if (currentTeam) teamLlm.init()
	// 	configRef.current = config
	// },[JSON.stringify(config)])
	
	// submit history and userMessage to LLM
	function submitForm(userMessage) {
		let config = configRef.current
		try {
			//console.log("SUBMIT", userMessage, config)
			if (userMessage) {
				stopLanguageModels(false)
				addUserMessage(userMessage)
				setUserMessage('')
				doSave()
				abortController.current = new AbortController()
				const {useLlm, useOpenAi, useSelfHosted, useGroq} = utils.summariseConfig(config)
				let systemMessage = currentRoleRef.current && roles && roles[currentRoleRef.current] && roles[currentRoleRef.current].message ? roles[currentRoleRef.current].message : ''
				if (currentRoleRef.current && roles && roles[currentRoleRef.current] && roles[currentRoleRef.current].skills) {
					systemMessage += "\n\n" + roles[currentRole].skills
				}
				if (currentRoleRef.current && roles && roles[currentRoleRef.current] && roles[currentRoleRef.current].backStory) systemMessage += "\n\n" + roles[currentRoleRef.current].backStory
				
				if (currentTeam) {
					teamLlm.start(userMessage, currentTeam,  chatHistoriesRef.current[chatHistoryIdRef.current])
				} else {
					console.log("APP AI START", useOpenAi, useGroq)
					aiLlm.start(roles[currentRole], chatHistoriesRef.current[chatHistoryIdRef.current]) 
					//, config.llm.openai_key, config.llm.openai_model ,roles[currentRoleRef.current])
				}
				//if (config && config.llm && config.llm.google_gemini_key && config.llm.use === 'gemini')  geminiLlm.start(chatHistory)
				//if (config && config.llm && config.llm.self_hosted_url && config.llm.use === 'self_hosted')  localLlm.start(systemMessage, chatHistory.current, systemConfig)
				forceRefresh()
				
			}
		} catch (e) {
			window.alert(e)
			console.log(e)
		}
		return false
	}
	
	
	let allProps = {isFileManagerWaiting, setIsFileManagerWaiting, errorMessage, setErrorMessage, isOnlineRef, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn: configRef.current, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels, getDocument}
	
	return (<div style={{position:'relative'}}>
		{mergeData && <MergeWarningModal chatHistoryId={chatHistoryId} chatHistories={chatHistories} setChatHistories={setChatHistories} logs={aiUsage.logs} setLogs={aiUsage.setLogs} doSave={doSave} config={config} setConfig={setConfig} forceRefresh={forceRefresh} mergeData={mergeData} setMergeData={setMergeData} roles={roles} setRoles={setRoles}  currentRole={currentRole} setCurrentRole={setCurrentRole} setChatHistoryRoles={setChatHistoryRoles} chatHistoryRoles={chatHistoryRoles} />}
		{!mergeData && 
			<>
				
		
				{!hasRequiredConfig(config) && <ConfigWizard login={login} logout={logout} user={user} token={token} config={config} setConfig={setConfig} forceRefresh={forceRefresh} />}
				{hasRequiredConfig(config) && <Router >
					{errorMessage &&  <ErrorWarningModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} icons={icons} />}
						<Routes>
							<Route  path={`/`}   element={<HomePage {...allProps}  />} />
							<Route  path={`/menu`}   element={<ChatHistoryPage {...allProps}  />} />
							<Route  path={`/help/:section`}   element={<HelpPage {...allProps}  />} />
							<Route  path={`/help`}   element={<HelpPage {...allProps}  />} />
							<Route  path={`/chat/:id`}   element={<ChatPage {...allProps}  />} />
							<Route  path={`/chat`}   element={<ChatPage {...allProps}  />} />
							<Route  path={`/simplechat/:id`}   element={<ChatPage {...allProps}  simplifiedChat={true}/>} />
							<Route  path={`/simplechat`}   element={<ChatPage {...allProps}  simplifiedChat={true}/>} />
							<Route  path={`/history`}   element={<ChatHistoryPage {...allProps}  />} />
							<Route  path={`/settings/:section`}   element={<SettingsPage {...allProps}  />} />
							<Route  path={`/settings`}   element={<SettingsPage {...allProps}  />} />
							<Route  path={`/roles`}   element={<RolesPage {...allProps}  />} />
							<Route path={`/role/:id/:category`} element={<RolePage {...allProps}  />} />
							<Route path={`/role/:id`} element={<RolePage {...allProps}  />} />
							<Route path={`/role`} element={<RolePage {...allProps}  />} />
							<Route path={`/privacy`} element={<PrivacyPage {...allProps}  />} />
							<Route path={`/terms`} element={<TermsPage {...allProps}  />} />
							<Route path={`/team/:id/:category`} element={<TeamPage {...allProps}  />} />
							<Route path={`/team/:id`} element={<TeamPage {...allProps}  />} />
							<Route path={`/team`} element={<TeamPage {...allProps}  />} />
							<Route path={`/tokens`} element={<TokensPage {...allProps}  />} />
							<Route path={`/files`} element={<FilesPage {...allProps}  />} />
							<Route path={`/payment`} element={<PaymentPage {...allProps}  />} />
							isFileManagerWaiting, setIsFileManagerWaiting			<Route path={`/roadmap`} element={<RoadMapPage {...allProps}  />} />
							
						</Routes>    
					</Router >
				}
		<div id="endofdocument" >
			
		</div>
			</>
			
		}
	</div>);
}

export default App;

//<Route path={`/payment`} element={<PaypalPaymentPage {...allProps}  />} />
							 
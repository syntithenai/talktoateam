import {React} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import Menu from '../components/Menu'
import Footer from '../components/Footer'; 
export default function TermsPage({ isOnlineRef, allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
	
	let paraStyle={marginTop:'0.5em'}
	return (<div className="App" style={{textAlign:'left'}} id={refreshHash} >
			 
              <Menu {...{ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}} />
              
			
			<div id="body" style={bodyStyle}  >
							<h3>Terms And Conditions</h3>
							<br/>
							<h5>The Software</h5>
							
							<div style={paraStyle}>This software is provided as is without guarantees or warranties.</div>
							
							<div style={paraStyle}>The software is released under an open source MIT style license so you can modify and use it however you like without attribution. See <a href="https://raw.githubusercontent.com/syntithenai/talktoateam/main/LICENSE" target="_new">Github</a> for details.</div>
							<br/><h6>Third Party Providers</h6>
							<div style={paraStyle}>The software requires third party services and is built to allow the use of any provider (eg OpenAI, GroqCloud, ..) using the software available at https://talktoateam.com.</div>
							<div style={paraStyle}>By default, the software uses the free tier language models provided by GroqCloud and relies on the TalkToATeam LLM proxy to provide a free to use service.</div>
							<div style={paraStyle}>Additionally we offer prepay credit for a unified suite of web services that support the software.</div>
							<br/>
							<h5>The TalkToATeam Web Services</h5>
							<div style={paraStyle}>When you purchase credit with our service you gain access to.</div>
							<ul style={{marginTop:'0.5em'}}>
								<li>Our LLM proxy which enables easy access to a wide range of providers without having to signup and manage API keys.</li>
								<li>Our web search engine, boosted with machine learning.</li>
								<li>Our code execution engine for running that AI generated code.</li>
								<li>Our CORS supporting proxy to supercharge the scraping power of your scripts.</li>
							</ul>
							<div style={paraStyle}>We keep as little information as possible to allow billing, we store date, amount and transaction type (llm/code/credit) against your email address.</div>
							<div style={paraStyle}>We do not keep any history of the text sent to and from our endpoints.</div>
							<div style={paraStyle}>Login is provided by Google. Backup of settings and chat history is provided by Google Drive.</div>
							<div style={paraStyle}>We have no control of the privacy or usage policy of third party providers.</div>
							<div style={paraStyle}>Credit is non refundable and non transferable.</div>
							

			</div>		
			<Footer icons={icons} />
	</div>)
}

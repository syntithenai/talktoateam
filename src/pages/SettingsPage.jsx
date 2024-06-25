import {React, useState, useEffect} from 'react'
import {Button, Modal, Tabs, Tab} from 'react-bootstrap'

import useIcons from '../useIcons'
// import ModelSelector from '../components/ModelSelector'
import TTSConfigForm from '../components/TTSConfigForm'
import STTConfigForm from '../components/STTConfigForm'
import LLMConfigForm from '../components/LLMConfigForm'
import ToolsConfigForm from '../components/ToolsConfigForm'
import PreferredModelsConfigForm from '../components/PreferredModelsConfigForm'
//import SystemMessageForm from '../components/SystemMessageForm'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
import {Link } from 'react-router-dom'
import ModelSelectorModal from '../components/ModelSelectorModal'

export default function SettingsPage({ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
	// console.log(token)
	
	// useEffect(function() {
	// 	if (token && token.access_token) updateCreditBalance(token)
	// },[token])

	function clearConfig() {
		setConfig({llm:{},stt:{},tts:{}})
		aiUsage.setLogs({})
		forceRefresh()
	}
	
	function clearAll() {
		setConfig({llm:{},stt:{},tts:{}})
		aiUsage.setLogs({})
		setRoles(null)
		setTeams(null)
		window.location.reload();
		forceRefresh()
	}
	
	function startWizard() {
		//console.log(config)
		if (config && config.llm) config.llm.use=''
		setConfig(config)
		forceRefresh()
	}
	
	function testbal() {
		// let u = "http://localhost/llm"
		let u=import.meta.env.VITE_API_URL + '/v1/chat/completions'
		 //paypal_ipn'
		fetch(u, {
			method: 'post',
			headers: {
				'Authorization': 'Bearer '+ (token ? token.access_token : '')
			},
			body: JSON.stringify({"prompt":'fred'})
		}).then(function(res) {
			console.log(res)
		}).catch (function(e) {
			console.log(e)
		})
	}
			
	const {openAiBillable, useLlm} = utils.summariseConfig(config)
	
	return (
		<div className="App" style={{textAlign:'left'}} id={refreshHash} >
			 
              <Menu {...{isOnlineRef,bodyStyle, creditBalance, refreshHash, token, logout, user,login, utils, usingStt, usingTts, isSpeaking, isMuted, mute, stopAllPlaying, icons, unmute, stopPlaying, lastLlmTrigger, config, aiUsage, forceRefresh, autoStartMicrophone, setAutoStartMicrophone, isPlaying, allowRestart, isWaiting, startWaiting, stopWaiting, onCancel, isReady, setIsReady, onTranscript, onPartialTranscript, setUserMessage}} />
              
			<div id="body" style={bodyStyle}  >
			  
			  <h3>Settings</h3>
			  <Tabs
				  defaultActiveKey="llm"
				  id="configtabs"
				  className="mb-3"
				>
				<Tab eventKey="llm" title="Provider Keys">
					<LLMConfigForm user={user} login={login} creditBalance={creditBalance} icons={icons} aiUsage={aiUsage} configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} useLlm={useLlm} />
				</Tab>
				<Tab eventKey="models" title="Preferred Models">
					<PreferredModelsConfigForm availableModels={availableModels} creditBalance={creditBalance} modelSelector={modelSelector} token={token} aiUsage={aiUsage} configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} icons={icons} />
				</Tab>
				<Tab eventKey="tools" title="Tools">
					<ToolsConfigForm  configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} />
				</Tab>
				<Tab eventKey="stt" title="Speech To Text">
					<STTConfigForm  configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} />
				</Tab>
				<Tab eventKey="tts" title="Text To Speech">
					<TTSConfigForm  configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} />
				</Tab>
				
				  
			</Tabs>	  
				  
			  
			  
			</div>
			<Footer icons={icons} />
		</div>
	)
}
{/* <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="success" onClick={startWizard} >{icons.magic} Setup Wizard</Button>
			  <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="warning" onClick={clearConfig} >{icons.bin} Clear Config And Usage Logs</Button>
			  <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="danger" onClick={clearAll} >{icons.bin} Clear All</Button> */}
import {React, useState, useEffect, useRef} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 import Menu from '../components/Menu'
import Footer from '../components/Footer';
export default function TokensPage({isOnlineRef, allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
	
	// search filter
	const twoWeeksAgo = new Date()
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
	const tomorrow = new Date()
	tomorrow.setDate(tomorrow.getDate() + 1)
	const [startDate, setStartDateInner] = useState(twoWeeksAgo);
	const startDateRef = useRef()
	function setStartDate(a) {
		setStartDateInner(a)
		startDateRef.current = a
	}
	const [endDate, setEndDateInner] = useState(tomorrow);
	const endDateRef = useRef()
	function setEndDate(a) {
		setEndDateInner(a)
		endDateRef.current = a
	}
	
    // results
	const [collated, setCollated] = useState([])
	const [tallies, setTallies] = useState([])
	const [grandTotals, setGrandTotals] = useState([])
	
	useEffect(function() {
		search()
	},[])
	let keyTallies = {}
	
	function search() {
		let collatedData = aiUsage.collated(startDateRef.current, endDateRef.current)
		setCollated(collatedData.logs)
		setTallies(collatedData.tallies)
		setGrandTotals(collatedData.grandTotals)
	} 
		
	let paraStyle={marginTop:'0.5em'}
	const {openAiBillable} = utils.summariseConfig(config)
	return (<div className="App" style={{marginLeft:'0.5em',textAlign:'left'}} id={refreshHash} >
			
              <Menu {...{ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}} />
              
			
			<div id="body" style={bodyStyle}  >
							<div>
		
						
		<div style={{borderBottom:'2px solid black', marginBottom:'1em', paddingBottom:'1em'}}>
			<h4>Search</h4>
			<b>From:</b> <DatePicker selected={startDate} onChange={(date) => {setStartDate(date); search()}} />
			&nbsp;&nbsp;&nbsp;<b>To:</b> <DatePicker selected={endDate} onChange={(date) => {setEndDate(date); search()}} />
			
		</div>
		<Button style={{float:'right'}}  variant="success" onClick={function() {utils.downloadText(JSON.stringify(collated),"statistics.json")}} >{icons.save}</Button>
			
		<div style={{borderBottom:'2px solid black', marginBottom:'1em', paddingBottom:'1em'}} >
			<h4>Grand Totals</h4>
			<table><thead>
				<tr><th>Tokens In</th><th>Tokens Out</th><th>Total Tokens</th><th>Cost In</th><th>Cost Out</th><th>Total Cost</th></tr>
				</thead>
				<tbody>
				<tr>
					<td>{grandTotals.tokens_in > 0 ? grandTotals.tokens_in : 0}</td>
					<td>{grandTotals.tokens_out > 0 ? grandTotals.tokens_out : 0}</td>
					<td>{grandTotals.tokens_in + grandTotals.tokens_in > 0 ? grandTotals.tokens_in + grandTotals.tokens_in : 0}</td>
					<td>{grandTotals.cost_in > 0 ? grandTotals.cost_in : 0}</td>
					<td>{grandTotals.cost_out > 0 ? grandTotals.cost_out : 0}</td>
					<td>{grandTotals.cost_in + grandTotals.cost_out > 0 ? grandTotals.cost_in + grandTotals.cost_out : 0}</td></tr>
				</tbody>
			</table>
			<br/>
		</div>
		{Object.keys(collated).map(function(urlAndKey, uk) {
			let parts = urlAndKey.split(":::::")
			let url = parts[0]
			let key = (parts && parts.length) > 0 ? parts[1] : ''
			keyTallies[url] = keyTallies[url] > 0 ? keyTallies[url] + 1 : 1
			let urlTallies = {}
			let tdStyle = {border: '1px solid black', paddingLeft:'0.3em'}
			return <div key={uk} >
				<h5>Key: {keyTallies[url]}    {url}</h5>
				<table>
				<thead>
				<tr><th>Date</th><th>Tokens In</th><th>Tokens Out</th><th>Total Tokens</th><th>Cost In</th><th>Cost Out</th><th>Total Cost</th></tr>
				</thead>
				<tbody>
				{collated[urlAndKey].map(function(logEntry, lk) {
					//urlTallies.tokens_in
					return <tr key={lk} style={{ border:'1px solid black', backgroundColor: lk%2===0 ? 'lightgrey' : 'lightblue' }} ><td style={tdStyle} >{new Date(logEntry.date).toLocaleString()}</td><td style={tdStyle} >{logEntry.tokens_in}</td><td style={tdStyle} >{logEntry.tokens_out}</td><td style={tdStyle} >{logEntry.tokens_in + logEntry.tokens_out}</td><td style={tdStyle} >{logEntry.price_in}</td><td style={tdStyle} >{logEntry.price_out}</td><td style={tdStyle} >{logEntry.price_in + logEntry.price_out}</td></tr>
				})}
				<tr><td><b></b></td><td><b>{tallies[urlAndKey].tokens_in}</b></td><td><b>{tallies[urlAndKey].tokens_out}</b></td><td><b>{tallies[urlAndKey].tokens_out + tallies[urlAndKey].tokens_out}</b></td><td><b>{tallies[urlAndKey].price_in}</b></td><td><b>{tallies[urlAndKey].price_out}</b></td><td><b>{tallies[urlAndKey].price_in + tallies[urlAndKey].price_out}</b></td></tr>
				</tbody>
				</table>
			</div>
			
		})}
	</div>
			</div>
			
			<Footer icons={icons} />
	</div>)
	
}

import {React} from 'react'
import {Table, Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import SortableTable from '../components/SortableTable'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
const headers = [
    { key: "provider", label: "Provider" },
    { key: "model", label: "Model" },
    { key: "price_in", label: "Price In" },
    { key: "price_out", label: "Price Out" },
    { key: "parameters", label: "Parameters" },
    { key: "context_length", label: "Context" },
  ];

function PricingTable({data}) {
	return <SortableTable data={data ? data : []} headers={headers} />

//   return (
//     <Table striped bordered hover>
//       <thead>
//         <tr>
//           <th>#</th>
//           <th>Model</th>
//           <th>Price In $(USD)</th>
//           <th>Price Out $(USD)</th>
//         </tr>
//       </thead>
//       <tbody>
//         {models.map(function(m,mk) {
// 			return <tr>
// 			<td>{mk}</td>
// 			<td>{m.model}</td>
// 			<td>{m.price_in}</td>
// 			<td>{m.price_out}</td>
// 		  </tr>
// 		})}	
//       </tbody>
//     </Table>
//   );
}

export default function PricingPage({ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
	
	let paraStyle={marginTop:'0.5em'}
	return (<div className="App" style={{textAlign:'left'}} id={refreshHash} >
			 
              <Menu {...{ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}} />
              
			
			<div id="body" style={bodyStyle}  >
							<Link style={{float:'right', marginRight:'1em', marginTop:'1em'}} to="/payment" ><Button variant="success" size="lg" >Buy Credit</Button></Link>
							<h3>Pricing</h3>
							<div style={paraStyle}>This software relies on third party providers to provide language models and other services. The bulk of your credit goes to these providers.</div>
							<div style={paraStyle}>All prices are shown in US Dollars.</div>
							<div style={paraStyle}>You can configure the software to enter provider details directly and bypass our service however credit with our service gives you quick and easy
								 access to a range of providers as well as access to our search, code execution and web proxy endpoints.</div>
							<div style={paraStyle}>Credit is non refundable and non transferable. See our <Link style={{marginLeft:'1em'}} size="sm" to="/terms"><Button>Terms and Conditions</Button></Link></div>
							<div style={paraStyle}>We charge fees against your credit as follows. (See the table below for provider pricing.)</div>
							<br/>
							<Table striped bordered hover>
								<thead><tr><th>Service</th><th>Charge</th></tr></thead>
								<tbody>
									<tr><td>Requests made through our LLM proxy</td><td>15% surcharge on provider price plus $0.01  per request </td></tr>
									<tr><td>AI enhanced websearch</td><td>$0.02  per request</td></tr>
									<tr><td>Web request made through our CORS supporting proxy</td><td>$0.01 per request</td></tr>
									<tr><td>Code execution endpoint</td><td>$0.005/second</td></tr>
								</tbody>
							</Table>

							<br/>
							<PricingTable data={availableModels} />
							 
			</div>
			<Footer icons={icons} />
	</div>)
}

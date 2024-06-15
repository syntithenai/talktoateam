import {React, useState, useEffect, useRef} from 'react'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, ListGroup, ButtonGroup, Form, Dropdown, Accordion} from 'react-bootstrap'

import useUtils from '../useUtils'
import TextareaAutosize from 'react-textarea-autosize';
import SpeechButton from '../SpeechButton'
//import SystemMessageEditorModal from '../components/SystemMessageEditorModal'
import useSystemMessageManager from '../useSystemMessageManager' 
import SelectSampleModal from '../components/SelectSampleModal'

import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {Link } from 'react-router-dom'
import ChatHistoriesModal from '../components/ChatHistoriesModal'
import ConfirmDialog from '../components/ConfirmDialog'
import MermaidViewer from '../components/MermaidViewer'
import AbcViewer from '../components/AbcViewer'
import MarkdownViewer from '../components/MarkdownViewer'
import MessageEditorDialog from '../components/MessageEditorDialog'
import CodeViewer from '../components/CodeViewer'
import  CopyTextButton from '../components/CopyTextButton'
import AssistantSelector from '../components/AssistantSelector'

export default function ChatPage({ user, token, login, logout, refresh, doSave,teamLlm, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, selfHostedLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, category, setCategory,exportRoles,importRoles,setSystemMessage,systemMessage,setSystemConfig, systemConfig, init, saveRole, loadRole, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger,  autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking,  isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, getLastAssistantMessage, setLastUserMessage,getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, chatHistoryRoles, setChatHistoryRoles, getLastAssistantChatIndex, categories, configManager, runtimes, currentTeam, setCurrentTeam, teams, setTeams,  accordionSelectedKey, setAccordionSelectedKey, simplifiedChat, categoryFilter, setCategoryFilter}) {
//console.log("chatpage",config, typeof config)
	let graphCount = 0;
	let abcCount = 0;
	function onCancel() {
		lastLlmTrigger.current=''
		stopLanguageModels()
	}
	const navigate = useNavigate()
	let params = useParams()
	//console.log(params)
	const hiddenInput = useRef()
	useEffect(function() {
		//console.log('paramchange',params.id, chatHistories,chatHistoryId)
		if (!chatHistories) chatHistories = {}
		
			
		if (!params.id) {
			//console.log('paramchange no id')
			const lastId = localStorage.getItem("voice2llm_last_chat")
			const id = lastId ? lastId : utils.generateRandomId()
			//console.log('paramchange new id',lastId, id)
			//setChatHistoryId(id)
			//if (!chatHistories.hasOwnProperty(id)) {
				//chatHistories[id] = []
				//setChatHistories(chatHistories)
			//}
			navigate("/chat/"+id)
		} else if (params.id) {
			//console.log('paramchange have id',params.id)
			setChatHistoryId(params.id)
			localStorage.setItem("voice2llm_last_chat", params.id)
			// create new
			if (!chatHistories.hasOwnProperty(params.id)) {
				chatHistories[params.id] = []
				setChatHistories(chatHistories)
				// save current history role
				if (!chatHistoryRoles) chatHistoryRoles = {}
				chatHistoryRoles[params.id] = currentRole
			} else {
			// load current history role
				if (!chatHistoryRoles) chatHistoryRoles = {}
				if (chatHistoryRoles[params.id]) setCurrentRole(chatHistoryRoles[params.id]) 
			}
			 
		}
	},[params.id])
	
	
	function restartFromChatMessage(index) {
		//if (window.confirm('Really discard chat messages after this and start with this message?')) {
			stopLanguageModels()
			setUserMessage(revertChatHistory(index))
			aiLlm.isBusy.current = false
		//}
	}
	
	let utterancesTimeout = useRef()
	let chatHistory = currentChatHistory()
	
	function onTranscript(v) {
		if (v) {
			lastLlmTrigger.current="speech"
			//console.log('transcript',v, userMessageRef.current, chatHistory)
			//submitForm(v,config)
			// concatenate transcripts into userMessage
			let newMessage = (userMessageRef.current ? userMessageRef.current + " " : "") + v
			setUserMessage(newMessage)
			//clearTimeout(utterancesTimeout.current)
			// send combined transcripts after timeout
			//utterancesTimeout.current = setTimeout(function() {
				console.log('transcript TO',v)
				lastLlmTrigger.current="speech"
				// stop llm processing, manipulate history and resubmit
				if (aiLlm.isBusy.current || selfHostedLlm.isBusy.current|| teamLlm.isBusy.current) {
					stopLanguageModels(false)
					revertChatHistory()
					let sendMessage = (getLastUserMessage() ? getLastUserMessage() + ' ' : '') + newMessage
					submitForm(sendMessage,config)
				} else {
					submitForm(newMessage,config)
				}
				//revertChatHistory()
				const uIndex = getLastAssistantChatIndex('user')
				const aIndex = getLastAssistantChatIndex('assistant')
				const aMessage = getLastAssistantMessage()
				//console.log(uIndex,aIndex,aMessage)
				//if ()
				//
				
				//let lastMessage = chatHistory.pop()
				//console.log('transcript lastMessage',lastMessage, "|",userMessageRef.current, "|",newMessage,"||", chatHistory)
				
				//if (lastMessage && lastMessage.role =='assistant') {
					//// no llm reply yet, concatenate new with old message and resubmit
					//if (!lastMessage.content) {
						//console.log('transcript no reply')
						//let last = getLastUserMessage()
						////setLastUserMessage(userMessageRef.current + v)
						////chatHistory.current.pop()
						////setChatHistory(chatHistory.current)
						//revertChatHistory()
						//submitForm(last + v,config)
					//// started to reply, just send new messages
					//} else {
						//console.log('transcript reply')
						//submitForm(v,config)
					//}
				//// last message is user, concat messages content
				//} else if (lastMessage && lastMessage.role =='user') {
					//console.log('transcript user last have last Message', lastMessage)
					//revertChatHistory()
					//submitForm(lastMessage + v,config)
				//} else {
					//console.log('transcript user last NO last Message', userMessage)
					//submitForm(	v,config)
				//}
			//},2400)
		}
	
	}
	const [showConfirm, setShowConfirm] = useState(false)
	const toRestart = useRef()
	const preStyle = {border:'1px dashed blue', padding:'0.3em'}
	
	function preTemplate(text) {
		return <div style={{position:'relative'}} >
			<pre style={preStyle} >{text}</pre>
		</div>
		
	}
	//<Button size="sm" style={{}}  onClick={function() {navigator.clipboard.writeText(text)}} >{icons['filecopy']}</Button>
			
		
	function text2Html(text) {
		// ```python|javascript|json``` - display in block
		// newline
		text = String(text)
		//return 
		let parts = text && text.split ? text.split('```') : []
		let final = []
		let runtimeKeys = []
		Object.values(runtimes).forEach(function(runtime) {
			runtimeKeys.push(runtime.language)
			if (Array.isArray(runtime.aliases)) {
				runtime.aliases.forEach(function(a) {
					runtimeKeys.push(a)
				})
			}
		})
		//console.log(parts)
		for (let i = 0 ; i < parts.length; i++) {
			//console.log("LOOP",i)
			let part = parts[i]
			let partLines = part.split("\n")
			let language = partLines[0]
			if (i%2 === 0) {
				//console.log("EVEN PART",part)
				// new lines
				//.split("\n").map(function(p) { return <MarkdownViewer markdown={p}   /> })
				//console.log("||{||" + part + "||}||")
				if (part && ((part.trim && part.trim().length > 0)  || parseFloat(part) != NaN)) final.push(<div>{part}</div>)
			} else {
				//console.log("ODD PART",part) 
				// 
				//if (part.startsWith('python')) {
					//final.push(preTemplate(part.slice(6)))
				//} else if (part.startsWith('javascript')) { 
					//final.push(preTemplate(part.slice(9)))
				//} else 
				if (part.startsWith('json')) { 
					final.push(preTemplate(part.slice(4)))
				} else if (part.startsWith('mermaid')) { 
					graphCount++
					final.push(<><MermaidViewer aiLlm={aiLlm} icons={icons} chart={part.slice(7)} submitForm={submitForm} forceRefresh={forceRefresh} elementId={"mermaidrenderer_" + graphCount} /></>)
				} else if (part.startsWith('abc')) { 
					final.push(<><AbcViewer abc={part.slice(3)} forceRefresh={forceRefresh}   /></>)
				} else if (part.startsWith('markdown')) { 
					final.push(<><MarkdownViewer markdown={part.slice(8)}   /></>)
				} else if (part.startsWith('python')) { 
					final.push(<><CodeViewer submitForm={submitForm} runtimes={runtimes} pistonCodeRunnerEndpoint={configManager.codeRunnerEndpoint()} language='python' code={part.slice(6)}  icons={icons} /></>)
				} else if (part.startsWith('javascript')) { 
					final.push(<><CodeViewer submitForm={submitForm}  runtimes={runtimes}  pistonCodeRunnerEndpoint={configManager.codeRunnerEndpoint()} language='javascript' code={part.slice(9)}  icons={icons}   /></>)
				} else if (runtimeKeys.indexOf(language) !== -1) {
					final.push(<><CodeViewer submitForm={submitForm}  runtimes={runtimes}  pistonCodeRunnerEndpoint={configManager.codeRunnerEndpoint()} language={language} code={partLines.slice(language.length).join("\n")}  icons={icons}   /></>)
					
				} else {
					final.push(preTemplate(part))
				}
			}
		}
		//console.log(final)
		return final //	text + final.join("\n")
	}
	
	function injectTextFile(e) {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target.result;
			setUserMessage(userMessage + text)
		}
		reader.readAsText(file);
	}
	
	const chatHistoryFiltered = chatHistory ? chatHistory.filter(function(message) {
		return message && (message.role === "user" || message.role === "assistant")
	}) : []
	
	
	function chatResourceAccordion(resources,mkey,accordionSelectedKey, setAccordionSelectedKey) {
		if (Array.isArray(resources) && resources.length > 0) {
			return <>
				<div style={{marginTop:'1em'}}  >
				<Accordion activeKey={accordionSelectedKey} defaultActiveKey={accordionSelectedKey}>
				{resources.map(function(resource, rk) {
					let prices = resource && resource.log ? aiUsage.getLlmPrice(resource.log.model, resource.log.tokens_in, resource.log.tokens_out) : {price_in: 0, price_out: 0, total: 0}
					return <Accordion.Item key={rk} eventKey={rk}  >
							<Accordion.Header onClick={function() {if (accordionSelectedKey === rk) { setAccordionSelectedKey(''); } else { setAccordionSelectedKey(rk);}}}>
								<span style={{width:'80%'}} >{resource && resource.name} </span>
								{!simplifiedChat && <><Button style={{float:'right', marginRight:'1em'}} variant='outline-primary'>{(((resource && resource.log) ? resource.log.duration : 0)/1000).toFixed(2) }s</Button>
								<Button style={{float:'right', marginRight:'1em'}} variant='outline-primary'>{(resource && resource.log) ? resource.log.tokens_in : 0 }/{(resource && resource.log) ? resource.log.tokens_out : 0 }&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>${(prices && prices.total > 0) ? prices.total.toFixed(4) : 0 }</b></Button></>}
							</Accordion.Header>
							<Accordion.Body>
								{<ButtonGroup style={{float:'right', marginLeft:'1em'}} >
								
									<MessageEditorDialog value={resource && resource.content} onChange={function(e) {
									//console.log('CH',e, chatHistories, chatHistoryIdRef.current, mkey, rk)
									if (chatHistoryIdRef.current && chatHistories && chatHistories[chatHistoryIdRef.current] && chatHistories[chatHistoryIdRef.current][mkey] && chatHistories[chatHistoryIdRef.current][mkey].content && chatHistories[chatHistoryIdRef.current][mkey].content[rk]) {
										//console.log('CH ok',chatHistories[chatHistoryId][mkey].content[rk])
										chatHistories[chatHistoryId][mkey].content[rk].content = e
										setChatHistories(chatHistories)
										forceRefresh()
									}
									}} />
									<CopyTextButton text={resource && resource.content ? resource.content : ''} icons={icons} />
								</ButtonGroup>}
									
								
								{resource && text2Html(resource.content)}
							</Accordion.Body>
						</Accordion.Item>
				})}
				</Accordion>
				</div>
			</>
		} else {
			return null
		}
	}
	let grandTotals = {}
	const {openAiBillable, useLlm} = utils.summariseConfig(config)
	
	let welcomeMessage = roles && currentRole && roles[currentRole] && roles[currentRole].config && roles[currentRole].config.welcomeMessage ? roles[currentRole].config.welcomeMessage : ''
	if (currentTeam) welcomeMessage = teams && currentTeam && teams[currentTeam] && teams[currentTeam].config && teams[currentTeam].config.welcomeMessage ? teams[currentTeam].config.welcomeMessage : ''
	//console.log(openAiBillable ? 'billable' : 'not billable')
	const newChatId =  utils.generateRandomId() 
	return	<div className="App" id={refreshHash} >
		<ConfirmDialog forceShow={showConfirm} setForceShow={setShowConfirm} title="Revert Chat History" message="Really discard chat messages after this and start with this message?" onCancel={function() {setShowConfirm(false)}} onConfirm={function() {restartFromChatMessage(toRestart.current); setShowConfirm(false)}}  />
		{<>
			<div id="menu" style={{zIndex:'9', backgroundColor:'lightgrey', border:'1px solid grey', position: 'fixed', top: 0, left: 0, width: '100%', height:'3em'}}  >
				
				{!simplifiedChat && <span style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}} >
					<Link to="/menu"><Button>{icons.menu}</Button></Link>
				</span>}
				{simplifiedChat && <span style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}} ><Link to="/" onClick={function() {localStorage.setItem("voice2llm_last_chat",''); localStorage.setItem("voice2llm_last_role",'')}} ><Button>{icons.home}</Button></Link></span>}
					
					
				<Link  to={"/chat/"+newChatId}><Button onClick={stopLanguageModels} disabled={!newChatId} style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}}  variant="primary"  >{icons["newchat"]}</Button></Link>
				
				<span style={{float:'right',marginTop:'0.2em',marginRight:'0.2em'}} >
					{(!simplifiedChat &&  usingTts) && <>
					{(!simplifiedChat &&  !isSpeaking && !isMuted) && <button  style={{marginRight: '0.2em', color:'black'}} className="btn  btn-success"  id="muteButton" onClick={function() {mute(); stopAllPlaying()}} title="Mute"  >{icons["volume-vibrate-fill"]}</button>}
					{(!simplifiedChat &&  !isSpeaking && isMuted) && <button  style={{marginRight: "0.2em", color:'black'}} className="btn btn-secondary"  id="unmuteButton" onClick={unmute}  title="UnMute" >{icons["volume-off-vibrate-fill"]}</button>}
					{(!simplifiedChat &&  isSpeaking) && <button  style={{marginRight: "0.2em", color:'black'}} className="btn btn-success"  id="playingButton" onClick={stopPlaying}  title="Stop Playing" >{icons["speak"]}</button>}
					</>}
				
					{usingStt && <SpeechButton 
						lastLlmTrigger={lastLlmTrigger}
						config={config}
						aiUsage={aiUsage}
						forceRefresh={forceRefresh}
						stopLanguageModels={stopLanguageModels}
						autoStartMicrophone={autoStartMicrophone}
						setAutoStartMicrophone={setAutoStartMicrophone}
						autoStopMicrophone={autoStopMicrophone}
						setAutoStopMicrophone={setAutoStopMicrophone}
						isPlaying={isPlaying}
						allowRestart={true}
						isWaiting={isWaiting}
						startWaiting={startWaiting}
						stopWaiting={stopWaiting}
						onCancel={onCancel}
						isReady={isReady} setIsReady={setIsReady}
						onTranscript = {onTranscript}
						onPartialTranscript = {function(v) {
							//console.log('P:',v)
							setUserMessage(v)
						}}
						
					/>}
				</span>
				{!simplifiedChat && <>
				{import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && <span style={{float:'right',marginTop:'0.3em',marginLeft:'0.2em',marginRight:'01em'}} >	
				{(token && token.access_token) && <Button onClick={function() { logout()}} variant="danger" >{!(user && user.picture) && icons["user_logout"]} {(user && user.picture) && <img height="28" width="28" src={user.picture + '?access_token='+token.access_token + '&not-from-cache-please'} />}</Button>}
				
				{!(token && token.access_token) && <Button onClick={function() { login()}} variant="success" >{icons["user"]}</Button>}
				</span>}
				
				{<Link to="/tokens" ><span style={{color:'black', float:'right', marginTop:'0.7em',marginRight:'1em'}}> <b>{aiUsage.getTotal()}</b>
				</span></Link>}
				</>}
			</div>
			<div id="body" style={{zIndex:'3',position: 'fixed', top: '3em', left: 0, width: '100%',  paddingTop:'0.2em', backgroundColor:'white'}}  >
					
				<form  onSubmit={function(e) {submitForm(userMessageRef.current,config); e.preventDefault(); return false}} >
					{!simplifiedChat && <><AssistantSelector {...{categoryFilter, setCategoryFilter, user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, selfHostedLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, category, setCategory,exportRoles,importRoles,setSystemMessage,systemMessage,setSystemConfig, systemConfig, init, saveRole, loadRole, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger,  autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking,  isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, getLastAssistantMessage, setLastUserMessage,getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, chatHistoryRoles, setChatHistoryRoles, getLastAssistantChatIndex, categories, configManager, runtimes, currentTeam,  setCurrentTeam, teams, setTeams}}/></>}
					
					
					
					
					<div style={{clear:'both', float:'left'}} />
					
					<TextareaAutosize tabIndex="1" disabled={(selfHostedLlm.isBusy.current || aiLlm.isBusy.current || teamLlm.isBusy.current  || isPlaying.current || !llmEnabled)} maxRows={15} style={{minWidth: "65%", fontSize: '1em', float: "left"}} type='text' id="usermessage"  placeholder="Message" onChange={function(e) {setUserMessage(e.target.value); forceRefresh()}} value={userMessageRef.current} onFocus={function() {clearTimeout(utterancesTimeout.current)}} /> 
					<span style={{float:'left'}}>
						<span style={{float:'right', marginLeft:'0.3em'}} >
							<Form.Control accept=".txt, .js, .php, .py" type="file" style={{ display: 'none' }} ref={hiddenInput} onChange={injectTextFile} />
							<Button  tabIndex="3" size="lg" variant="outline-primary" as="label" htmlFor="formFile" onClick={function() {hiddenInput.current.click()}} >
							  {icons.attachment}
							</Button>
						</span>
						
						<span style={{float:'right', marginLeft:'0.3em'}}>
							
							{!(selfHostedLlm.isBusy.current || aiLlm.isBusy.current || teamLlm.isBusy.current || isPlaying.current) && <Button  tabIndex="2" size="lg" 	id="sendbutton" disabled={!llmEnabled || !userMessage || userMessage.length === 0}  style={{float: 'right', marginRight: '0.2em', color:'black'}} className="btn btn-primary"  onClick={function() {lastLlmTrigger.current="button" ; return false}} type="submit" title="Send" >{icons["send-plane-line"]}</Button>}
							
							{(selfHostedLlm.isBusy.current || aiLlm.isBusy.current || teamLlm.isBusy.current || isPlaying.current) && <Button  tabIndex="2" size="lg" disabled={!llmEnabled}  style={{float: 'right',marginRight: "0.2em", color:'black'}} className="btn  btn-danger"  id="stopLMMButton" onClick={stopLanguageModels}  title="Stop" >{(aiLlm.isBusy.current ) ? icons["loader-line"] : icons["hexagon-fill"]}</Button>}
						</span>
					</span>
					
					{!useLlm && <div style={{color:'red'}} >Language Model API is not configured. Fix in <Link to="/settings" ><Button variant="success" >{icons.settings} Settings</Button></Link></div>}
					
				</form>
				
			</div>
			
			<div id="responseContainer" style={{marginTop:'10em',clear:'both',position:'relative', width:'98%', fontSize: '1em', marginLeft:'0.1em', marginRight:'0.1em'}} >
				<div style={{fontWeight:'bold',textAlign:'left', width:'100%'}} >{Array.isArray(chatHistory) && chatHistory.filter(function(v) {return (v.role === 'system')}).map(function(v) {return v.content}).join("/n")}</div>
				<ListGroup>
				
				{welcomeMessage &&  <ListGroup.Item key={-1} style={{backgroundColor:  "green" }} style={{textAlign:'left'}} ><b style={{marginBottom:'2em'}} >ASSISTANT:</b> {welcomeMessage}</ListGroup.Item>}
				{chatHistoryFiltered.map(function(message,mkey) {
					let tally_in = 0
					let tally_out = 0
						
					let resources = message.content
					if (Array.isArray(resources) && resources.length > 0) {
						resources.forEach(function(resource, rk) {
							tally_in += ((resource && resource.log) ? resource.log.tokens_in : 0)
							tally_out += ((resource && resource.log) ? resource.log.tokens_out : 0)
						})
					} else {
						tally_in += ((message && message.log) ? message.log.tokens_in : 0)
						tally_out += ((message && message.log) ? message.log.tokens_out : 0)
					}
					
					return <ListGroup.Item key={mkey} style={{backgroundColor: ((mkey%2 === 0) ? "green" : "blue")}} style={{textAlign:'left'}} >
					
						<ButtonGroup style={{float:'right', backgroundColor:'#0d6efd;', marginLeft:'1em'}} >
							{!Array.isArray(message.content) && <MessageEditorDialog value={message.content} onChange={function(e) {
								
								if (chatHistoryIdRef.current && chatHistories && chatHistories[chatHistoryIdRef.current] && chatHistories[chatHistoryIdRef.current][mkey]) {
									chatHistories[chatHistoryId][mkey].content = e
									setChatHistories(chatHistories)
									forceRefresh()
								}
							}} />}
							
				
							
							{message.role === "user" && <Button style={{borderRight:'1px solid black', marginRight:'1px'}}  size="sm" variant="primary" onClick={function() {if ((import.meta.env.NODE_ENV === 'development') || window.confirm('Are you sure you want to DELETE the chat history and restart the conversation from here.')) {restartFromChatMessage(mkey)} /*toRestart.current = mkey; setShowConfirm(true)*/}} >{icons.history}</Button>}
							
							<CopyTextButton text={(message && Array.isArray(message.content)) ? message.content.map(function(m) {return m && m.content ? m.content : ''}).join("\n") : (message && message.content ? message.content : '')} icons={icons} />
							
						</ButtonGroup>
						
						<b style={{marginBottom:'2em'}} >{message.role === "user" ? 'USER:' : 'ASSISTANT:'}</b> 
						
						<span>
							{(!simplifiedChat && message.role === "assistant") && <Button variant="outline-primary" style={{fontSize:'1.1em', float:'right'}} >
								<b>Cost</b>&nbsp;&nbsp;{tally_in}/{tally_out}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>${parseFloat(aiUsage.getLlmPrice(config && config.llm && config.llm.openai_model ? config.llm.openai_model : '', tally_in, tally_out).total).toFixed(4)}</b>
							</Button>}
							
							{!simplifiedChat && (Array.isArray(message.content) && (message.role === "assistant") && (message && message.log && message.log.duration))  && <Button style={{float:'right', marginRight:'0.5em'}} variant="outline-primary" >{(message && message.log && message.log.duration) ? (message.log.duration/1000).toFixed(2) + 's' : '' }</Button>}
							
							{(!simplifiedChat && (message.role === "assistant") && !Array.isArray(message.content))  && <>{(message && message.log && message.log.duration) ? <Button style={{float:'right', marginRight:'0.5em' }} variant="outline-primary" >{(message && message.log && message.log.duration) ? (message.log.duration/1000).toFixed(2) + 's' : '' }</Button>: null}{text2Html(message.content)}</>}
							<div style={{clear:'both'}}></div>		
							
							{Array.isArray(message.content)  && chatResourceAccordion(message.content,mkey, accordionSelectedKey, setAccordionSelectedKey)}
							
							
							{((message.role === "user") && !Array.isArray(message.content))  && <>{text2Html(message.content)}</>}
							
						</span>  
						
						{(mkey === chatHistoryFiltered.length - 1 && (aiLlm.isBusy.current || selfHostedLlm.isBusy.current || teamLlm.isBusy.current)) && <b><img style={{height:'6em'}} src="/spinner.svg" /></b>}
						
					</ListGroup.Item>
				})}
				</ListGroup>
				<hr/>
			</div>
			<div style={{position: 'fixed', bottom: 5, right:5, backgroundColor: 'white', height: '2em', width:'2em', borderRadius:'50px'}} >
				<a target='new' href="https://github.com/syntithenai/voice2llm" style={{color:'black'}}  >{icons["github"]}</a>
			</div> 
			<>{[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(function(a) {
				return <div key={a} id={"mermaidrenderer_"+a} style={{position: 'fixed', top:-1000, left: -1000, height:'200px', width:'200px', border:'2px solid green', zIndex: 20}} /> 
			})}</>
			
		</>}
		<br/>
		<br/>
		<br/>
	</div>
}
//10000,left:-1000}} />

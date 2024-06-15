import {React, useState, useEffect, useRef} from 'react'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, ListGroup, ButtonGroup, Col, Row} from 'react-bootstrap'

import useUtils from '../useUtils'
import TextareaAutosize from 'react-textarea-autosize';
import SpeechButton from '../SpeechButton'
import OpenAiWizard from '../components/OpenAiWizard'
//import SystemMessageEditorModal from '../components/SystemMessageEditorModal'
import useSystemMessageManager from '../useSystemMessageManager'
//import LoadTeamModal from '../components/LoadTeamModal'

import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {Link } from 'react-router-dom'
import TeamForm from '../components/TeamForm'

export default function TeamPage(props) {

	//const {chatHistoryTeams, setChatHistoryTeams, user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, category, setCategory,exportTeams,importTeams,setSystemMessage,systemMessage,setSystemConfig, systemConfig, init, saveTeam, loadTeam, teams, setTeams, currentTeam, setCurrentTeam, newTeam, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, chatHistories, setChatHistories, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, chatHistory, setChatHistory, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, playSpeech, chatHistoryId, categories, setCategories} = props
	const {aiUsage, teams, setTeams,roles,  icons, utils, chatHistoryTeams, setChatHistoryTeams, currentTeam, setCurrentTeam, forceRefresh, playSpeech, categories, setCategories, refreshHash, user, token, login, logout, config, chatHistoryId} = props
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
	
	
	
	
	const {openAiBillable} = utils.summariseConfig(config)
	return	<div className="App" id={refreshHash} >
		{<>
			<div id="menu" style={{zIndex:'9', backgroundColor:'lightgrey', border:'1px solid grey', position: 'fixed', top: 0, left: 0, width: '100%', height:'3em'}}  >
				
				<span style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}} >
					<Link style={{marginLeft:'0.1em'}} to="/menu"><Button>{icons.menu}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/chat"><Button>{icons.chat}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/roles"><Button >{icons.teamlarge}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/settings"><Button >{icons.settings}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/help"><Button >{icons.question}</Button></Link>
				</span>
				
				{import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && <span style={{float:'right',marginTop:'0.3em',marginLeft:'0.2em',marginRight:'01em'}} >	
				{(token && token.access_token) && <Button onClick={function() { logout()}} variant="danger" >{!(user && user.picture) && icons["user_logout"]} {(user && user.picture) && <img height="28" width="28" src={user.picture + '?access_token='+token.access_token + '&not-from-cache-please'} />}</Button>}
				
				{!(token && token.access_token) && <Button onClick={function() { login()}} variant="success" >{icons["user"]}</Button>}
				</span>}
				{<Link to="/tokens" ><span style={{color:'black', float:'right', marginTop:'0.7em',marginRight:'1em'}}> <b>{aiUsage.getTotal()}</b>
				</span></Link>}
			</div>
			
			<div id="body" style={{paddingLeft:'0.3em',paddingRight:'0.3em',textAlign:'left', zIndex:'3',position: 'relative', top: '3em', left: 0, width: '100%',  paddingTop:'0.2em', backgroundColor:'white'}}  >
				<h3>Edit Team {teams && currentTeam && teams[currentTeam] && teams[currentTeam].name ? " - " + teams[currentTeam].name : ''}</h3>
				<TeamForm config={config} teamId={params.id} teamsJSON={JSON.stringify(teams)} teams={teams} setTeams={setTeams} icons={icons} forceRefresh={forceRefresh} utils={utils} playSpeech={playSpeech} categories={categories} setCategories={setCategories} roles={roles} />
			</div>
			
			<div style={{position: 'fixed', bottom: 5, right:5, backgroundColor: 'white', height: '2em', width:'2em', borderRadius:'50px'}} >
				<a target='new' href="https://github.com/syntithenai/voice2llm" style={{color:'black'}}  >{icons["github"]}</a>
			</div> 
		</>}
	</div>
}

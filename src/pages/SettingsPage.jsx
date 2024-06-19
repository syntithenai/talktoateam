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

import {Link } from 'react-router-dom'
import ModelSelectorModal from '../components/ModelSelectorModal'

export default function SettingsPage({updateCreditBalance, creditBalance, modelSelector, icons, utils,aiUsage, config,setRoles,setTeams, setConfig, chatHistory, setChatHistory, forceRefresh, refreshHash, token, login, logout, user, availableModels}) {
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
				
				{<Link to="/tokens" ><span style={{color:'black', float:'right', marginTop:'0.7em',marginRight:'1em'}}> <b>${creditBalance > 0 && token && token.access_token  ? parseFloat(creditBalance).toFixed(2) : 0}</b>
				</span></Link>}
			</div> 
			<div id="body" style={{zIndex:'3',position: 'relative', top: '4em', left: 0, width: '100%',  paddingTop:'0.2em',paddingLeft:'0.5em', backgroundColor:'white', height:'100%'}}  >
			  
			  <h3>Settings </h3>
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
		</div>
	)
}
{/* <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="success" onClick={startWizard} >{icons.magic} Setup Wizard</Button>
			  <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="warning" onClick={clearConfig} >{icons.bin} Clear Config And Usage Logs</Button>
			  <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="danger" onClick={clearAll} >{icons.bin} Clear All</Button> */}
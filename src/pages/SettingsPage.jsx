import {React, useState, useEffect} from 'react'
import {Button, Modal, Tabs, Tab} from 'react-bootstrap'

import useIcons from '../useIcons'
// import ModelSelector from '../components/ModelSelector'
import TTSConfigForm from '../components/TTSConfigForm'
import STTConfigForm from '../components/STTConfigForm'
import LLMConfigForm from '../components/LLMConfigForm'
import ToolsConfigForm from '../components/ToolsConfigForm'
//import SystemMessageForm from '../components/SystemMessageForm'

import {Link } from 'react-router-dom'
import ModelSelectorModal from '../components/ModelSelectorModal'

export default function SettingsPage({icons, utils,aiUsage, config,setRoles,setTeams, setConfig, chatHistory, setChatHistory, forceRefresh, refreshHash, token, login, logout, user, availableModels}) {
	console.log(token)
	
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
//data: 'mc_gross=19.95&protection_eligibility=Eligible&address_status=confirmed&payer_id=LPLWNMTBWMFAY&tax=0.00&address_street=1+Main+St&payment_date=20%3A12%3A59+Jan+13%2C+2009+PST&payment_status=Completed&charset=windows-1252&address_zip=95131&first_name=Test&mc_fee=0.88&address_country_code=US&address_name=Test+User&notify_version=2.6&custom=&payer_status=verified&address_country=United+States&address_city=San+Jose&quantity=1&verify_sign=AtkOfCXbDm2hu0ZELryHFjY-Vb7PAUvS6nMXgysbElEn9v-1XcmSoGtf&payer_email=gpmac_1231902590_per%40paypal.com&txn_id=61E67681CH3238416&payment_type=instant&last_name=User&address_state=CA&receiver_email=gpmac_1231902686_biz%40paypal.com&payment_fee=0.88&receiver_id=S8XGHLYDW9T3S&txn_type=express_checkout&item_name=&mc_currency=USD&item_number=&residence_country=US&test_ipn=1&handling_amount=0.00&transaction_subject=&payment_gross=19.95&shipping=0.00'
			
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
				
				{<Link to="/tokens" ><span style={{color:'black', float:'right', marginTop:'0.7em',marginRight:'1em'}}> <b>{aiUsage.getTotal()}</b>
				</span></Link>}
			</div> 
			<div id="body" style={{zIndex:'3',position: 'relative', top: '4em', left: 0, width: '100%',  paddingTop:'0.2em',paddingLeft:'0.5em', backgroundColor:'white', height:'100%'}}  >
			  <h3>Settings </h3><Button onClick={testbal}>BALANCE</Button>
			  <ModelSelectorModal onChange={function(e) {console.log(e)}} value={""} defaultOptions={availableModels}  forceRefresh={forceRefresh} icons={icons}/>
			  <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="success" onClick={startWizard} >{icons.magic} Setup Wizard</Button>
			  <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="warning" onClick={clearConfig} >{icons.bin} Clear Config And Usage Logs</Button>
			  <Button style={{float:'right', fontSize:'0.7em', marginRight:'0.5em'}} variant="danger" onClick={clearAll} >{icons.bin} Clear All</Button>
			  <div style={{color:'red', fontWeight:'bold', fontSize:'0.6em', marginBottom:'0.5em'}}  >Warning! API Keys are stored in browser local storage on this computer.</div>
			  <div style={{ color:'red', fontWeight:'bold', fontSize:'0.6em', marginBottom:'0.5em'}}  >Warning! If you login with Google, API Keys are stored in a private document in your Google Drive.</div>
			  <hr style={{width:'100%',clear:'both'}} />
			  <Tabs
				  defaultActiveKey="llm"
				  id="configtabs"
				  className="mb-3"
				>
				<Tab eventKey="llm" title="Language Model">
					<LLMConfigForm aiUsage={aiUsage} configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} useLlm={useLlm} />
				</Tab>
				<Tab eventKey="stt" title="Speech To Text">
					<STTConfigForm  configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} />
				</Tab>
				<Tab eventKey="tts" title="Text To Speech">
					<TTSConfigForm  configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} />
				</Tab>
				<Tab eventKey="tools" title="Tools">
					<ToolsConfigForm  configIn={config} setConfig={setConfig}  forceRefresh={forceRefresh} />
				</Tab>
				  
			</Tabs>	  
				  
			  
			  
			</div>
		</div>
	)
}

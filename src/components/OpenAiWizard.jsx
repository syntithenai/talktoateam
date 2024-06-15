import {Form, Row, Col, Button} from 'react-bootstrap';
import {useState, useEffect} from 'react'
import useIcons from '../useIcons'

export default function OpenAiWizard({user, token, login, logout, config, setConfig, forceRefresh}) {
	
	const [key,setKey] = useState('')
	const [groqKey,setGroqKey] = useState('')
	const [url,setUrl] = useState('')
	const icons = useIcons()
	
	useEffect(function() {
		setKey(config && config.llm && config.llm.openai_key ? config.llm.openai_key : '')
	},[JSON.stringify(config)])
	
	function setApiKey() {
		if (key) {
			config = config ? config : {}
			config.llm = config.llm ? config.llm : {}
			config.stt = config.stt ? config.stt : {}
			config.tts = config.tts ? config.tts : {}
			config.llm.openai_key = key
			config.llm.use = "openai"
			config.stt.openai_key = key
			config.stt.use = "openai"
			config.tts.openai_key = key
			config.tts.use = "openai"
			setConfig(config)
			forceRefresh()
		}
	}
	
	function setGroqApiKey() {
		if (groqKey) {
			config = config ? config : {}
			config.llm = config.llm ? config.llm : {}
			config.stt = config.stt ? config.stt : {}
			config.tts = config.tts ? config.tts : {}
			config.llm.openai_key = groqKey
			config.llm.openai_hosted_url = "https://api.groq.com/openai"
			config.llm.openai_model = "llama3-8b-8192"
			config.llm.use = "openai"
			//config.stt.openai_key = groqKey
			//config.stt.use = "openai"
			//config.tts.openai_key = groqKey
			//config.tts.use = "openai"
			setConfig(config)
			forceRefresh()
		}
	}
	
	function setUseLocal() {
		config = config ? config : {}
		config.llm = config.llm ? config.llm : {}
		config.llm.use = 'none'
		setConfig(config)
		forceRefresh()
	}
	
	function setSelfHosted() {
		if (url) {
			config = config ? config : {}
			config.llm = config.llm ? config.llm : {}
			config.stt = config.stt ? config.stt : {}
			config.tts = config.tts ? config.tts : {}
			config.llm.self_hosted_url = "https://"+url+":443"
			config.llm.use = "self_hosted"
			config.stt.self_hosted_url = "https://"+url+":444/asr"
			config.stt.use = "self_hosted"
			config.tts.self_hosted_url = "https://"+url+":446"
			config.tts.use = "self_hosted"
			setConfig(config)
			forceRefresh()
		}
	}
	
	function setDevServer() {
		let url="peppertrees.asuscomm.com"
		config = config ? config : {}
		config.llm = config.llm ? config.llm : {}
		config.stt = config.stt ? config.stt : {}
		config.tts = config.tts ? config.tts : {}
		config.llm.self_hosted_url = "https://"+url+":443"
		config.llm.use = "self_hosted"
		config.stt.self_hosted_url = "wss://"+url+":444/stt"
		config.stt.use = "self_hosted"
		config.tts.self_hosted_url = "https://"+url+":446"
		config.tts.use = "self_hosted"
		setConfig(config)
		forceRefresh()
	}
	//<Button  style={{marginLeft:'3em'}} variant="warning" onClick={setDevServer} >
        //Dev/Demo Server 
      //</Button>
      
	return <div style={{marginLeft:'0.5em'}} >
	<h5 style={{	marginTop:'1em',marginBottom:'1em'}} >Quick Start 
	  
      {!(token && token.access_token) && <Button   style={{marginLeft:'3em'}}  onClick={function() { login()}} variant="primary" >Login to Load Configuration</Button>}
    
    	<Button  style={{marginLeft:'3em'}} variant="danger" onClick={setUseLocal} >
        Skip
      </Button>
    
    </h5>
    
	<div style={{borderBottom: '2px solid black'}} >
	<Row>
		<Col className='mb-3' style={{border:'1px solid black', paddingTop:'1.5em',paddingBottom:'1.5em', paddingLeft:'1em', paddingRight:'1em'}} >
			<b style={{fontSize:'1em', marginBottom:'1em'}} >The easiest way to get going is to enter an API key for OpenAI.</b><br/>
			<br/>
			<div style={{marginBottom:'1em'}}>
			<a target="_new" href="https://platform.openai.com/api-keys" style={{textDecoration:'none'}} ><Button variant="primary" style={{}} >Get API Key</Button></a>
			</div>
			<Form.Group className="mb-3" controlId="formKey">
				<Form.Control type="text" placeholder="Enter key" style={{width:'80%', float:'left'}} value={key} onChange={function(e) {setKey(e.target.value)}} />
			
				<Button variant="primary" style={{ float:'right', fontStyle:'italic', float:'left'}} onClick={function() {
					navigator.clipboard.readText()
					.then(text => {
					  document.getElementById('pasteArea').innerText = text;
					})
					.catch(err => {
					  console.error('Failed to read clipboard contents: ', err);
					});
				}} >{icons.clipboard}</Button>
				<Button style={{float:'left'}} disabled={!key} variant="success" onClick={setApiKey} >
				Setup OpenAi
				</Button>
				<div style={{clear:'both'}} />
				
		  </Form.Group>
		
	</Col>
	
	
	<Col className='mb-3' style={{border:'1px solid black', paddingTop:'1.5em',paddingBottom:'1.5em', paddingLeft:'1em', paddingRight:'1em'}} >
			<b style={{fontSize:'1em', marginBottom:'1em'}} >Alternately GroqCloud is fast and cheap for open models.</b><br/>
			<br/>
			<div style={{marginBottom:'1em'}}>
			<a target="_new" href="https://console.groq.com/keys" style={{textDecoration:'none'}} ><Button variant="primary" style={{}} >Get API Key</Button></a>
			</div>
			<Form.Group className="mb-3" controlId="formKey">
				<Form.Control type="text" placeholder="Enter key" style={{width:'80%', float:'left'}} value={groqKey} onChange={function(e) {setGroqKey(e.target.value)}} />
			
				<Button variant="primary" style={{ float:'right', fontStyle:'italic', float:'left'}} onClick={function() {
					navigator.clipboard.readText()
					.then(text => {
					  document.getElementById('pasteArea').innerText = text;
					})
					.catch(err => {
					  console.error('Failed to read clipboard contents: ', err);
					});
				}} >{icons.clipboard}</Button>
				<Button style={{float:'left'}} disabled={!groqKey} variant="success" onClick={setGroqApiKey} >
				Setup GroqCloud
				</Button>
				<div style={{clear:'both'}} />
			
				
		  </Form.Group>
		
	</Col>
	
	<Col style={{border:'1px solid black', paddingTop:'1.5em',paddingBottom:'1.5em', paddingLeft:'1em', paddingRight:'1em'}}  className='mb-3'>
		<b>Technical folks can run your own language model and other services easily using Docker. </b>
		<span style={{display:'block',marginTop:'1em',marginLeft:'3em', fontStyle:'italic'}} >See <a href="https://github.com/syntithenai/voice2llm" target="-new" >https://github.com/syntithenai/voice2llm</a></span>
		<Form.Group className="mb-3" controlId="formUrl">
        <Form.Control style={{float:'left', width:'80%'}} type="text" placeholder="Enter hostname or IP address" value={url} onChange={function(e) {setUrl(e.target.value)}} />
        <Button style={{float:'left'}}  disabled={!key} variant="success" onClick={setSelfHosted} >
			Setup Self Hosted Domain Name
		  </Button>
		  <div style={{clear:'both'}} />
        <div><Form.Text className="text-muted">
        eg 192.168.1.22 or localhost or mydomain.com 
        </Form.Text></div>
        
      </Form.Group>
    </Col>  
	</Row>
	<Row>
		<Col>
			<Form.Text className="text-muted">
				  <div style={{ color:'red', fontWeight:'bold'}}  >Warning! API Keys are stored in browser local storage on this computer.</div>
				  <div style={{ color:'red', fontWeight:'bold'}}  >Warning! If you login with Google, API Keys are stored in private document in your Google Drive.</div>
				  <div style={{ color:'red', fontWeight:'bold'}}  >API Keys are used strictly for relevant API requests.</div>
				</Form.Text>
		</Col>  
	</Row>
	<Row style={{borderTop:'2px solid black', marginTop:'1em', marginBottom:'1em'}} >
		<Col>
			<Form.Text className="text-muted">
				  <span style={{ color:'black', fontWeight:'bold'}}  >This an Open Source project released under an MIT licence, the <a target='new' href="https://github.com/syntithenai/voice2llm" style={{color:'black', borderRadius:'50px'}}  >	source code is available on Github</a><a target='new' href="https://github.com/syntithenai/voice2llm" style={{color:'black', borderRadius:'50px'}}  >{icons["github"]}  </a>
				  
				  </span>
				  <span  >
					<form action="https://www.paypal.com/donate" method="post" target="_new">
					  <input type="hidden" name="hosted_button_id" value="3YUZQ4TGLEVCE" />
					  <input type="image" style={{transform: 'rotate(20deg)', height:'60px', width:'50px'}} src="https://pics.paypal.com/00/s/OGVmNmM4NTQtMGQ0MS00NGVhLWI0NDgtNzMxYWRkMDY5NzIy/file.PNG" border="0" name="submit" title="Buy me a beer!" alt="Buy me a beer!" />
					  <img alt="" border="0" src="https://www.paypal.com/en_AU/i/scr/pixel.gif" width="1" height="1" />
					</form>
				  </span>
				</Form.Text>
		</Col>  
	</Row>
	</div>
	</div>
}

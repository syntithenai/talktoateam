import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, FormCheck } from 'react-bootstrap';
//import TextDropdownComponent  from './TextDropdownComponent'

const LLMConfigForm = ({login, user, creditBalance, icons, aiUsage, configIn, setConfig, forceRefresh, useLlm}) => {
 	const [config, setConfigInner] = useState({})
	useEffect(function() {
		//console.log('llm confchange',configIn)
		setConfigInner(configIn)
	},[JSON.stringify(configIn)])
	
	function setConfigValue(key,value) {
	   let c = config ? config : {}
		if (!c.llm) c.llm = {}
		c.llm[key] = value
		setConfig(c)
		forceRefresh()
		//console.log(c)
   }

  return (
    <Form onSubmit={function(e) {e.preventDefault(); return false}}>
		<h5>Language Model</h5>
	
		<div className="border p-3 mb-3">
			<h5  >Your Plan</h5>
			{!user && <Form.Text>Buy credit for quick and easy access to a range of providers and other services through our endpoints.<br/><br/><Button variant="success" onClick={login} >Login</Button> &nbsp;&nbsp;to see your credit.</Form.Text>}
			{user && <Row className="mb-3">
				<span style={{fontWeight:'bold', marginBottom:'1em'}} >Balance: ${parseFloat(creditBalance).toFixed(2)}</span>

				{creditBalance > 0 && <div>You have access to a wide range of language models from providers OpenAI, Groqcloud, TogetherAI and DeepInfra. Allocate your preferred models, then set the preferred model for various <i>Personas </i> in your <i>Teams</i>  to enable workflows encompassing a range of providers.</div>}
			</Row>}
		</div>

			  
    	<div className="border p-3 mb-3">
		<h5  >Bring Your Own Keys</h5>
		<Form.Text>Providers that support CORS can be used directly from your web browser. Enter your keys here to save money by skipping our proxy.</Form.Text>
		<br/><Form.Text>Checkout the tools section to configure your own URLs for websearch and code execution services.</Form.Text>
			<div style={{color:'red', fontWeight:'bold', fontSize:'0.6em', marginTop:'1.5em'}}  >Warning! API Keys are stored in browser local storage on this computer.</div>
			<div style={{ color:'red', fontWeight:'bold', fontSize:'0.6em', marginBottom:'1em', marginTop:'1em'}}  >Warning! If you login with Google, API Keys are stored in a private document in your Google Drive to enable sync between devices.</div>
		  	<Row className="mb-3">
				<Form.Group as={Col} controlId="openaiKey">
				<Form.Label>{icons.openai} OpenAI API Key</Form.Label>
				<Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >See <a target="_new" href="https://platform.openai.com/api-keys" >https://platform.openai.com/api-keys</a></span></Form.Text>
				
				<Form.Control
					type="text"
					value={config && config.llm && config.llm.openai_key}
					onChange={(e) => {setConfigValue('openai_key',e.target.value)}}
				/>
				<Form.Label style={{marginTop:'1em'}} ><img src="/grokcloud.ico"  style={{height:'24px', width:'24px'}} /> GroqCloud API Key</Form.Label>
				<Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >See <a target="_new" href="https://console.groq.com/keys" >https://console.groq.com/keys</a></span></Form.Text>
				
				<Form.Control
					type="text"
					value={config && config.llm && config.llm.groqcloud_key}
					onChange={(e) => {setConfigValue('groqcloud_key',e.target.value); }}
				/>
				</Form.Group>
				
			</Row>
		</div>
      
      <div className="border p-3 mb-3">
		<h5 >Self Hosted</h5>
		<Form.Text>Work with any Language Model Server that hosts an OpenAI compatible chat endpoint.</Form.Text>
        <Form.Group controlId="llmUrl">
          <Form.Label>Custom URL</Form.Label>
		  
          <Form.Control
			type="text"
			value={config && config.llm && config.llm.self_hosted_url}
			onChange={(e) => {setConfigValue('self_hosted_url',e.target.value)}}
		  />

		<Form.Label>Custom URL Key</Form.Label>
          <Form.Control
			type="text"
			value={config && config.llm && config.llm.self_hosted_key}
			onChange={(e) => {setConfigValue('self_hosted_key',e.target.value)}}
		  />
         
        <Form.Label>Custom Models</Form.Label>
          <Form.Control
			type="text"
			placeholder="eg testLLM-8B,codeCUSTOM-joel-2B"
			value={config && config.llm && config.llm.self_hosted_models}
			onChange={(e) => {setConfigValue('self_hosted_models',e.target.value)}}
		  />
         
        </Form.Group>
        
      </div>
      
    </Form>
  );
};

export default LLMConfigForm;

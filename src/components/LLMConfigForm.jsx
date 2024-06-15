import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, FormCheck } from 'react-bootstrap';
//import TextDropdownComponent  from './TextDropdownComponent'

const LLMConfigForm = ({aiUsage, configIn, setConfig, forceRefresh, useLlm}) => {
 	const [config, setConfigInner] = useState({})
	useEffect(function() {
		//console.log('llm confchange',configIn)
		setConfigInner(configIn)
	},[JSON.stringify(configIn)])
	
	//const [openAiKey, setOpenAiKey] = useState(config && config.llm && config.llm.openai_key? config.llm.openai_key : '')
	//const [openAiModel, setOpenAiModel] = useState(config && config.llm && config.llm.openai_model? config.llm.openai_model : 'gpt-3.5-turbo-0125')
	//const [openAiUrl, setOpenAiUrl] = useState(config && config.llm && config.llm.openai_url? config.llm.openai_url : '')
	//const [geminiKey, setGeminiKey] = useState(config && config.llm && config.llm.google_gemini_key ? config.llm.google_gemini_key : '')
	//const [selfHostedUrl, setSelfHostedUrl] = useState(config && config.llm && config.llm.self_hosted_url ? config.llm.self_hosted_url : '')
	//const [modelType, setModelType] = useState(config && config.llm && config.llm.self_hosted_model_type ? config.llm.self_hosted_model_type : 'orca-mini-3')
	

	
	//// openai,gemini,self_hosted
	//const [useLlm, setUseLlmInner] = useState(config && config.llm && config.llm.use ? config.llm.use : '')
	//function setUseLlm(v) {
		//setUseLlmInner(v)
		//setConfigValue('use',v)
	//}
 
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
    {(!useLlm) && <b style={{color:'red'}} >You need to choose a language model to chat with.</b>}
    	<div className="border p-3 mb-3">
		  <Row className="mb-3">
			<Form.Group as={Col} controlId="openaiKey">
			  <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				
				checked={(config && config.llm && config.llm.use === 'openai') ? true : false}
				onChange={(e) => {setConfigValue('use',  !(config && config.llm && config.llm.use === 'openai') ?'openai' : '')}}
			  />
			  <Form.Label>OpenAI API Key</Form.Label>
			  <Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >See <a target="_new" href="https://platform.openai.com/api-keys" >https://platform.openai.com/api-keys</a></span></Form.Text>
			  
			  <Form.Control
				type="text"
				value={config && config.llm && config.llm.openai_key}
				onChange={(e) => {setConfigValue('openai_key',e.target.value); setConfigValue('use','openai')}}
			  />
			  <Form.Label>Default OpenAI Model</Form.Label>
			  <Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >Prices per million tokens</span></Form.Text>
			  
			  <Form.Select style={{width:'30%', float:'left'}} value={''}
				onChange={(e) => {setConfigValue('openai_model',e.target.value); setConfigValue('use','openai')}}
				 aria-label="Select model">
					<option></option>
					   {(aiUsage) &&  Object.keys(aiUsage.pricing).map(function(modelKey) {
						   return <option key={modelKey} value={modelKey}>{modelKey}</option>
					   })} 
					  
				</Form.Select>
				<Form.Control
			  style={{width:'70%', float:'left'}}
				type="text"
				value={config && config.llm && config.llm.openai_model}
				onChange={(e) => {setConfigValue('openai_model',e.target.value); setConfigValue('use','openai')}}
			  />
			  	<div style={{clear:'both'}} />
				
			  <Form.Label>URL</Form.Label>
			  <Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >OpenAI Compatible Endpoint</span></Form.Text>
			  <Form.Select style={{width:'15%', float:'left'}} value={''}
				onChange={(e) => {setConfigValue('openai_hosted_url',e.target.value); setConfigValue('use','openai')}}
				 aria-label="Select host">
					<option></option>
					<option value="https://api.openai.com" >OpenAI</option>
					<option value="https://api.groq.com/openai" >GroqCloud</option>  
					<option value="https://api.fireworks.ai/inference/v1" >Together.ai</option>  
					<option value="https://api.deepinfra.com/v1/openai" >Deepinfra.com</option>  
					
				</Form.Select>
			  <Form.Control
			  style={{width:'85%', float:'left'}}
				type="text"
				value={config && config.llm && config.llm.openai_hosted_url}
				onChange={(e) => {setConfigValue('openai_hosted_url',e.target.value); setConfigValue('use','openai_hosted_urls')}}
			  />
			</Form.Group>
			
		  </Row>
		 </div>
      
      <div className="border p-3 mb-3">
		<h5  ></h5>
		
        <Form.Group controlId="llmUrl">
          <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				checked={config && config.llm && config.llm.use === 'self_hosted'}
				onChange={(e) => {setConfigValue('use',!(config && config.llm && config.llm.use === 'self_hosted') ? 'self_hosted' : '')}}
		  />
		  <Form.Label>Self Hosted URL</Form.Label>
          <Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >See <a href="https://github.com/syntithenai/voice2llm" target="-new" >https://github.com/syntithenai/voice2llm</a></span></Form.Text>
          <Form.Control
			type="text"
			value={config && config.llm && config.llm.self_hosted_url}
			onChange={(e) => {setConfigValue('self_hosted_url',e.target.value); setConfigValue('use','self_hosted')}}
		  />
         
        </Form.Group>
        
      </div>
      
    </Form>
  );
};

export default LLMConfigForm;

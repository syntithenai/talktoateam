import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, FormCheck, ListGroup } from 'react-bootstrap';
import ModelSelectorModal from './ModelSelectorModal';
//import TextDropdownComponent  from './TextDropdownComponent'

export default function PreferredModelsConfigForm({availableModels, modelSelector, creditBalance, icons, token, aiUsage, configIn, setConfig, forceRefresh, useLlm})  {
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
   let labelStyle = {float:'left', maxWidth:'10em'}
   let groupStyle = {border:"1px lightblue", marginBottom:'0.5em'}
  return (
    <Form onSubmit={function(e) {e.preventDefault(); return false}}>
    	<div className="border p-3 mb-3">
			<h3>Preferred Models</h3>
		  <Row className="mb-3">
			<Form.Group  style={groupStyle} as={Row} controlId="openaiKey">
			  <Form.Label style={labelStyle} >Basic</Form.Label>
			  <ModelSelectorModal  icons={icons} defaultOptions={availableModels}  value={config && config.llm && config.llm.basic_model && modelSelector.lookupModel(config.llm.basic_model)  ? config.llm.basic_model : modelSelector.getModelKey('basic')} onChange={function(e) {setConfigValue('basic_model', e)}} />
			</Form.Group>
			<Form.Group  style={groupStyle}  as={Row} controlId="openaiKey">
			  <Form.Label style={labelStyle} >Small</Form.Label>
			  <ModelSelectorModal  icons={icons} defaultOptions={availableModels}  value={config && config.llm && config.llm.small_model && modelSelector.lookupModel(config.llm.small_model) ? config.llm.small_model : modelSelector.getModelKey('small')} onChange={function(e) {setConfigValue('small_model', e)}} />
			  </Form.Group>
			<Form.Group  style={groupStyle}  as={Row} controlId="openaiKey">
			  <Form.Label style={labelStyle} >Medium</Form.Label>
			  <ModelSelectorModal  icons={icons} defaultOptions={availableModels}  value={config && config.llm && config.llm.medium_model && modelSelector.lookupModel(config.llm.medium_model) ? config.llm.medium_model : modelSelector.getModelKey('medium')} onChange={function(e) {setConfigValue('medium_model', e)}} />
			  </Form.Group>
			<Form.Group  style={groupStyle}  as={Row} controlId="openaiKey">
			  <Form.Label style={labelStyle} >Large</Form.Label>
			  <ModelSelectorModal  icons={icons} defaultOptions={availableModels}  value={config && config.llm && config.llm.large_model && modelSelector.lookupModel(config.llm.large_model) ? config.llm.large_model : modelSelector.getModelKey('large')} onChange={function(e) {setConfigValue('large_model', e)}} />
			  </Form.Group>
			<Form.Group  style={groupStyle}  as={Row} controlId="openaiKey">
			  <Form.Label style={labelStyle} >Advanced</Form.Label>
			  <ModelSelectorModal  icons={icons} defaultOptions={availableModels} value={config && config.llm && config.llm.advanced_model && modelSelector.lookupModel(config.llm.advanced_model) ? config.llm.advanced_model : modelSelector.getModelKey('advanced')} onChange={function(e) {setConfigValue('advanced_model', e)}} />
			  </Form.Group>
			<Form.Group  style={groupStyle}  as={Row} controlId="openaiKey">
			<hr/>
			 </Form.Group>
			<Form.Group  style={groupStyle}  as={Row} controlId="openaiKey">
			  <Form.Label style={labelStyle} >Instruct</Form.Label>
			  <ModelSelectorModal  icons={icons} defaultOptions={availableModels} value={config && config.llm && config.llm.instruct_model && modelSelector.lookupModel(config.llm.instruct_model) ? config.llm.instruct_model : modelSelector.getModelKey('instruct')} onChange={function(e) {setConfigValue('instruct_model', e)}} />
			  </Form.Group>
			<Form.Group  style={groupStyle}  as={Row} controlId="openaiKey">
			  <Form.Label style={labelStyle} >Code</Form.Label>
			  <ModelSelectorModal  icons={icons} defaultOptions={availableModels} value={config && config.llm && config.llm.code_model && modelSelector.lookupModel(config.llm.code_model) ? config.llm.code_model : modelSelector.getModelKey('code')} onChange={function(e) {setConfigValue('code_model', e)}} />
			</Form.Group>
			
		  </Row>
		 </div>
      
		
      
    </Form>
  );
};


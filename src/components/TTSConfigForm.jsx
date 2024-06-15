import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, FormCheck } from 'react-bootstrap';
import useWebSpeechTts from '../useWebSpeechTts'
import useMeSpeakTts from '../useMeSpeakTts'

const TTSConfigForm = ({configIn, setConfig, forceRefresh}) => {
	const [config, setConfigInner] = useState({})
	useEffect(function() {
		setConfigInner(configIn)
	},[JSON.stringify(configIn)])
	
	const webTts = useWebSpeechTts({})
	const meTts = useMeSpeakTts({})
	
  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    return false
  };

	function setConfigValue(key,value) {
		let c = config ? config : {}
		if (!c.tts) c.tts = {}
		c.tts[key] = value
		setConfig(c)
		forceRefresh()
   }

  return (
    <Form onSubmit={handleSubmit}>
		<div className="border p-3 mb-3">
			<h5>Text To Speech</h5>
		  <Row className="mb-3">
			<Form.Group as={Col} controlId="openaiKey">
			  <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				checked={config && config.tts && config.tts.use === 'openai'}
				onChange={(e) => {setConfigValue('use',!(config && config.tts && config.tts.use === 'openai') ? 'openai' : '')}}
			  />
			  <Form.Label>OpenAI API Key</Form.Label>
			  
			  <Form.Control
				type="text"
				value={config && config.tts && config.tts.openai_key}
				onChange={(e) => {setConfigValue('openai_key',e.target.value); setConfigValue('use','openai')}}
			  />
			</Form.Group>
			
			<Form.Group controlId="ttsUrl" style={{marginTop:'0.2em'}}>
			  <FormCheck
					style={{display:'inline', marginRight:'0.2em'}} 
					type="checkbox"
					checked={config && config.tts && config.tts.use === 'self_hosted'}
					onChange={(e) => {setConfigValue('use',!(config && config.tts && config.tts.use === 'self_hosted')? 'self_hosted' : '')}}
			  />
			  <Form.Label>Self Hosted URL</Form.Label>
			  <Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >eg https://192.168.1.56:5002</span></Form.Text>
			<Form.Control
				type="text"
				value={config && config.tts && config.tts.self_hosted_url}
				onChange={(e) => {setConfigValue('self_hosted_url',e.target.value); setConfigValue('use','self_hosted')}}
			  />
			</Form.Group>
			<div style={{border:'1px solid grey', padding:'0.5em', marginTop:'1em' }} >
				<h6>Offline</h6>
				<Form.Group controlId="ttsWebSpeech" style={{marginTop:'0.2em'}}>
					  <FormCheck
							style={{display:'inline', marginRight:'0.2em'}} 
							type="checkbox"
							checked={config && config.tts && config.tts.use === 'web_speech'}
							onChange={(e) => {setConfigValue('use',!(config && config.tts && config.tts.use === 'web_speech') ? 'web_speech' : '')}}
					  />
					  <Form.Label>Web Speech</Form.Label>
					   
					<Form.Select aria-label="Select voice">
					   <option></option>
					   {(webTts.availableVoices && webTts.availableVoices.length > 0) && webTts.availableVoices.map(function(voice,vk) {return <option value={vk} >{voice.name}</option>}) }
					</Form.Select>
				</Form.Group>
				<Form.Group controlId="ttsMeSpeech" style={{marginTop:'0.2em'}}>
					  <FormCheck
							style={{display:'inline', marginRight:'0.2em'}} 
							type="checkbox"
							checked={config && config.tts && config.tts.use === 'me_speak'}
							onChange={(e) => {setConfigValue('use',!(config && config.tts && config.tts.use === 'me_speak') ? 'me_speak' : '')}}
					  />
					  <Form.Label>MeSpeak</Form.Label>
					  
					
				</Form.Group>
			</div>
		  </Row>
		 </div>
     
    </Form>
  );
};

export default TTSConfigForm;

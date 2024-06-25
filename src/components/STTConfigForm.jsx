import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, FormCheck } from 'react-bootstrap';

const STTConfigForm = ({configIn, setConfig, forceRefresh}) => {
  const [config, setConfigInner] = useState({})
	useEffect(function() {
		setConfigInner(configIn)
	},[JSON.stringify(configIn)])

//// State variables to manage the input values
  //const [openaiKey, setOpenaiKey] = useState(config && config.stt && config.stt.openai_key ? config.stt.openai_key : '');
  //const [sttUrl, setSttUrl] = useState(config && config.stt && config.stt.self_hosted_url ? config.stt.self_hosted_url : '');
  //const [localWhisperModel, setLocalWhisperModel] = useState(config && config.stt && config.stt.local_whisper_model ? config.stt.local_whisper_model : '')
  //const [useStt, setUseSttInner] = useState(config && config.stt && config.stt.use ? config.stt.use : '')  // local, openai, self_hosted
  //const [useHotword, setUseHotword] = useState(config && config.stt && config.stt.use_hotword ? config.stt.use_hotword : '')  // local, openai, self_hosted
	
	
	
  //function setUseStt(v) {
		//setUseSttInner(v)
		//setConfigValue('use',v)
	//}
  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    return false
  };

	function setConfigValue(key,value) {
		//console.log("SC",key,value)
		let c = config ? config : {}
		if (!c) c = {}
		if (!c.stt) c.stt = {}
		c.stt[key] = value
		setConfig(c)
		forceRefresh()
   }

  return (
    <Form onSubmit={handleSubmit}>
		<div className="border p-3 mb-3">
			<h5>Speech To Text</h5>
		 
		
		<Row className="mb-3">
			<Form.Group as={Col} controlId="openaiKey">
			  <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				checked={config && config.stt && config.stt.use === 'openai' ? true : false}
				onChange={(e) => {setConfigValue('use',!(config && config.stt && config.stt.use === 'openai') ? 'openai' : '')}}
			  />
			  <Form.Label>OpenAI API Key</Form.Label>
			  <Form.Control
				type="text"
				value={config && config.stt && config.stt.openai_key ? config.stt.openai_key : ''}
				onChange={(e) => {setConfigValue('openai_key',e.target.value);  setConfigValue('use','openai')}}
			  />
			</Form.Group>
			
			
			
			<Form.Group controlId="sttUrl" style={{marginTop:'0.2em'}} >
            <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				checked={config && config.stt && config.stt.use === 'self_hosted' ? true : false}
				onChange={(e) => {setConfigValue('use',!(config && config.stt && config.stt.use === 'self_hosted') ? 'self_hosted' : '') }}
			  />
		  <Form.Label>Self Hosted URL</Form.Label>
		  <Form.Text>See https://github.com/syntithenai/whisper-websocket-streaming</Form.Text>
          <Form.Control
            type="text"
            value={config && config.stt && config.stt.self_hosted_url ? config.stt.self_hosted_url : ''}
            onChange={(e) => {setConfigValue('self_hosted_url',e.target.value); setConfigValue('use','self_hosted')}}
          />
        </Form.Group>
       
		  </Row>
		 </div>
      

      
    </Form>
  );
};

export default STTConfigForm;

{/* <Form.Group as={Col} controlId="groqcloudKey">
			  <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				checked={config && config.stt && config.stt.use === 'groq' ? true : false}
				onChange={(e) => {setConfigValue('use',!(config && config.stt && config.stt.use === 'groq') ? 'groq' : '')}}
			  />
			  <Form.Label>GroqCloud API Key</Form.Label>
			  <Form.Control
				type="text"
				value={config && config.stt && config.stt.groq_key ? config.stt.groq_key : ''}
				onChange={(e) => {setConfigValue('groq_key',e.target.value);  setConfigValue('use','groq')}}
			  />
			</Form.Group> */}
 //<div style={{border:'1px solid grey', padding:'0.5em', marginTop:'1em' }} >
			//<h6>Offline</h6>
        //<Form.Group as={Col} controlId="openaiKey">
			  //<FormCheck
			    //style={{display:'inline', marginRight:'0.2em'}} 
				//type="checkbox"
				//checked={config && config.stt && config.stt.use === 'local'}
				//onChange={(e) => {setConfigValue('use',!(config && config.stt && config.stt.use === 'local') ? 'local' : '') }}
			  ///>
			  //<Form.Label>Local Whisper Model</Form.Label>
			   //<Form.Select aria-label="Whisper Model"
				//value={config && config.stt && config.stt.local_whisper_model}
				//onChange={(e) => {setConfigValue('local_whisper_model',e.target.value); setConfigValue('use','local')}}
			   //>
				  //<option value=""></option>
				  //<option value="Xenova/whisper-tiny">Tiny</option>
				  //<option value="Xenova/whisper-small">Small</option>
				  //<option value="Xenova/whisper-medium">Medium</option>
				//</Form.Select>
			  
			//</Form.Group>
        
        //</div>

 //<Row className="mb-3">
			//<Form.Group as={Col} controlId="useHotwordKey">
			  //<Form.Label>Use Hotword (<i>Hey Edison</i>)?</Form.Label>
			 //<FormCheck
			    //style={{display:'inline', marginLeft:'1em'}} 
				//type="checkbox"
				//checked={config && config.stt && config.stt.use_hotword}
				//onChange={(e) => setConfigValue('use_hotword',!(config && config.stt && config.stt.use_hotword))}
			  ///>
			//</Form.Group>  
		//</Row>

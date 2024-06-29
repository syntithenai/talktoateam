import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, FormCheck } from 'react-bootstrap';

export default function EmbeddingsConfigForm ({configIn, setConfig, forceRefresh})  {
  const [config, setConfigInner] = useState({})
	useEffect(function() {
		setConfigInner(configIn)
	},[JSON.stringify(configIn)])


  const handleSubmit = (event) => {
    event.preventDefault();
    return false
  };

	function setConfigValue(key,value) {
		//console.log("SC",key,value)
		let c = config ? config : {}
		if (!c) c = {}
		if (!c.embeddings) c.embeddings = {}
		c.embeddings[key] = value
		setConfig(c)
		forceRefresh()
   }
  
  return (
    <Form onSubmit={handleSubmit}>



		<div className="border p-3 mb-3">
			<h5>Embeddings</h5>
		<Row className="mb-3">
			<Form.Group as={Row} controlId="openaiKey">
				<Form.Label>Max Fragment Length (tokens)</Form.Label>
				<Form.Control
					type="text"
					value={config && config.embeddings && config.embeddings.max_length ? config.embeddings.max_length : '8191'}
					onChange={(e) => {setConfigValue('max_length',e.target.value);}}
			  />
			</Form.Group>
			<hr style={{marginTop:'1em', marginBottom:'1em'}} />
			<Form.Group as={Col} controlId="openaiKey">
			  <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				checked={config && config.embeddings && config.embeddings.use === 'openai' ? true : false}
				onChange={(e) => {setConfigValue('use',!(config && config.embeddings && config.embeddings.use === 'openai') ? 'openai' : '')}}
			  />
			  <Form.Label>OpenAI API Key</Form.Label>
			  <Form.Control
				type="text"
				value={config && config.embeddings && config.embeddings.openai_key ? config.embeddings.openai_key : ''}
				onChange={(e) => {setConfigValue('openai_key',e.target.value);  setConfigValue('use','openai')}}
			  />
			  <Form.Label>OpenAI Embedding Model</Form.Label>
			  <Form.Select value={config && config.embeddings && config.embeddings.openai_model ? config.embeddings.openai_model : ''}
				onChange={(e) => {setConfigValue('openai_model',e.target.value);  setConfigValue('use','openai')}} >
				<option >text-embedding-3-small</option>
				<option >text-embedding-3-large</option>
				<option >text-embedding-ada-002</option>
				</Form.Select>
			</Form.Group>
			
			
			<hr style={{marginTop:'1em', marginBottom:'1em'}} />
			<Form.Group controlId="sttUrl" style={{marginTop:'0.2em'}} >
            <FormCheck
			    style={{display:'inline', marginRight:'0.2em'}} 
				type="checkbox"
				checked={config && config.embeddings && config.embeddings.use === 'self_hosted' ? true : false}
				onChange={(e) => {setConfigValue('use',!(config && config.embeddings && config.embeddings.use === 'self_hosted') ? 'self_hosted' : '') }}
			  />
		  <Form.Label>Self Hosted URL</Form.Label>
		  <Form.Text></Form.Text>
          <Form.Control
            type="text"
            value={config && config.embeddings && config.embeddings.self_hosted_url ? config.embeddings.self_hosted_url : ''}
            onChange={(e) => {setConfigValue('self_hosted_url',e.target.value); setConfigValue('use','self_hosted')}}
          />
          <Form.Label>Self Hosted Key</Form.Label>
		  <Form.Text></Form.Text>
          <Form.Control
            type="text"
            value={config && config.embeddings && config.embeddings.self_hosted_key ? config.embeddings.self_hosted_key : ''}
            onChange={(e) => {setConfigValue('self_hosted_key',e.target.value); setConfigValue('use','self_hosted')}}
          />
        </Form.Group>
       
		  </Row>
		 </div>
      

      
    </Form>
  );
};


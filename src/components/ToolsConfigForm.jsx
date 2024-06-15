import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, FormCheck } from 'react-bootstrap';

const ToolsConfigForm = ({configIn, setConfig, forceRefresh}) => {
	
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
		if (!c.tools) c.tools = {}
		c.tools[key] = value
		setConfig(c)
		forceRefresh()
   }

  return (
    <Form onSubmit={handleSubmit}>
		<div className="border p-3 mb-3">
			<h5>Tools</h5>
		 
		
		<Row className="mb-3">
			<Form.Group style={{marginTop:'1.5em'}}as={Col} controlId="openaiKey">
				<Form.Label>Tavily Web Search API Key</Form.Label>
				<Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >See <a href="https://app.tavily.com/" target="new" >https://app.tavily.com/</a></span></Form.Text>
				<Form.Control
					type="text"
					value={config && config.tools && config.tools.tavily_key}
					onChange={(e) => {setConfigValue('tavily_key',e.target.value);  }}
				  />
				
				<Form.Label>Tavily Web Search URL</Form.Label>
				
				<Form.Control
					type="text"
					value={config && config.tools && config.tools.tavily_url}
					onChange={(e) => {setConfigValue('tavily_url',e.target.value);  }}
				  />
				</Form.Group>  
				<Form.Group style={{marginTop:'1.5em'}} as={Col} controlId="openaiKey">
				
				  <Form.Label>CORS Proxy URL</Form.Label>
				
				<Form.Control
					type="text"
					value={config && config.tools && config.tools.cors_url ? config.tools.cors_url : 'https://proxy.cors.sh/'}
					onChange={(e) => {setConfigValue('cors_url',e.target.value);  }}
				  />
				  
				   <Form.Label>CORS Proxy Key</Form.Label>
					<Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >See <a href="http://proxy.cors.sh/" target="new" >http://proxy.cors.sh/</a></span></Form.Text>
          	   
				
				<Form.Control
					type="text"
					value={config && config.tools && config.tools.cors_key}
					onChange={(e) => {setConfigValue('cors_key',e.target.value);  }}
				  />
				  
			</Form.Group>
		
		  </Row>
		 </div>
      

      
    </Form>
  );
};

export default ToolsConfigForm;
// {{<Form.Group  style={{marginTop:'1.5em'}} as={Col} controlId="openaiKey">
// 				<Form.Label>Piston Code Runner URL</Form.Label>
// 				<Form.Text><span style={{display:'block',marginLeft:'3em', fontStyle:'italic', fontSize:'0.7em'}} >See <a href="https://github.com/engineer-man/piston" target="new" >https://github.com/engineer-man/piston</a></span></Form.Text>
// 				<Form.Control
// 					type="text"
// 					value={config && config.tools && config.tools.piston_url ?  config.tools.piston_url : 'https://emkc.org/api/v2/piston'}
// 					onChange={(e) => {setConfigValue('piston_url',e.target.value);  }}
// 				  />
				
// 				<Form.Label>Code Generation Max Attempts</Form.Label>
// 				<Form.Control
// 					type="text"
// 					value={config && config.tools && config.tools.piston_max_attempts > 0 ? config.tools.piston_max_attempts : 3}
// 					onChange={(e) => {setConfigValue('piston_max_attempts',e.target.value);  }}
// 				  />
// 			</Form.Group>}}
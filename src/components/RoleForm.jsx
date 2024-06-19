import React, { useState , useEffect} from "react";
import { Badge, Form, Row, Col, Button , Tab, Tabs} from "react-bootstrap";
import useIcons from '../useIcons'
import TextareaAutosize from 'react-textarea-autosize';
//import CategoryAutosuggest from './CategoryAutosuggest'
import CategoriesSelector from './CategoriesSelector'


export default function RoleForm ({roleId, roles, rolesJSON, setRoles, icons, forceRefresh, utils, playSpeech, config, categories, setCategories, files})  {
	
	const [role, setRole] = useState({})
	let [refresh, setRefresh] = useState('')
	let [samples, setSamplesInner] = useState([])
	function setSamples(v) {
		setSamplesInner(v)
		save('samples',v)
	}
	let [addSample, setAddSample] = useState('')
	let [generateSchemaErrorMessage, setGenerateSchemaErrorMessage] = useState('')
	function save(field, value) {
		//console.log('save', field, value)
		if (roles && roleId && field) {
			if (!roles.hasOwnProperty(roleId))  {
				roles[roleId] = {}
			}
			roles[roleId][field] = value
			setRoles(roles)
			setRefresh(utils.generateRandomId())
			//forceRefresh()
		}
	}
	
	function saveConfig(field, value) {
		//console.log('savec', field, value, roleId, roles)
		if (!roles) roles = {}
		if (roleId && field) {
			if (!roles[roleId])  {
				roles[roleId] = {}
			}
			roles[roleId].config = roles[roleId].config ? roles[roleId].config : {} 
			roles[roleId].config[field] = value
			//console.log('save', roles)
			setRoles(roles)
			setRefresh(utils.generateRandomId())
			//forceRefresh()
		}
	}
	
	useEffect(function() {
		setRefresh(utils.generateRandomId())
		forceRefresh()
		setRole(roles && roleId ? roles[roleId] : null)
		setSamples(roles && roleId && roles[roleId] &&  Array.isArray(roles[roleId].samples) ? roles[roleId].samples : [])
		//console.log('setrole', roles && roleId ? roles[roleId] : null)
		//setCategories(roles && roleId && roles[roleId] &&  Array.isArray(roles[roleId].category) ? roles[roleId].category : [])
	},[JSON.stringify(roles && roleId ? roles[roleId] : {})])

  //const categories = ['','general','legal','chain of thought','multi shot','code']
  
	
	//useEffect(function() {
		//setMaxTokens(value && value.maxTokens ? value.maxTokens : 200)
		//setTemperatureOpenAI(value && value.temperatureOpenAI ? value.temperatureOpenAI : 1);
		//setTopPOpenAI(value && value.topPOpenAI ? value.topPOpenAI : 1);
		//setTemperatureGpt4All(value && value.temperatureGpt4All ? value.temperatureGpt4All : 0.7);
		//setTopPGpt4All(value && value.topPGpt4All ? value.topPGpt4All : 0.4);
		//setOutputType(value && value.outputType ? value.outputType : '');
		//setOutputExamples(value && value.outputExamples ? value.outputExamples : '');
		//setStopTokens(value && Array.isArray(value.stopTokens) ? value.stopTokens : [])
		//// openai
		//setFrequencyPenalty(value && value.frequencyPenalty ? value.frequencyPenalty : 0);
		//setPresencePenalty(value && value.presencePenalty ? value.presencePenalty : 0);
		//// gpt4all
		//setTopK(value && value.topK ? value.topK : 40);
		//setMinP(value && value.minP ? value.minP : 0);
		//setRepeatPenalty(value && value.repeatPenalty ? value.repeatPenalty : 1.18);
		//setRepeatLastN(value && value.repeatLastN ? value.repeatLastN : 64);
		//setNBatch(value && value.nBatch ? value.nBatch : 8);
		
	//},[value ? JSON.stringify(value) : null])

	const handleChange = (f,e) => {
		save(f,e.target.value)
	};
  
	const handleConfigChange = (f,e) => {
		saveConfig(f,e.target.value)
	}
	
  const handleNameChange = (e) => {
    save('name',e.target.value)
  };
  
  
  const handleCategoryChange = (e) => {
    //console.log('category change', e, categories)
    save('category',e)
    // add category
    let toAdd = Array.isArray(e) ? e : []
    if (!categories) categories={}
	toAdd.forEach(function(c) {
    	categories[c] = 1
    })
    setCategories(categories)
  };
  
  const handleMessageChange = (e) => {
    save('message',e.target.value)
  };
  
  const handleBackStoryChange = (e) => {
    save('backStory',e.target.value)
  };
  
  const handleSkillsChange = (e) => {
    save('skills',e.target.value)
  };
  
  const handleMaxTokensChange = (e) => {
    saveConfig('maxTokens',e.target.value)
  };
  
  const handleOutputTypeChange = (e) => {
	saveConfig('outputType',e.target.value)
  };
  
  const handleOutputExamplesChange = (e) => {
	saveConfig('outputExamples',e.target.value)
  };

  const handleTemperatureOpenAIChange = (e) => {
    saveConfig('temperatureOpenAI',e.target.value)
  };

  const handleTopPOpenAIChange = (e) => {
    saveConfig('topPOpenAI',e.target.value)
  };
  
  const handleTemperatureChange = (e) => {
    saveConfig('temperature',e.target.value)
  };

  const handleTopPChange = (e) => {
    saveConfig('topP',e.target.value)
  };
  
  
  const handleStopTokensChange = (e) => {
    saveConfig('stopTokens',e.target.value)
  };
  
  // openai
  const handlePresencePenaltyChange = (e) => {
    saveConfig('presencePenalty',e.target.value)
  };

  const handleFrequencyPenaltyChange = (e) => {
    saveConfig('frequencyPenalty',e.target.value)
  };
  
  // gpt4all
  const handleTopKChange = (e) => {
    saveConfig('topK',e.target.value)
  };
 
		
  const handleMinPChange = (e) => {
    saveConfig('minP',e.target.value)
  };

  const handleRepeatPenaltyChange = (e) => {
    saveConfig('repeatPenalty',e.target.value)
  };

  const handleRepeatLastNChange = (e) => {
    saveConfig('repeatLastN',e.target.value)
  };

  const handleNBatchChange = (e) => {
    saveConfig('nBatch',e.target.value)
  };
  
  const handleBeamsChange = (e) => {
    saveConfig('beams',e.target.value)
  };
  
  const handlePreferredModelChange = (e) => {
    saveConfig('preferredModel',e.target.value)
  };

  const handleTtsSpeedChange = (e) => {
    saveConfig('ttsSpeed',e.target.value)
  };
  
  const handleTtsOaiVoiceChange = (e) => {
    saveConfig('ttsOaiVoice',e.target.value)
  };
  
  const handleSchemaChange = (e) => {
    saveConfig('schema',e.target.value)
  };
  
  const handleTtsSelfHostedVoiceChange = (e) => {
    saveConfig('ttsSelfHostedVoice',e.target.value)
  };
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
    return false
  };
  
	let [stopTokens, setStopTokens] = useState(role && role.config && role.config.stopTokens ? role.config.stopTokens : [])
	let [addStopToken, setAddStopToken] = useState('')
	// <CategoryAutosuggest categories={categories}  onChange={(e) => handleCategoryChange(e)} value={role && role.category ? role.category : ''}/>
					
  return (
    <>
    <Form id={refresh} onSubmit={function(e) {e.preventDefault(); return false}}>
      <Button onClick={function() {utils.downloadText(JSON.stringify(roles[roleId]), roles[roleId].name + '.js')}} style={{float:'right'}} variant="success" >{icons.save}</Button>
      <div className="border p-3 mb-3">
		 <Tabs
		  defaultActiveKey="Basics"
		  id="uncontrolled-tab-example"
		  className="mb-3"
		>
		  <Tab eventKey="Basics" title="Info">
			<Row className="mb-3">
				<Form.Group as={Col} controlId="openaiKey">
						<Row className="mb-3">
							<Col>
							   <Form.Label>Name</Form.Label>
							  <Form.Control type="text" 
							   onChange={(e) => handleNameChange(e)}
								value={role && role.name ? role.name : ''}
							></Form.Control>
							</Col>
						   <Col>
								<Form.Label>Type</Form.Label>
								&nbsp;&nbsp; &nbsp;&nbsp;
								<Form.Select
									style={{width:'10em', display:'inline', marginRight:'2em'}} 
								  value={role && role.config && role.config.type ? role.config.type : 'inference'}
								  onChange={function(e) {
									saveConfig('type',e.target.value)
									}}
								>
									<option  value="inference"  >Inference</option>
									<option value="algorithmic" >Algorithmic</option>
								</Form.Select>
						</Col>
						  
						<Col>
						   <Form.Label >Categories</Form.Label>
							<CategoriesSelector value={role && typeof role.category==='string' ? [role.category] : (role && Array.isArray(role.category) ? role.category : [])} onChange={(e) => handleCategoryChange(e)} defaultOptions={categories ? Object.keys(categories) : []}  />
							
						  </Col>
					  </Row>
					
				  
				</Form.Group>
				
				<Form.Group  controlId="openaiKey">
					<Form.Label>Welcome Message</Form.Label>
					  <TextareaAutosize 
					   minRows={'1'}
					   style={{width:'100%'}}
						onChange={(e) => handleConfigChange('welcomeMessage',e)}
						value={role && role.config && role.config.welcomeMessage ? role.config.welcomeMessage : ''}
					  ></TextareaAutosize>
					</Form.Group>
				
				
				<>
					{(!role || !role.config || role.config.type !=='algorithmic') && 	<Form.Group  controlId="openaiKey">
					<Form.Label>Instructions</Form.Label>
					  <TextareaAutosize 
					   minRows={'6'}
					   style={{width:'100%'}}
						onChange={(e) => handleMessageChange(e)}
						value={role && role.message ? role.message : ''}
					  ></TextareaAutosize>
					</Form.Group>}
					<Form.Group  controlId="backstory">
					<Form.Label>Skills</Form.Label>
					  <TextareaAutosize 
					   minRows={(role && role.config && role.config.type ==='algorithmic') ? '1' : '6'}
					   style={{width:'100%'}}
						onChange={(e) => handleSkillsChange(e)}
						value={role && role.skills ? role.skills : ''}
					  ></TextareaAutosize>
					</Form.Group>
					{(!role || !role.config || role.config.type !=='algorithmic') && 	<Form.Group  controlId="backstory">
					<Form.Label>Back Story</Form.Label>
					  <TextareaAutosize 
					   minRows={'2'}
					   style={{width:'100%'}}
						onChange={(e) => handleBackStoryChange(e)}
						value={role && role.backStory ? role.backStory : ''}
					  ></TextareaAutosize>
					</Form.Group>}
				</>
				</Row>
				
				<Row>
				<Col>
				{(role && role.config && role.config.type ==='algorithmic') && 	
						<Form.Group style={{float:'right'}}  controlId="backstory">
					<Form.Label>Function Type</Form.Label>
					  <Form.Select
							style={{width:'20em', display:'inline', marginRight:'2em', marginLeft:'2em'}} 
						  value={role && role.config && role.config.processingFunctionType ? role.config.processingFunctionType : 'evaljavascript'}
						  onChange={function(e) {
							saveConfig('processingFunctionType',e.target.value)
							}}
						>
							<option value="evaljavascript" >Local Javascript (eval)</option>
							<option value="javascript" >Javascript</option>
							<option value="python" >Python</option>
						</Form.Select>
					</Form.Group>}
				{(role && role.config && role.config.type ==='algorithmic') && 	
						<Form.Group  controlId="backstory">
					<Form.Label>Processing Function</Form.Label>
						<div style={{fontSize:'1.2em', fontWeight:'bold'}} >{'function(message, messages) {'}</div>
					  <TextareaAutosize 
					   minRows={'12'}
					   style={{width:'100%'}}
						onChange={(e) => saveConfig('processingFunction',e.target.value)}
						value={role && role.config && role.config.processingFunction ? role.config.processingFunction : 'return '}
					  ></TextareaAutosize>
					<div style={{fontSize:'1.2em', fontWeight:'bold'}} >}</div>
					</Form.Group>}
					</Col>
			</Row>
			</Tab>
		  {(!role || !role.config || role.config.type !== 'algorithmic') && <Tab eventKey="Output" title="Output Format">
			<Row className="mb-3">
				<Col>
				   <Form.Label>Wrap Output As</Form.Label>
				  &nbsp;&nbsp; &nbsp;&nbsp;
						<Form.Select
							style={{width:'8em', display:'inline', marginRight:'2em'}} 
						  value={''}
						  onChange={function(e) {
							saveConfig('wrapBefore','```' + e.target.value)
							saveConfig('wrapAfter','```')
							}}
						>
							<option></option>
							<option value="json" >JSON</option>
							<option value="mermaid" >Mermaid Chart</option>
							<option value="markdown" >Markdown</option>
							<option value="python" >Python</option>
							<option value="javascript" >Javascript</option>
							<option value="abc" >ABC Music Notation</option>
							<option value="csv" >Comma Seperated Variables</option>
						</Form.Select>
					<Form.Text>&nbsp;Before:&nbsp;</Form.Text>
					<TextareaAutosize 
					   minRows={'1'}
					   style={{width:'30%', display:'inline'}}
						onChange={(e) => handleConfigChange('wrapBefore',e)}
						value={role && role.config && role.config.wrapBefore ? role.config.wrapBefore : ''}
					  ></TextareaAutosize>
					<Form.Text>&nbsp;After:&nbsp;</Form.Text>
					<TextareaAutosize 
					   minRows={'1'}
					   style={{width:'30%', display:'inline'}}
						onChange={(e) => handleConfigChange('wrapAfter',e)}
						value={role && role.config && role.config.wrapAfter ? role.config.wrapAfter : ''}
					  ></TextareaAutosize>
					
				</Col>
			</Row>
			<Row>
				<Col>
				
				
				  <Form.Group controlId="modelType">
					<Form.Label>Output Format:</Form.Label>
					<Form.Select
					  value={role && role.config && role.config.outputType ? role.config.outputType : ''}
					  onChange={handleOutputTypeChange}
					>
					<option></option>
					<option value="json" >JSON</option>
					<option value="choice" >Choice</option>
					<option value="number" >Number</option>
					</Form.Select>
				  </Form.Group>
				<Form.Group  controlId="outputexamples">
				 {(role && role.config && (role.config.outputType==='' || role.config.outputType==='json' || role.config.outputType==='choice'))  &&  <>
				 {(role && role.config && role.config.outputType && role.config.outputType==='json') ? <Form.Label>Examples (single JSON per line)</Form.Label> : (role && role.config && role.config.outputType && role.config.outputType==='choice') ?  <Form.Label>Choice Options (one per line)</Form.Label> : <Form.Label>Examples</Form.Label>}
				  
				  {<TextareaAutosize 
				   minRows={'12'}
				   style={{width:'100%'}}
					onChange={(e) => {
						//console.log("CHANGE TEXT",e)
						handleOutputExamplesChange(e)
					}}
					value={role && role.config && role.config.outputExamples ? role.config.outputExamples : ''}
				  ></TextareaAutosize>}
				  
				  
				{(role && role.config && (role.config.outputType === 'json')) && <>
					<Form.Label style={{marginRight:'4em', marginBottom:'2em'}} >Schema</Form.Label>
				  
					
					{(false && role && role.config && role.config.outputExamples ) && <><Button variant="success" onClick={function() {
						fetch(import.meta.env.VITE_API_URL + '/schema', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({data: (role && role.config && role.config.outputExamples) ? role.config.outputExamples.trim().split("\n") : []}),
						}).then(function(response) {
							//console.log("ai response",response)
							if (response.error) {
								setGenerateSchemaErrorMessage(response.error)
							} else {
								setGenerateSchemaErrorMessage('')
								response.json().then(function(d) {
									//console.log('parse resp',d)
									saveConfig('schema', d)
								})
							}
						}).catch(function() {
							setGenerateSchemaErrorMessage("Failed to load schema")
						})
						
						//modelConfig.config.examples
						//fetch()
						//config && config.llm && config.llm.self_hosted_url
					}}>Generate Schema From Examples</Button> <span style={{marginLeft:'2em',fontWeight:'bold', color:'red'}}>{generateSchemaErrorMessage}</span></>}
					
					{!(role && role.config && role.config.outputExamples && config && config.llm && config.llm.self_hosted_url) &&  <Form.Text><span style={{display:'block',marginLeft:'0.3em', fontStyle:'italic', fontSize:'0.8em'}} >{(role && role.config && role.config.outputExamples) && <a href="https://www.liquid-technologies.com/online-json-to-schema-converter" target='_new' >Online Schema Generator</a>}</span></Form.Text>}
					<TextareaAutosize 
					   minRows={'12'}
					   style={{width:'100%'}}
						onChange={(e) => {
							//console.log("CHANGE TEXT",e)
							handleSchemaChange(e)
						}}
						value={role && role.config && role.config.schema ? role.config.schema : ''}
						placeholder={role && role.config && role.config.schema ? role.config.schema : JSON.stringify({
	  "title": "User",
	  "type": "object",
	  "properties": {
		"name": {"type": "string"},
		"last_name": {"type": "string"},
		"id": {"type": "integer"}
	  }
	})}
					  ></TextareaAutosize>
				</>}
				</>}
				</Form.Group>
				</Col>
			  </Row>
				  </Tab>}
				  {(!role || !role.config || role.config.type !=='algorithmic') && <Tab eventKey="Parameters" title="Parameters" >
					<Row style={{borderBottom: '1px solid black', height:'1em'}} ></Row>
				  <a href={'https://platform.openai.com/docs/api-reference/chat'} target="_new" ><Button style={{float:'right'}}>{icons.question}</Button></a>
			  <Row>
				<Col>
				  <Form.Group controlId="temperatureOpenAI">
					<Form.Label>Temperature: {role && role.config && role.config.temperatureOpenAI ? role.config.temperatureOpenAI : ''}</Form.Label>
					<Form.Control
					  type="range"
					  min={0}
					  max={2}
					  step={0.01}
					  value={role && role.config && role.config.temperatureOpenAI ? role.config.temperatureOpenAI : ''}
					  onChange={handleTemperatureOpenAIChange}
					/>
				  </Form.Group>
				</Col>
			  </Row>
			  
			  <Row>
				<Col>
				  <Form.Group controlId="topPOpenAI">
					<Form.Label>Top P: {role && role.config && role.config.topPOpenAI ? role.config.topPOpenAI : ''}</Form.Label>
					<Form.Control
					  type="range"
					  min={0}
					  max={1}
					  step={0.01}
					  value={role && role.config && role.config.topPOpenAI ? role.config.topPOpenAI : ''}
					  onChange={handleTopPOpenAIChange}
					/>
				  </Form.Group>
				</Col>
			   </Row>
				<Row>
				<Col>
				  <Form.Group controlId="frequency_penalty">
					<Form.Label>Frequency Penalty: {role && role.config && role.config.frequencyPenalty ? role.config.frequencyPenalty : ''}</Form.Label>
					<Form.Control
					  type="range"
					  min={-2}
					  max={2}
					  step={0.01}
					  value={role && role.config && role.config.frequencyPenalty ? role.config.frequencyPenalty : ''}
					  onChange={handleFrequencyPenaltyChange}
					/>
				  </Form.Group>
				</Col>
			  </Row>
			  <Row>
				<Col>
				  <Form.Group controlId="presence_penaly">
					<Form.Label>Presence Penalty: {role && role.config && role.config.presencePenalty ? role.config.presencePenalty : ''}</Form.Label>
					<Form.Control
					  type="range"
					  min={-2}
					  max={2}
					  step={0.01}
					  value={role && role.config && role.config.presencePenalty ? role.config.presencePenalty : ''}
					  onChange={handlePresencePenaltyChange}
					/>
				  </Form.Group>
				</Col>
			  </Row>
			  
		  </Tab>}
		  {(role && role.config && role.config.type !=='algorithmic') && <Tab eventKey="Tokens" title="Limits" >
			 <Row>
        <Col>
          <Form.Group controlId="stopTokens">
            <Form.Label>Stop Tokens: </Form.Label>
            <Form.Control
              style={{width:'80%', display:'inline'}} type="text"
              value={addStopToken ? addStopToken : ''}
              onChange={function(e) {setAddStopToken(e.target.value)}}
            />
            <Button disabled={stopTokens.length > 3} style={{marginLeft:'0.3em',display:'inline'}} variant="success" onClick={function() {
				let useStopTokens = (role && role.config && role.config.stopTokens) ? role.config.stopTokens : []
				useStopTokens.push(addStopToken)
				setStopTokens(useStopTokens)
				setAddStopToken('')
				saveConfig('stopTokens', useStopTokens)
			}} >Add</Button>
			{(role && role.config && role.config.stopTokens) && <div>{role.config.stopTokens.map(function( token, tokenKey) {return <Button key={tokenKey} style={{marginLeft:'0.2em'}} variant="warning" onClick={function() {
				let stopTokens = role.config.stopTokens
				stopTokens.splice(tokenKey,1)
				setStopTokens(stopTokens)
				saveConfig('stopTokens', stopTokens)
			}} ><Badge bg="warning" >{icons.close}</Badge>&nbsp;&nbsp;&nbsp; {token}</Button>})}</div>}
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group controlId="maxTokens">
            <Form.Label>Max Tokens: <Form.Control
              type="text"
              value={role && role.config && role.config.maxTokens ? role.config.maxTokens : '' }
              onChange={handleMaxTokensChange}
            /></Form.Label>
            <Form.Control
              type="range"
              min={0}
              max={32000}
              value={role && role.config && role.config.maxTokens ? role.config.maxTokens : ''}
              onChange={handleMaxTokensChange}
            />
          </Form.Group>
        </Col>
      </Row>
		  </Tab>}
		  
		  {(!role || !role.config ||  role.config.type !=='algorithmic') && 	 <Tab eventKey="model" title="Model" >
			 <Row>
				<Col>
				  <Form.Group controlId="stopTokens">
					<Form.Label>Preferred Model</Form.Label>
					<Form.Select
					  value={role && role.config && role.config.preferredModel ? role.config.preferredModel : '4'}
					  onChange={handlePreferredModelChange}
					>
						 <option value="basic" >Basic</option>
						<option value="small"  >Small</option>
						<option value="medium"  >Medium</option>
						<option value="large"  >Large</option>
						<option value="advanced" >Advanced</option>
						<option value="instruct" >Instruct</option>
						<option value="code" >Code </option>
						
					</Form.Select>
				  </Form.Group>
				</Col>
			  </Row>
			  
			 
		  </Tab>}
		  
		  
		   <Tab eventKey="voice" title="Voice" >
			 <Row>
				<Col>
				  <Form.Group controlId="ttsspeed">
					<Form.Label>Speed: {role && role.config && role.config.ttsSpeed ? role.config.ttsSpeed : ''}</Form.Label>
					<Form.Control
					  type="range"
					  min={50}
					  max={200}
					  value={role && role.config && role.config.ttsSpeed ? role.config.ttsSpeed : ''}
					  onChange={handleTtsSpeedChange}
					/>
				  </Form.Group>
				</Col>
			  </Row>
			  <Row>
				<Col>
				  <Form.Group controlId="ttsoaivoice">
					<Form.Label  style={{display: 'block'}}>OpenAI Voice: </Form.Label>
					<Form.Select
					style={{width:'85%', float:'left'}}
					  value={role && role.config && role.config.ttsOaiVoice ? role.config.ttsOaiVoice : ''}
					  onChange={handleTtsOaiVoiceChange}
					>
						<option></option>
						<option >alloy</option>
						<option  >echo</option>
						<option  >fable</option>
						<option  >onyx</option>
						<option  >nova</option>
						<option  >shimmer</option>
					</Form.Select>
					
					
					
					
					<Button style={{float:'left', marginLeft:'1em'}} onClick={function() {playSpeech("this is a test","openai",(role && role.config && role.config.ttsOaiVoice ? role.config.ttsOaiVoice : '') ,((role && role.config && role.config.ttsSpeed) ? (role.config.ttsSpeed/100) : '')  )}} >{icons.play}</Button>
				  </Form.Group>
				</Col>
			  </Row>
			   <Row>
				<Col>
				  <Form.Group controlId="ttsselfhostedvoice">
					<Form.Label style={{display: 'block'}}>Self Hosted Voice: </Form.Label>
					<Form.Select
					style={{width:'85%', float:'left'}}
					  value={role && role.config && role.config.ttsSelfHostedVoice ? role.config.ttsSelfHostedVoice : ''}
					  onChange={handleTtsSelfHostedVoiceChange}
					>
						<option></option>
					<option value="p225" >p225</option>
                    <option value="p226" >p226</option>
                    <option value="p227" >p227</option>
                    <option value="p228" >p228</option>
                    <option value="p229" >p229</option>
                    <option value="p230" >p230</option>
                    <option value="p231" >p231</option>
                    <option value="p232" >p232</option>
                    <option value="p233" >p233</option>
                    <option value="p234" >p234</option>
                    <option value="p236" >p236</option>
                    <option value="p237" >p237</option>
                    <option value="p238" >p238</option>
                    <option value="p239" >p239</option>
                    <option value="p240" >p240</option>
                    <option value="p241" >p241</option>
                    <option value="p243" >p243</option>
                    <option value="p244" >p244</option>
                    <option value="p245" >p245</option>
                    <option value="p246" >p246</option>
                    <option value="p247" >p247</option>
                    <option value="p248" >p248</option>
                    <option value="p249" >p249</option>
                    <option value="p250" >p250</option>
                    <option value="p251" >p251</option>
                    <option value="p252" >p252</option>
                    <option value="p253" >p253</option>
                    <option value="p254" >p254</option>
                    <option value="p255" >p255</option>
                    <option value="p256" >p256</option>
                    <option value="p257" >p257</option>
                    <option value="p258" >p258</option>
                    <option value="p259" >p259</option>
                    <option value="p260" >p260</option>
                    <option value="p261" >p261</option>
                    <option value="p262" >p262</option>
                    <option value="p263" >p263</option>
                    <option value="p264" >p264</option>
                    <option value="p265" >p265</option>
                    <option value="p266" >p266</option>
                    <option value="p267" >p267</option>
                    <option value="p268" >p268</option>
                    <option value="p269" >p269</option><option value="p270" >p270</option><option value="p271" >p271</option><option value="p272" >p272</option><option value="p273" >p273</option><option value="p274" >p274</option><option value="p275" >p275</option><option value="p276" >p276</option><option value="p277" >p277</option><option value="p278" >p278</option><option value="p279" >p279</option><option value="p280" >p280</option><option value="p281" >p281</option><option value="p282" >p282</option><option value="p283" >p283</option><option value="p284" >p284</option><option value="p285" >p285</option><option value="p286" >p286</option><option value="p287" >p287</option><option value="p288" >p288</option><option value="p292" >p292</option><option value="p293" >p293</option><option value="p294" >p294</option><option value="p295" >p295</option><option value="p297" >p297</option><option value="p298" >p298</option><option value="p299" >p299</option><option value="p300" >p300</option><option value="p301" >p301</option><option value="p302" >p302</option><option value="p303" >p303</option><option value="p304" >p304</option><option value="p305" >p305</option><option value="p306" >p306</option><option value="p307" >p307</option><option value="p308" >p308</option><option value="p310" >p310</option><option value="p311" >p311</option><option value="p312" >p312</option><option value="p313" >p313</option><option value="p314" >p314</option><option value="p316" >p316</option><option value="p317" >p317</option><option value="p318" >p318</option><option value="p323" >p323</option><option value="p326" >p326</option><option value="p329" >p329</option><option value="p330" >p330</option><option value="p333" >p333</option><option value="p334" >p334</option><option value="p335" >p335</option><option value="p336" >p336</option><option value="p339" >p339</option><option value="p340" >p340</option><option value="p341" >p341</option><option value="p343" >p343</option><option value="p345" >p345</option><option value="p347" >p347</option><option value="p351" >p351</option><option value="p360" >p360</option><option value="p361" >p361</option><option value="p362" >p362</option><option value="p363" >p363</option><option value="p364" >p364</option><option value="p374" >p374</option><option value="p376" >p376</option>
					</Form.Select>
					<Button style={{float:'left', marginLeft:'1em'}} onClick={function() {playSpeech("this is a test","self_hosted",(role && role.config && role.config.ttsSelfHostedVoice ? role.config.ttsSelfHostedVoice : '') ,((role && role.config && role.config.ttsSpeed) ? (role.config.ttsSpeed/100) : '')  )}} >{icons.play}</Button>
				  </Form.Group>
				</Col>
			  </Row>
		  </Tab>
		  <Tab eventKey="Samples" title="Examples" >
				 <Row>
        <Col>
          <Form.Group controlId="samples">
            <Form.Label>Sample Queries: </Form.Label>
            <Form.Control
              style={{width:'80%', display:'inline'}} type="text"
              value={addSample ? addSample : ''}
              onChange={function(e) {setAddSample(e.target.value)}}
            />
            <Button  style={{marginLeft:'0.3em',display:'inline'}} variant="success" onClick={function() {
				samples.push(addSample)
				setSamples(samples)
				setAddSample('')
				save('samples', samples)
			}} >Add</Button>
			<div>{samples.map(function( sample, sampleKey) {return <Button key={sampleKey} style={{marginLeft:'0.2em'}} variant="warning"  ><Badge onClick={function() {
				samples.splice(sampleKey,1)
				setSamples(samples)
				save('samples', samples)
			}} bg="warning" >{icons.close}</Badge>&nbsp;&nbsp;&nbsp; {sample}</Button>})}</div>
          </Form.Group>
        </Col>
      </Row>
		  </Tab>
		  
		  
		  <Tab eventKey="Files" title="Files" >
				 <Row>
        <Col>
			
        </Col>
      </Row>
		  </Tab>
		  
		 
		</Tabs>
	</div>
      </Form>
    </>
  );
};
//<FileSelector />
//<Tab eventKey="selfhosted" title="Self Hosted">
			  //<a href={'https://docs.gpt4all.io/gpt4all_python.html#streaming-generations'} target="_new" ><Button style={{float:'right'}}>{icons.question}</Button></a>
			  //<Row>
				//<Col>
				  //<Form.Group controlId="temperatureGpt4All">
					//<Form.Label>Temperature: {role && role.config && role.config.temperature ? role.config.temperature : ''}</Form.Label>
					//<Form.Control
					  //type="range"
					  //min={0}
					  //max={1}
					  //step={0.01}
					  //value={role && role.config && role.config.temperature ? role.config.temperature : ''}
					  //onChange={handleTemperatureChange}
					///>
				  //</Form.Group>
				//</Col>
			  //</Row>
			  
			  //<Row>
				//<Col>
				  //<Form.Group controlId="topP">
					//<Form.Label>Top P: {role && role.config && role.config.topP ? role.config.topP : ''}</Form.Label>
					//<Form.Control
					  //type="range"
					  //min={0}
					  //max={1}
					  //step={0.01}
					  //value={role && role.config && role.config.topP ? role.config.topP : ''}
					  //onChange={handleTopPChange}
					///>
				  //</Form.Group>
				//</Col>
			   //</Row>
				//<Row>
				//<Col>
				  //<Form.Group controlId="topK">
					//<Form.Label>Top K: {role && role.config && role.config.topK ? role.config.topK : ''}</Form.Label>
					//<Form.Control
					  //type="range"
					  //min={1}
					  //max={100}
					  //value={role && role.config && role.config.topK ? role.config.topK : ''}
					  //onChange={handleTopKChange}
					///>
				  //</Form.Group>
				//</Col>
			  //</Row>
			  
			  
			  
			  //</Tab>

			  //<Row>
				//<Col>
				  //<Form.Group controlId="beams">
					//<Form.Label>Beams: {role && role.config && role.config.beams ? role.config.beams : ''}</Form.Label>
					//<Form.Control
					  //type="range"
					  //min={0}
					  //max={20}
					  //value={role && role.config && role.config.beams ? role.config.beams : ''}
					  //onChange={handleBeamsChange}
					///>
				  //</Form.Group>
				//</Col>
			  //</Row>


	
		  //<Tab eventKey="Files" title="Files" >
			//TODO Files
		  //</Tab>
//<option>HTML</option>
					//<option>Markdown</option>
					//<option>YAML</option>
					//<option>XML</option>
					//<option>Python</option>
					//<option>JavaScript</option>
					
  //<Row>
					  //<Col>
						  //<Form.Group  controlId="openaiKey">
							//<Form.Label>Comments</Form.Label>
							  //<TextareaAutosize 
							   //minRows={'1'}
							   //style={{width:'100%'}}
								//onChange={(e) => handleChange('comments',e)}
								//value={role && role.comments ? role.comments : ''}
							  //></TextareaAutosize>
							//</Form.Group>
					  //</Col>
				  //</Row>

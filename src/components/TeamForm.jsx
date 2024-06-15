import React, { useState , useEffect} from "react";
import { Badge, Form, Row, Col, Button , Tab, Tabs, ButtonGroup, FormCheck} from "react-bootstrap";
import useIcons from '../useIcons'
import TextareaAutosize from 'react-textarea-autosize';
//import CategoryAutosuggest from './CategoryAutosuggest'
import CategoriesSelector from './CategoriesSelector'
import RolesSelector from './RolesSelector'
import MermaidViewer from './MermaidViewer'
import HelpDropdown from './HelpDropdown'
import RoleOrTeamSelector from './RoleOrTeamSelector'
export default function TeamForm ({teamId, teams, teamsJSON, setTeams, icons, forceRefresh, utils, playSpeech, config, categories, setCategories, roles})  {
	
	const [team, setTeam] = useState({})
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
		if (teams && teamId && field) {
			if (!teams.hasOwnProperty(teamId))  {
				teams[teamId] = {type:'linear'}
			}
			teams[teamId][field] = value
			setTeams(teams)
			setRefresh(utils.generateRandomId())
			//forceRefresh()
		}
	}
	
	function saveConfig(field, value) {
		//console.log('savec', field, value, teamId, teams)
		if (!teams) teams = {}
		if (teamId && field) {
			if (!teams[teamId])  {
				teams[teamId] = {}
			}
			teams[teamId].config = teams[teamId].config ? teams[teamId].config : {} 
			teams[teamId].config[field] = value
			//console.log('save', teams)
			setTeams(teams)
			setRefresh(utils.generateRandomId())
			//forceRefresh()
		}
	}
	
	useEffect(function() {
		setRefresh(utils.generateRandomId())
		forceRefresh()
		setTeam(teams && teamId ? teams[teamId] : null)
		setSamples(teams && teamId && teams[teamId] &&  Array.isArray(teams[teamId].samples) ? teams[teamId].samples : [])
		//console.log('setteam', teams && teamId ? teams[teamId] : null)
		
	},[JSON.stringify(teams && teamId ? teams[teamId] : {})])

 const handleCheckedChange = (key,e) => {
	  //console.log("CH",key,e)
    save(key,e.target.checked)
  };
 
  const handleChange = (key,e) => {
	  //console.log("CH",key,e)
    save(key,e.target.value)
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
  
  
  //const handleMembersChange = (e) => {
    ////console.log('category change', e, categories)
    //save('members',e)
    //// add category
    ////let toAdd = Array.isArray(e) ? e : []
    ////if (!categories) categories={}
	////toAdd.forEach(function(c) {
    	////categories[c] = 1
    ////})
    ////setCategories(categories)
  //};
  
  
  function createChart(type) {
		switch (type) {
			case 'linear':
				return `flowchart LR
 IN --> A[Member 1] -->|member 1 data|B[Member 2] -->|member 2 data| C[Member 3] -->|member 3 data| Formatter -->OUT` 
			case 'linearcollation':
				return `flowchart LR
 IN --> A[Member 1] -->|member 2 data| B[Member 2] --> |member 1 and 2 data|C[Member 3] --> |member 1 and 2 and 3 data|Formatter -->OUT` 
			case 'parallel':
				return `flowchart LR
 IN --> A[Member 1]
 A --> Formatter 
 IN -->  B[Member 2] 
 B  --> Formatter
 IN -->  C[Member 3]
 C --> Formatter
 Formatter --> OUT
 `
			case 'mixtureofexperts':
				return `flowchart LR
 IN --> Chooser[Expert Selector] --> A[Member 1] --> Formatter --> OUT 
 IN --> Chooser -->  C[Member 3] --> Formatter --> OUT`
			case 'generator':
				return `flowchart LR
 IN --> Generator[Question Generator] -->|Generated Question 1| A[Member 1] --> tr[Text Reducer] --> Formatter --> OUT 
 Generator -->|Generated Question 1| B[Member 2] --> tr --> Formatter
 Generator -->|Generated Question 2| A[Member 1] --> tr --> Formatter
 Generator -->|Generated Question 2| B[Member 2] --> tr --> Formatter`
 
			case 'rolesbased':
				return `flowchart LR
 IN --> Blocker
 Blocker --> Feeder
 Blocker --> OUT
 Feeder --> ct[Chain Of Thought Planner]
 ct  --> Generator 
 Generator --> tr[Text Reducer ]
 tr --> Scorer 
 Scorer --> Formatter 
 Formatter --> OUT 
 Scorer --> Rewriter 
 Rewriter -->  Generator
 
 `
		}
  }
  
  const chart = createChart(team && team.type ? team.type : 'linear')
	  
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
    return false
  };
  
  const defaults = roles  //? Object.keys(roles).map(function(roleKey) {return roles[roleKey].name}) : []
  //console.log(defaults)
  
  
	function downloadTeam() {
		const t = JSON.stringify(utils.exportTeam(teams,teamId, roles))
		console.log(t)
		utils.downloadText(t, teams[teamId].name + '.js')
	}
  /**/
						
 return (
    <>
    <Form id={refresh} onSubmit={function(e) {e.preventDefault(); return false}}>
		<Button onClick={downloadTeam} style={{float:'right'}} variant="success" >{icons.save}</Button>
       <div className="border p-3 mb-3">
		 <Tabs
		  defaultActiveKey="Basics"
		  id="uncontrolled-tab-example"
		  className="mb-3"
		>
		  <Tab eventKey="Basics" title="Info">
			<Row className="mb-3">
				<Form.Group  as={Col} controlId="openaiKey">
					<Row className="mb-12">
					<Col>
				   <Form.Label>Name</Form.Label>
				  <Form.Control type="text" 
				   onChange={(e) => handleChange('name',e)}
					value={team && team.name ? team.name : ''}
				></Form.Control>
				  </Col>
				  <Col>
				   <Form.Label >Category</Form.Label>
					<CategoriesSelector icons={icons} value={team && typeof team.category==='string' ? [team.category] : (team && Array.isArray(team.category) ? team.category : [])} onChange={(e) => handleCategoryChange(e)} defaultOptions={categories ? Object.keys(categories) : []}  />
					
				  </Col>
				  {team && team.type !== 'rolesbased' && <Col style={{textAlign:'right'}} >
				      <Form.Label>Compress&nbsp;</Form.Label>
				      <FormCheck
						style={{display:'inline', marginRight:'0.2em'}} 
						type="checkbox"
						checked={(team && team.compress ? true : false)}
						onChange={(e) => {handleCheckedChange('compress',e)}}
					  />
				  </Col>}
				  </Row>
				</Form.Group>
					<Form.Group  controlId="openaiKey">
					<Form.Label>Welcome Message</Form.Label>
					  <TextareaAutosize 
					   minRows={'1'}
					   style={{width:'100%'}}
						onChange={(e) => saveConfig('welcomeMessage',e.target.value)}
						value={team && team.config && team.config.welcomeMessage ? team.config.welcomeMessage : ''}
					  ></TextareaAutosize>
					</Form.Group>
				<Form.Group  controlId="openaiKey">
				<Form.Label>Skills</Form.Label>
				  <TextareaAutosize 
				   minRows={'1'}
				   style={{width:'100%'}}
					onChange={(e) => handleChange('skills',e)}
					value={team && team.skills ? team.skills : ''}
				  ></TextareaAutosize>
				</Form.Group>
			</Row><Row>	
				<Form.Group style={{clear:'both',marginBottom:'1em',borderBottom:'1px solid grey'}} as={Col} controlId="openaiKey">
					<Row className="mb-12">
					<Col>
				   <Form.Label>Type<HelpDropdown style={{marginRight:'1em', float:'left'}} title="Team Type" content={<b>The flow of information between team members can be ...</b>} icons={icons} /></Form.Label>
				  <Form.Select
					  value={team && team.type ? team.type : 'linear'}
					  onChange={function(e) {handleChange('type',e)}}
					>
						<option value="linear" >Linear</option>
						<option value="linearcollation" >Linear (collate results)</option>
						<option value="parallel"  >Parallel</option>
						<option value="mixtureofexperts"  >Mixture Of Experts</option>
						<option value="rolesbased"  >Roles Based</option>
						<option value="generator"  >Question Generator</option>
					</Form.Select>
					</Col>
					
					{(team && team.type === 'mixtureofexperts') && <Col>
					<Form.Group  controlId="openaiKey">
				<Form.Label>Expert Selector </Form.Label>
				  <RoleOrTeamSelector teamId={teamId} rolesOnly={true}  single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.expert_selector)) ? team.expert_selector : []} onChange={(e) => save('expert_selector',e)} defaultOptions={roles}  />
				</Form.Group>
				  </Col>}
				  {(team && team.type === 'generator') && <Col>
					<Form.Group  controlId="openaiKey">
				<Form.Label>Question Generator</Form.Label>
				  <RoleOrTeamSelector teamId={teamId}   rolesOnly={true}  single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.question_generator)) ? team.question_generator : []} onChange={(e) => save('question_generator',e)} defaultOptions={roles}  />
				</Form.Group>
				  </Col>}
				  {(team && team.type === 'generator') && <Col>
					<Form.Group  controlId="openaiKey">
				<Form.Label>Max Generated Items</Form.Label>
				  <Form.Control type="text" 
				   onChange={(e) => handleChange('max_generated_items',e)}
					value={team && team.max_generated_items ? team.max_generated_items : '2'}
				></Form.Control>
				</Form.Group>
				  </Col>}
				  {chart && <MermaidViewer chart={chart} forceRefresh={forceRefresh} elementId={"mermaidrenderer_1" } />}
				  </Row>
				</Form.Group>
				
			</Row>
			
			<Row>	
				
				{!(team && team.type === 'rolesbased') && <Form.Group style={{borderBottom:'1px solid grey', paddingBottom:'1em', marginBottom:'1em'}}  controlId="openaiKey">
				<Form.Label>Members</Form.Label>
				  <RoleOrTeamSelector  teamId={teamId} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.members)) ? team.members : []} onChange={(e) => save('members',e)} defaultOptions={roles}  />
				</Form.Group>}
				
				
				<Row className="mb-12">
					{(team && team.type === 'rolesbased') && <>
					<Col>
						<Form.Group  controlId="openaiKey">
						<Form.Label>Blocker</Form.Label>
						  <RoleOrTeamSelector  teamId={teamId} rolesOnly={true} single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.blocker)) ? team.blocker : []} onChange={(e) => save('blocker',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>
					
					
					<Col>
						<Form.Group  controlId="openaiKey">
						<Form.Label>Feeder</Form.Label>
						  <RoleOrTeamSelector  teamId={teamId} single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.feeder)) ? team.feeder : []} onChange={(e) => save('feeder',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>
					
					<Col>
						<Form.Group  controlId="openaiKey">
						<Form.Label>Chain Of Thought Planner</Form.Label>
						  <RoleOrTeamSelector teamId={teamId} single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.planner)) ? team.planner : []} onChange={(e) => save('planner',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>
						
					<Col>
						<Form.Group  controlId="generator">
						<Form.Label>Generator <b>(* required)</b></Form.Label>
						  <RoleOrTeamSelector teamId={teamId} single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.generator)) ? team.generator : []} onChange={(e) => save('generator',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>
					
					<Col>
						<Form.Group  controlId="openaiKey">
						<Form.Label>Text Reducer</Form.Label>
						  <RoleOrTeamSelector teamId={teamId} rolesOnly={true}  single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.summariser)) ? team.summariser : []} onChange={(e) => save('summariser',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>
					
					<Col>
						<Form.Group  controlId="openaiKey">
						<Form.Label>Scorer</Form.Label>
						  <RoleOrTeamSelector teamId={teamId} rolesOnly={true}  single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.scorer)) ? team.scorer : []} onChange={(e) => save('scorer',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>
					
					<Col>
						<Form.Group  controlId="openaiKey">
						<Form.Label>Max Iterations</Form.Label>
						  <Form.Control type="text" 
							   onChange={(e) => handleChange('max_iterations',e)}
								value={team && team.max_iterations ? team.max_iterations : '2'}
							></Form.Control>
						</Form.Group>
					</Col>
					
					
					<Col>
						<Form.Group  controlId="rewriter">
						<Form.Label>Rewriter</Form.Label>
						  <RoleOrTeamSelector teamId={teamId} rolesOnly={true}  single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.rewriter)) ? team.rewriter : []} onChange={(e) => save('rewriter',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>
					</>}
					<Col>
						<Form.Group  controlId="rewriter">
						<Form.Label>Formatter</Form.Label>
						  <RoleOrTeamSelector teamId={teamId} rolesOnly={true}  single={true} defaultTeamOptions={teams}  utils={utils} value={(team  && Array.isArray(team.formatter)) ? team.formatter : []} onChange={(e) => save('formatter',e)} defaultOptions={roles}  />
						</Form.Group>
					</Col>

				</Row>
				
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
		</Tabs>
	</div>
      </Form>
    </>
  );
};



			  //<Row>
				//<Col>
				  //<Form.Group controlId="beams">
					//<Form.Label>Beams: {team && team.config && team.config.beams ? team.config.beams : ''}</Form.Label>
					//<Form.Control
					  //type="range"
					  //min={0}
					  //max={20}
					  //value={team && team.config && team.config.beams ? team.config.beams : ''}
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
				

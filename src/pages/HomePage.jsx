import {React, useEffect, useState} from 'react'
import {Row, Button, Tabs, Tab, Nav, Navbar, NavDropdown, Container, Card, Col} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import MarkdownViewer from '../components/MarkdownViewer'
import MermaidViewer from '../components/MermaidViewer'
import {split} from 'sentence-splitter'
import Footer from '../components/Footer'
import Menu from '../components/Menu'
import LoadRoleModal from '../components/LoadRoleModal'

function RolesBasedChart({forceRefresh}) {
  return <MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 6} chart={`flowchart LR
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
    `} />
    
}



export default function HomePage({loadRole,  isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
	let paraStyle={marginTop:'0.5em'}
        
	return <div style={Object.assign({backgroundColor:'rgb(222 212 249)'},bodyStyle)}>
        <Menu {...{isOnlineRef,bodyStyle, creditBalance, refreshHash, icons,token, logout, user,login, config, utils, aiUsage , forceRefresh}}/>
        <Row>
        <Col>&nbsp;</Col>
          <Col sm='3'>
            <Card>
              <Card.Img variant="top" src="/home/office_team.png"   />
              <Card.Body>
                <Card.Title>AI For People</Card.Title>
                <Card.Text>
                A range of expert teams to bring you accurate, relevant information with depth.<br/><br/>
                A simple chat interface hides a flow of queries to language models, web search and code execution putting state of the art tools into the hands of beginners.
                </Card.Text>
                <LoadRoleModal isHomePage={true} {...{forceRefresh, categoryFilter, setCategoryFilter, roles, currentRole, newRole, importRoles, exportRoles, loadRole, setRoles, setCurrentRole, chatHistoryId, categories, setUserMessage, icons,teams, setTeams, currentTeam, setCurrentTeam, teams, chatHistoryId}}  />
			
              </Card.Body>
            </Card>
          </Col>
          <Col sm='3'>
            <Card>
              <Card.Img variant="top" src="/home/creative_team.png"   />
              <Card.Body>
                <Card.Title>AI For Creatives</Card.Title>
                <Card.Text>
                Get more detailed answers to your questions by creating <i>Personas</i> to add context to your questions.<br/><br/>
                Use <i>Teams</i> to create your own flows of information without knowing anything about coding.<br/><br/>
                Create the fine tuned customer ready documents you need.
                </Card.Text>
                <Button variant="primary"><Link to='/roles' style={{textDecoration:'none', color:'white'}}>Show Me Some Examples</Link></Button>
              </Card.Body>
            </Card>
          </Col>
          <Col sm='3'>
            <Card >
              <Card.Img variant="top" src="/home/production_team.png"  />
              <Card.Body>
                <Card.Title>AI For Developers</Card.Title>
                <Card.Text>
                  <ul>
                    <li><a href='https://github.com/syntithenai/talktoateam' target='_new' >Open Source</a> React Framework. <br/>100%  Browser Javascript. Serverside with nodejs.</li>
                    <li>Portable JSON Team definition</li>
                    <li>Standard/OpenAI API based access to many providers</li>
                    <li>Fine grained model selection for Team members</li>
                    <li>Speech Integration</li>
                  </ul>
                
                
                </Card.Text>
                <Button variant="primary"><Link to='/help' style={{textDecoration:'none', color:'white'}}>Learn More</Link></Button>
              </Card.Body>
            </Card>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
       
        <Row style={{marginTop:'8em', textAlign:'center'}}  >
        <Col  >&nbsp;</Col>
        <Col  sm={5} >
            <Card style={{ width: '100%' }}>
              
            <div  ><Card.Img variant="top" src="/home/many_providers.png" style={{textAlign:'center', width:'26rem'}}  /></div>
              <Card.Body>
                <Card.Title>Diverse Models</Card.Title>
                <Card.Text>
                OpenAI continues to release some of the most capable language models. 

                <br/><br/>
                All that power isn't always needed. A very basic language model can be very effective at simple categorisation and transformation tasks. Not to mention faster and cheaper.
                <br/><br/>
                This software supports fine grained selection of models at every step in a team workflow to enable more economic or performant choices.
                </Card.Text>
                <Button variant="primary"><Link to='/pricing' style={{textDecoration:'none', color:'white'}}>Model Providers</Link></Button>
              </Card.Body>
            </Card>
          </Col>
          <Col  sm={5} >
            <Card style={{ width: '100%' }}>
              
            <div  ><Card.Img variant="top" src="/home/search_and_runcode.png" style={{textAlign:'center', width:'26rem'}}  /></div>
              <Card.Body>
                <Card.Title>Tools</Card.Title>
                <Card.Text>
                Language models don't always have the latest information and by their nature are very good at providing compelling justification for incorrect statements.
                <br/><br/>
                By integrating web search and more generally code execution into the processing of querying models, the quality of information improves signficantly.
                <br/><br/>

                </Card.Text>
                <Button variant="primary"><Link to='/help' style={{textDecoration:'none', color:'white'}}>Learn More</Link></Button>
              </Card.Body>
            </Card>
          </Col>
          <Col>&nbsp;</Col>

        </Row>

        <Row style={{marginTop:'2em', textAlign:'center'}}  >
        <Col  >&nbsp;</Col>
        <Col  sm={9} >
            <Card style={{ width: '100%' }}>
              <Card.Body>
                <Card.Title>Rendering</Card.Title>
                <Card.Text>
                <Row>
                  <Col>
                      <Card style={{ width: '100%' }}>
                    
                        <Card.Body>
                          <Card.Title style={{fontSize:'0.9em'}} >Graphs</Card.Title>
                          <Card.Img variant="top" src="/home/world_graph.png" style={{width:'12rem'}}  />
                          <Card.Text>
                          Ask for a graph to explain things using Mermaid Charts. <br/><br/>


                          </Card.Text>
                          
                        </Card.Body>
                      </Card>
                  </Col>
                     
                  <Col>
                    <Card style={{ width: '100%' }}>
                      
                      <Card.Body>
                        <Card.Title style={{fontSize:'0.9em'}} >Coding</Card.Title>
                        <Card.Img variant="top" src="/home/coding.png" style={{width:'12rem'}}  />
                        <Card.Text>
                        Models can generate and run code in a range of programming languages. <br/><br/>
                        This software supports local Javascript and remote code execution.
                        </Card.Text>
                        
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card style={{ width: '100%' }}>
                    
                        <Card.Body>
                          <Card.Title style={{fontSize:'0.9em'}} >Music</Card.Title>
                          <Card.Img variant="top" src="/home/music_notation.png" style={{width:'12rem'}}  />
                          <Card.Text>
                          Most language models have an understanding of ABC notation for music. <br/><br/>
                          Explore theory and harmony, transcribe, compose and more.
                          <br/>
                          </Card.Text>
                          
                        </Card.Body>
                      </Card>
                  </Col>
                </Row>
                      
                      
                      
               </Card.Text>
                
              </Card.Body>
            </Card>
          </Col>
          <Col>&nbsp;</Col>

        </Row>

        <Row style={{marginTop:'2em', textAlign:'center'}}  >
        <Col  >&nbsp;</Col>
        <Col  sm={9} >
            <Card style={{ width: '100%' }}>
              
              <Card.Body>
                <RolesBasedChart forceRefresh={forceRefresh} />
              </Card.Body>
              <Card.Body>
                <Card.Title>Agentic Workflows</Card.Title>
                <Card.Text>
                Implement complex flows of information by using Teams that use Teams.
                <br/><br/>
                Teams can be executed in your web browser.
                <br/><br/>
                Team Workflow definitions can be downloaded as a JSON file to run on a nodejs server for integration with other applications. 
                <br/><br/>
                <Button variant="primary"><a href="https://github.com/syntithenai/talktoateam/issues" target="_new" style={{textDecoration:'none', color:'white'}}>Contact Us</a></Button> for assistance deploying models for public consumption as websites, telephony endpoints and more.
                </Card.Text>
                
              </Card.Body>
            </Card>
          </Col>
          <Col>&nbsp;</Col>

        </Row>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    <Footer icons={icons} />
    </div>

}

	

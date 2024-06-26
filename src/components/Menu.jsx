import {React} from 'react'
import {Row,Col, Button, Tabs, Tab, Nav, Navbar, NavDropdown, Container, Card} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {useEffect, useState, useRef} from 'react'
import {useLocation} from 'react-router-dom'
import SpeechButton from './SpeechButton'

let linkStyle={ textDecoration:'none', marginLeft:'2.2em'}

export default function Menu({setAutoStopMicrophone, autoStopMicrophone, stopLanguageModels, isOnlineRef, simplifiedChat, bodyStyle, creditBalance, refreshHash, token, logout, user,login, utils, usingStt, usingTts, isSpeaking, isMuted, mute, stopAllPlaying, icons, unmute, stopPlaying, lastLlmTrigger, config, aiUsage, forceRefresh, autoStartMicrophone, setAutoStartMicrophone, isPlaying, allowRestart, isWaiting, startWaiting, stopWaiting, onCancel, isReady, setIsReady, onTranscript, onPartialTranscript, setUserMessage}) {
	
	
	const location = useLocation();
	const { hash, pathname, search } = location;
	// console.log(hash, pathname, search)
	return  <Container style={{backgroundColor:'purple'}} fluid >
		<Navbar style={{backgroundColor:'purple', justifyContent:'flex-start'}}  fixed="top" expand="xl" className="navbar-dark"  >
			    <Link style={{color:'white', textDecoration:'none', marginLeft:'0.5em'}} to="/">{icons.teamlarge}</Link>
				<span><Navbar.Toggle aria-controls="basic-navbar-nav" /></span>
				<Navbar.Collapse id="basic-navbar-nav">
						<br/>
						<Nav className="me-auto" >
						<Navbar.Text ><Link style={Object.assign({border:'2px dashed rgb(222, 212, 249)', padding:'0.4em', borderRadius:'20px'},linkStyle)} to="/chat">{icons.chat} Chat Now</Link></Navbar.Text>
						<Navbar.Text ><Link style={linkStyle} to="/menu">{icons.history} History</Link> </Navbar.Text>
						<Navbar.Text ><Link style={linkStyle} to="/roles">{icons.teamlarge} Personas and Teams</Link> </Navbar.Text>
						<Navbar.Text ><Link style={linkStyle} to="/files">{icons.filecopy} Files</Link> </Navbar.Text>
						<Navbar.Text ><Link style={linkStyle} to="/settings">{icons.settings} Settings</Link></Navbar.Text>
						
						<span  style={{marginLeft:'1.8em'}} ><NavDropdown title={<span>{icons.question} Help</span>} id="basic-nav-dropdown">
							<NavDropdown.Item ><Link style={{color:'black', textDecoration:'none'}}  to="/help">User Guide</Link></NavDropdown.Item>
							<NavDropdown.Item target="_new" href="https://github.com/syntithenai/talktoateam/issues" >Support</NavDropdown.Item>
							<NavDropdown.Item ><Link style={{color:'black', textDecoration:'none'}}  to="/pricing">Pricing</Link></NavDropdown.Item>
							<NavDropdown.Item ><Link style={{color:'black', textDecoration:'none'}}  to="/terms">Terms And Conditions</Link></NavDropdown.Item>
							<NavDropdown.Item ><Link style={{color:'black', textDecoration:'none'}}  to="/payment">Buy Credit</Link></NavDropdown.Item>
							{(user && user.email && user.email === 'syntithenai@gmail.com' ) && <NavDropdown.Item ><Link style={{color:'black', textDecoration:'none'}}  to="/admin">Admin</Link></NavDropdown.Item>}
						</NavDropdown></span>
						</Nav>
					</Navbar.Collapse>
					<Navbar.Brand style={{position:'absolute', top: 2, right: -4}}>
						{(token && token.access_token) && <Link style={{textDecoration:'none'}} to="/transactions" ><span style={{ fontSize:'0.8em', color:'rgb(222 212 249)', marginTop:'0.7em',marginRight:'1em'}}> <b>${creditBalance > 0 && token && token.access_token  ? parseFloat(creditBalance).toFixed(2) : 0}</b>
						</span></Link>}
						
						{import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && <span style={{marginTop:'0.3em',marginLeft:'0.2em',marginRight:'0.1em'}} >	
							{(isOnlineRef.current && token && token.access_token) && <Button onClick={function() { logout()}} variant="danger" >{!(user && user.picture) && icons["user_logout"]} {(user && user.picture) && <img height="28" width="28" onError={function(e) { e.target.src= "/user-line.png"}} src={token && token.access_token ? user.picture + '?access_token='+token.access_token + '&not-from-cache-please' : '/clear.gif'} />}</Button>}
						
							{(isOnlineRef.current && !(token && token.access_token)) && <Button onClick={function() { login()}} variant="success" >{icons["user"]}</Button>}
							{!isOnlineRef.current && <Button variant="secondary">Offline</Button>}
						</span>}

						<span style={{marginTop:'0.2em',marginRight:'0.2em'}} >
							{(!simplifiedChat &&  usingTts && pathname.startsWith('/chat')) && <span style={{marginLeft:'0.5em'}}>
								{(!simplifiedChat &&  !isSpeaking && !isMuted) && <button  style={{marginRight: '0.2em', color:'black'}} className="btn  btn-success"  id="muteButton" onClick={function() {mute(); stopAllPlaying()}} title="Mute"  >{icons["volume-vibrate-fill"]}</button>}
								{(!simplifiedChat &&  !isSpeaking && isMuted) && <button  style={{marginRight: "0.2em", color:'black'}} className="btn btn-secondary"  id="unmuteButton" onClick={unmute}  title="UnMute" >{icons["volume-off-vibrate-fill"]}</button>}
								{(!simplifiedChat &&  isSpeaking) && <button  style={{marginRight: "0.2em", color:'black'}} className="btn btn-success"  id="playingButton" onClick={stopPlaying}  title="Stop Playing" >{icons["speak"]}</button>}
							</span>}

							{<span style={{marginLeft:'0.5em', visibility: (usingStt && pathname.startsWith('/chat')) ? 'visible' : 'hidden'}} ><SpeechButton 
								lastLlmTrigger={lastLlmTrigger}
								config={config}
								aiUsage={aiUsage}
								forceRefresh={forceRefresh}
								stopLanguageModels={stopLanguageModels}
								autoStartMicrophone={autoStartMicrophone}
								setAutoStartMicrophone={setAutoStartMicrophone}
								autoStopMicrophone={autoStopMicrophone}
								setAutoStopMicrophone={setAutoStopMicrophone}
								isPlaying={isPlaying}
								allowRestart={true}
								isWaiting={isWaiting}
								startWaiting={startWaiting}
								stopWaiting={stopWaiting}
								onCancel={onCancel}
								isReady={isReady} setIsReady={setIsReady}
								onTranscript = {onTranscript}
								onPartialTranscript = {function(v) {
									//console.log('P:',v)
									setUserMessage(v)
								}}
							/></span>}
						</span>
					</Navbar.Brand>
		
		</Navbar>
	</Container>
	}
	
	// <Container style={{backgroundColor:'purple'}} >
	// 		<Row style={{width:'100%'}}>
				
				
				
	// 		</Row>



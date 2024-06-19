import {React} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
 
export default function TermsPage({creditBalance, refreshHash, icons,token, logout, user,login }) {
	
	let paraStyle={marginTop:'0.5em'}
	return (<div className="App" style={{textAlign:'left'}} id={refreshHash} >
			<div id="menu" style={{zIndex:'9', backgroundColor:'lightgrey', border:'1px solid grey', position: 'fixed', top: 0, left: 0, width: '100%', height:'3em'}}  >
				
				<span style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}} >
					<Link style={{marginLeft:'0.1em'}} to="/menu"><Button>{icons.menu}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/chat"><Button>{icons.chat}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/roles"><Button >{icons.teamlarge}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/settings"><Button >{icons.settings}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/help"><Button >{icons.question}</Button></Link>
				</span>
				
				{import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && <span style={{float:'right',marginTop:'0.3em',marginLeft:'0.2em',marginRight:'01em'}} >	
				{(token && token.access_token) && <Button onClick={function() { logout()}} variant="danger" >{!(user && user.picture) && icons["user_logout"]} {(user && user.picture) && <img height="28" width="28" src={user.picture + '?access_token='+token.access_token + '&not-from-cache-please'} />}</Button>}
				
				{!(token && token.access_token) && <Button onClick={function() { login()}} variant="success" >{icons["user"]}</Button>}
				</span>}
				{<Link to="/tokens" ><span style={{color:'black', float:'right', marginTop:'0.7em',marginRight:'1em'}}> <b>${creditBalance > 0 && token && token.access_token  ? parseFloat(creditBalance).toFixed(2) : 0}</b>
				</span></Link>}
			</div>
			
			<div id="body" style={{paddingLeft:'0.3em',paddingRight:'0.3em',textAlign:'left', zIndex:'3',position: 'relative', top: '3em', left: 0, width: '100%',  paddingTop:'0.2em', backgroundColor:'white'}}  >
							<h3>Terms And Conditions</h3>
							
							<div style={paraStyle}>This software is provided as is without guarantees or warranties.</div>
							<br/>
							<div style={paraStyle}>The software is open source MIT style license so you can modify and use it however you like without attribution. See <a href="https://github.com/syntithenai/syntithenai_agents" target="_new">Github for details</a></div>
							<br/>
			</div>
			
			<div style={{position: 'fixed', bottom: 5, right:5, backgroundColor: 'white', height: '2em', width:'2em', borderRadius:'50px'}} >
				<a target='new' href="https://github.com/syntithenai/syntithenai_agents" style={{color:'black', borderRadius:'50px'}}  >{icons["github"]}</a>
			</div> 
	</div>)
}

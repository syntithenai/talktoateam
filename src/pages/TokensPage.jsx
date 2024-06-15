import {React, useState, useEffect, useRef} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
 import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function TokensPage({icons, aiUsage, refreshHash, token, user, login, logout, utils, config}) {
	
	// search filter
	const twoWeeksAgo = new Date()
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
	const tomorrow = new Date()
	tomorrow.setDate(tomorrow.getDate() + 1)
	const [startDate, setStartDateInner] = useState(twoWeeksAgo);
	const startDateRef = useRef()
	function setStartDate(a) {
		setStartDateInner(a)
		startDateRef.current = a
	}
	const [endDate, setEndDateInner] = useState(tomorrow);
	const endDateRef = useRef()
	function setEndDate(a) {
		setEndDateInner(a)
		endDateRef.current = a
	}
	
    // results
	const [collated, setCollated] = useState([])
	const [tallies, setTallies] = useState([])
	const [grandTotals, setGrandTotals] = useState([])
	
	useEffect(function() {
		search()
	},[])
	let keyTallies = {}
	
	function search() {
		let collatedData = aiUsage.collated(startDateRef.current, endDateRef.current)
		setCollated(collatedData.logs)
		setTallies(collatedData.tallies)
		setGrandTotals(collatedData.grandTotals)
	} 
		
	let paraStyle={marginTop:'0.5em'}
	const {openAiBillable} = utils.summariseConfig(config)
	return (<div className="App" style={{marginLeft:'0.5em',textAlign:'left'}} id={refreshHash} >
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
				{<Link to="/tokens" ><span style={{color:'black', float:'right', marginTop:'0.7em',marginRight:'1em'}}> <b>{aiUsage.getTotal()}</b>
				</span></Link>}
			</div>
			
			<div id="body" style={{paddingLeft:'0.3em',paddingRight:'0.3em',textAlign:'left', zIndex:'3',position: 'relative', top: '3em', left: 0, width: '100%',  paddingTop:'0.2em', backgroundColor:'white'}}  >
							<div>
		
		
		<div style={{borderBottom:'2px solid black', marginBottom:'1em', paddingBottom:'1em'}}>
			<h4>Search</h4>
			<b>From:</b> <DatePicker selected={startDate} onChange={(date) => {setStartDate(date); search()}} />
			&nbsp;&nbsp;&nbsp;<b>To:</b> <DatePicker selected={endDate} onChange={(date) => {setEndDate(date); search()}} />
			
		</div>
		<Button style={{float:'right'}}  variant="success" onClick={function() {utils.downloadText(JSON.stringify(collated),"statistics.json")}} >{icons.save}</Button>
			
		<div style={{borderBottom:'2px solid black', marginBottom:'1em', paddingBottom:'1em'}} >
			<h4>Grand Totals</h4>
			<table><thead>
				<tr><th>Tokens In</th><th>Tokens Out</th><th>Total Tokens</th><th>Cost In</th><th>Cost Out</th><th>Total Cost</th></tr>
				</thead>
				<tbody>
				<tr>
					<td>{grandTotals.tokens_in > 0 ? grandTotals.tokens_in : 0}</td>
					<td>{grandTotals.tokens_out > 0 ? grandTotals.tokens_out : 0}</td>
					<td>{grandTotals.tokens_in + grandTotals.tokens_in > 0 ? grandTotals.tokens_in + grandTotals.tokens_in : 0}</td>
					<td>{grandTotals.cost_in > 0 ? grandTotals.cost_in : 0}</td>
					<td>{grandTotals.cost_out > 0 ? grandTotals.cost_out : 0}</td>
					<td>{grandTotals.cost_in + grandTotals.cost_out > 0 ? grandTotals.cost_in + grandTotals.cost_out : 0}</td></tr>
				</tbody>
			</table>
			<br/>
		</div>
		{Object.keys(collated).map(function(urlAndKey, uk) {
			let parts = urlAndKey.split(":::::")
			let url = parts[0]
			let key = (parts && parts.length) > 0 ? parts[1] : ''
			keyTallies[url] = keyTallies[url] > 0 ? keyTallies[url] + 1 : 1
			let urlTallies = {}
			let tdStyle = {border: '1px solid black', paddingLeft:'0.3em'}
			return <div key={uk} >
				<h5>Key: {keyTallies[url]}    {url}</h5>
				<table>
				<thead>
				<tr><th>Date</th><th>Tokens In</th><th>Tokens Out</th><th>Total Tokens</th><th>Cost In</th><th>Cost Out</th><th>Total Cost</th></tr>
				</thead>
				<tbody>
				{collated[urlAndKey].map(function(logEntry, lk) {
					//urlTallies.tokens_in
					return <tr key={lk} style={{ border:'1px solid black', backgroundColor: lk%2===0 ? 'lightgrey' : 'lightblue' }} ><td style={tdStyle} >{new Date(logEntry.date).toLocaleString()}</td><td style={tdStyle} >{logEntry.tokens_in}</td><td style={tdStyle} >{logEntry.tokens_out}</td><td style={tdStyle} >{logEntry.tokens_in + logEntry.tokens_out}</td><td style={tdStyle} >{logEntry.price_in}</td><td style={tdStyle} >{logEntry.price_out}</td><td style={tdStyle} >{logEntry.price_in + logEntry.price_out}</td></tr>
				})}
				<tr><td><b></b></td><td><b>{tallies[urlAndKey].tokens_in}</b></td><td><b>{tallies[urlAndKey].tokens_out}</b></td><td><b>{tallies[urlAndKey].tokens_out + tallies[urlAndKey].tokens_out}</b></td><td><b>{tallies[urlAndKey].price_in}</b></td><td><b>{tallies[urlAndKey].price_out}</b></td><td><b>{tallies[urlAndKey].price_in + tallies[urlAndKey].price_out}</b></td></tr>
				</tbody>
				</table>
			</div>
			
		})}
	</div>
			</div>
			
			<div style={{position: 'fixed', bottom: 5, right:5, backgroundColor: 'white', height: '2em', width:'2em', borderRadius:'50px'}} >
				<a target='new' href="https://github.com/syntithenai/syntithenai_agents" style={{color:'black', borderRadius:'50px'}}  >{icons["github"]}</a>
			</div> 
	</div>)
	
}

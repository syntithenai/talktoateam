import {React, useState, useRef} from 'react'
import {Button, Modal, ListGroup, Form, Tabs, Badge} from 'react-bootstrap'
import CategoriesSelectorModal from './CategoriesSelectorModal'

import useIcons from '../useIcons'
import {Link  } from 'react-router-dom'
import useUtils from '../useUtils'

export default function TeamList({onChange, chatHistoryId, teams, setTeams , mini, currentTeam, setCurrentTeam, categories, deleteTeam, handleClose, forceRefresh, setCurrentRole, categoryFilter, setCategoryFilter}) {
	const icons = useIcons()
	const hiddenInput = useRef()
	const [search, setSearch] = useState('')
	let utils = useUtils()
	const randomId = utils.generateRandomId()
	
	function newTeam() {
		
	}
	
	
	function searchFilterFunction(teamKey) {
		//console.log("S",teamKey, search, categoryFilter)
		if (search.trim().length === 0) {
			let team = teams[teamKey]
			let allowCategory = true
			if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
				categoryFilter.forEach(function(f) {
					if (!(Array.isArray(team.category) && team.category.indexOf(f) !== -1)) {
						allowCategory = false
					} 
				})
				return allowCategory
			} else {
				return true
			}
		} else {
			if (teams && teams[teamKey] && teams[teamKey].name && teams[teamKey].name.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1) {
				let team = teams[teamKey]
				let allowCategory = true
				if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
					categoryFilter.forEach(function(f) {
						if (!(Array.isArray(team.category) && team.category.indexOf(f) !== -1)) {
							allowCategory = false
						} 
					})
					return allowCategory
				} else {
					return true
				}
				return true
			} else {
				return false
			}
		}
	}
	
	function sortTeams(a,b) {
		//console.log('s',teams[a].category, teams[b].category)
		if (teams && teams[a] && teams[b]) {
			if (!teams[a].name) {
				return -1
			} else if (!teams[b].name) {
				return 1
			} else if (teams[a].name.trim() < teams[b].name.trim()) {
				//console.log("neg")
				return -1
			} else if (teams[a].name.trim() > teams[b].name.trim()) {
				//console.log("pos")
				return 1
			} else if (teams[a].name.trim() === teams[b].name.trim()) {
				
			}
		} else {
			return 1
		}
		//else {
			//if (a.name < b.name) {
				//return -1
			//} else if (a.name > b.name) {
				//return 1
			//}
		//}
	}
	
	//let aa = teams && currentTeam && teams[currentTeam] && Array.isArray(teams[currentTeam].category) && teams[currentTeam].category.length > 0 ? teams[currentTeam].category[0] : null
	//aa ? "/team/" + randomId + "/" + aa : "/team"

	return (
		<>
			<Link to={"/team" }><Button variant="success" style={{float:'left', borderRight:'1px solid black'}} onClick={function() {newTeam();  }} >{icons.plus}</Button></Link>
			
			<Form.Control style={{width:'20em', float:'left', marginLeft:'1em'}} placeholder="Search" type="input" value={search} onChange={function(e) {setSearch(e.target.value)}} />
			
			<span style={{float:'left', marginLeft:'1em'}} ><CategoriesSelectorModal allowNew={false} value={categoryFilter} onChange={function(e) {setCategoryFilter(e)}}  defaultOptions={categories ? Object.keys(categories) : []} /></span>
			  
			{!mini && <>
			
			  
			  </>}
			  <div style={{clear:'both', marginBottom:'0.4em'}} />
			   <ListGroup >
				  {teams && Object.keys(teams).filter(searchFilterFunction).sort(sortTeams).map(function(teamKey) {
					  let team = teams[teamKey]
					 return mini ? 
						<ListGroup.Item key={teamKey} >
							<Button onClick={function() {onChange(teamKey)}} variant="outline-primary" style={{width:'70%', textAlign:'left'}} > {team.name}</Button>
							<div style={{clear:'both', marginTop:'0.2em'}}  >{Array.isArray(team.category) && team.category.map(function(c) {
									return <Badge variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{marginLeft:'0.2em'}} >{c}</Badge>
							})	}</div>
						</ListGroup.Item>
						:
						<ListGroup.Item key={teamKey}  >
							<Button style={{float:'right'}} variant="danger" onClick={function() {deleteTeam(teamKey)}} >{icons.bin}</Button>
							
							
							
							<Link to={"/team/"+teamKey } onClick={function() {setCurrentTeam(teamKey, chatHistoryId);if (handleClose) handleClose() ; forceRefresh(); }} ><Button variant="outline-primary" style={{textAlign:'left'}}  > 
								{team.name} &nbsp;&nbsp;&nbsp;
								<Badge style={{float:'right', marginLeft:'0.5em'}} >{icons.palette} {team && team.samples ? team.samples.length : 0}</Badge>
							</Button></Link>
							<div style={{float:'right', marginTop:'0.2em', marginRight:'1em'}}  >{Array.isArray(team.category) && team.category.map(function(c) {
									return <Badge variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{marginLeft:'0.2em'}} >{c}</Badge>
							})	}</div>
							
						</ListGroup.Item> 
				  })}
				  
				</ListGroup>
		</>
	)
}

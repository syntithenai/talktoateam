import {React, useState, useRef} from 'react'
import {Button, ButtonGroup, Modal, ListGroup, Form, Tabs, Badge} from 'react-bootstrap'
import CategoriesSelectorModal from './CategoriesSelectorModal'

import useIcons from '../useIcons'
import {Link  } from 'react-router-dom'

export default function RoleList({onChange, chatHistoryId, roles,deleteRole, setRoles, loadRole, importRoles, exportRoles, newRole, mini, handleClose, setCurrentRole, setCurrentTeam,  categories, duplicateRole, forceRefresh, categoryFilter, setCategoryFilter}) {
	const icons = useIcons()
	const [search, setSearch] = useState('')
	const hiddenInput = useRef()
	function iRoles(e) {
		importRoles(e)
		hiddenInput.current.value=''; 
	}
	
	
	
	function searchFilterFunction(roleKey) {
		//console.log("S",roleKey, search, categoryFilter)
		if (search.trim().length === 0) {
			let role = roles[roleKey]
			let allowCategory = true
			if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
				categoryFilter.forEach(function(f) {
					if (!(Array.isArray(role.category) && role.category.indexOf(f) !== -1)) {
						allowCategory = false
					} 
				})
				return allowCategory
			} else {
				return true
			}
		} else {
			if (roles && roles[roleKey] && roles[roleKey].name && roles[roleKey].name.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1) {
				let role = roles[roleKey]
				let allowCategory = true
				if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
					categoryFilter.forEach(function(f) {
						if (!(Array.isArray(role.category) && role.category.indexOf(f) !== -1)) {
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
	
	function sortRoles(a,b) {
		//console.log('s',roles[a].category, roles[b].category)
		if (!roles[a].name) {
			return -1
		} else if (!roles[b].name) {
			return 1
		} else if (roles[a].name.trim() < roles[b].name.trim()) {
			//console.log("neg")
			return -1
		} else if (roles[a].name.trim() > roles[b].name.trim()) {
			//console.log("pos")
			return 1
		} else if (roles[a].name.trim() === roles[b].name.trim()) {
			
		}
		//else {
			//if (a.name < b.name) {
				//return -1
			//} else if (a.name > b.name) {
				//return 1
			//}
		//}
	}
	
	
	return (
		<>
			<Link to={mini ? "/role" : "/role" }><Button variant="success" style={{float:'left', borderRight:'1px solid black'}} onClick={function() {newRole(); if (handleClose) handleClose() }} >{icons.plus}</Button></Link>
			
			<Form.Control style={{width:'40%', float:'left', marginLeft:'1em'}} placeholder="Search" type="input" value={search} onChange={function(e) {setSearch(e.target.value)}} />
			
			<span style={{float:'left', marginLeft:'1em'}} ><CategoriesSelectorModal allowNew={false} value={categoryFilter} onChange={function(e) {setCategoryFilter(e)}}  defaultOptions={categories ? Object.keys(categories) : []} /></span>
			  
			
			  <div style={{clear:'both', marginBottom:'0.4em'}} />
			   <ListGroup >
				  {roles && Object.keys(roles).filter(searchFilterFunction).sort(sortRoles).map(function(roleKey) {
					  let role = roles[roleKey]
					 return mini ? 
						<span>
							<ListGroup.Item key={roleKey} >
								<Button onClick={function() {onChange(roleKey)}} variant="outline-primary" style={{ textAlign:'left'}}  > {role.name} </Button>
								<div style={{clear:'both', marginTop:'0.5em'}}   >{Array.isArray(role.category) && role.category.map(function(c) {
										return <Badge variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{marginLeft:'0.2em'}} >{c}</Badge>
								})	
								}</div>
							</ListGroup.Item>
							
							
						</span>
						:
						<div key={roleKey}  >
							<div style={{border:'1px solid blue', padding:'0.1em'}} >
								<Link to={"/role/"+roleKey }  onClick={function() {setCurrentRole(roleKey, chatHistoryId); setCurrentTeam(null);  forceRefresh()}} >
									<Button variant="outline-primary" style={{ textAlign:'left'}}  ><Badge >{icons.palette} {role && role.samples ? role.samples.length : 0}</Badge> {role.name} </Button>
								</Link>
								<ButtonGroup style={{float:'right', marginLeft:'0.3em'}} >
									<Button style={{textAlign:'right'}} variant="warning" onClick={function() {duplicateRole(roleKey)}} >{icons.filecopy}</Button>
									<Button style={{textAlign:'right'}} variant="danger" onClick={function() {deleteRole(roleKey)}} >{icons.bin}</Button>
								</ButtonGroup>
								
								<span style={{clear:'both'}}  >{Array.isArray(role.category) && role.category.map(function(c) {
									return <Badge variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{ float:'right', marginLeft:'0.2em'}} >{c}</Badge>
								})	}</span>
								
							</div>
							
						</div> 
				  })}
				  
				</ListGroup>
		</>
	)
}

import {React, useState, useRef} from 'react'
import {Button, ButtonGroup, Modal, ListGroup, Form, Tabs, Badge} from 'react-bootstrap'
import CategoriesSelectorModal from './CategoriesSelectorModal'

import useIcons from '../useIcons'
import {Link  } from 'react-router-dom'

export default function StarredRoleAndTeamList({teams, icons, onChange, chatHistoryId, roles,deleteRole, setRoles, loadRole, importRoles, exportRoles, newRole, mini, handleClose, setCurrentRole, setCurrentTeam,  categories, duplicateRole, forceRefresh, categoryFilter, setCategoryFilter}) {
	
	
	function sortItems(a,b) {
		//console.log('s',roles[a].category, roles[b].category)
		if (!a || !b ) return -1
        if (!roles[a] || !roles[a].name) {
			return -1
		} else if (!roles[b] ||  !roles[b].name) {
			return 1
		} else if (roles[a].name.trim().toLowerCase() < roles[b].name.trim().toLowerCase()) {
			//console.log("neg")
			return -1
		} else if (roles[a].name.trim().toLowerCase() > roles[b].name.trim().toLowerCase()) {
			//console.log("pos")
			return 1
		} else if (roles[a].name.trim().toLowerCase() === roles[b].name.trim().toLowerCase()) {
			
		}
		//else {
			//if (a.name < b.name) {
				//return -1
			//} else if (a.name > b.name) {
				//return 1
			//}
		//}
	}
    let filterStarred = function(a) {
        // console.log(a && a.isStarred  ? "YT" : "NN ",a)
        return a.isStarred ? true : false
    } 
    // add ids to team objects
    let teamsPlus = Object.keys(teams).map(function(t) {
        let team = teams[t]
        team.id = t
        return team
    })
	let rolesPlus = Object.keys(roles).map(function(t) {
        let role = roles[t]
        role.id = t
        return role
    })
    let items = [].concat(Object.values(rolesPlus).filter(filterStarred).map(function(i) {return Object.assign({},i,{list_type: 'role'})}), Object.values(teamsPlus).filter(filterStarred).map(function(i) {return Object.assign({},i,{list_type: 'team'})}))
	
    return (
		<>
			  <div style={{clear:'both', marginBottom:'0.4em'}} />
			   <ListGroup >
				  {items && Object.keys(items).sort(sortItems).map(function(roleKey) {
					  let role = items[roleKey]
					  return mini ? 
						<ListGroup.Item key={roleKey} >
							<Button onClick={function() {onChange(role.id)}} variant="outline-primary" style={{width:'70%', textAlign:'left'}} > {role.name}</Button>
							<div style={{clear:'both', marginTop:'0.2em'}}  >{Array.isArray(role.category) && role.category.map(function(c) {
									return <Badge variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{marginLeft:'0.2em'}} >{c}</Badge>
							})	}</div>
						</ListGroup.Item>
						:
					    <ListGroup.Item key={roleKey}  style={{ backgroundColor:'white', borderBottom:'1px solid lightgrey'}}>
							<div style={{padding:'0.1em', backgroundColor:'white' }} >
								<Link to={role.list_type === 'team' ? "/team/"+role.id : "/role/"+role.id } style={{float:'left'}}   onClick={function() {setCurrentRole(roleKey, chatHistoryId); setCurrentTeam(null);  forceRefresh()}} >
									<Button variant="outline-primary" style={{ textAlign:'left'}}  >{role.list_type === 'team' && <Badge>{icons.team}</Badge>} <Badge >{icons.palette} {role && role.samples ? role.samples.length : 0}</Badge> {role.name} </Button>
								</Link>
								<ButtonGroup style={{float:'right', marginLeft:'0.3em'}} >
									<Button style={{textAlign:'right'}} variant="warning" onClick={function() {duplicateRole(roleKey)}} >{icons.filecopy}</Button>
									<Button style={{textAlign:'right'}} variant="danger" onClick={function() {deleteRole(roleKey)}} >{icons.bin}</Button>
								</ButtonGroup>
								
								<span style={{clear:'both'}}  >{Array.isArray(role.category) && role.category.map(function(c) {
									return <Badge key={c} variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{ float:'right', marginLeft:'0.2em'}} >{c}</Badge>
								})	}</span>
								
							</div>
							
						</ListGroup.Item> 
				  })}
				  
				</ListGroup>
		</>
	)
}

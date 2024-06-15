import React from 'react'
import {ButtonGroup, Button} from 'react-bootstrap'
import SelectSampleModal from './SelectSampleModal'
import LoadRoleModal from './LoadRoleModal'
import {Link} from 'react-router-dom'

export default function AssistantSelector({forceRefresh, roles, currentRole, newRole, importRoles, exportRoles, loadRole, setRoles, setCurrentRole, chatHistoryId, categories, setUserMessage, icons,teams, setTeams, currentTeam, setCurrentTeam, categoryFilter, setCategoryFilter})  {
	let content = null
	if (currentTeam) {
		content = <ButtonGroup style={{border:'1px solid blue', padding:'0.1em', float:'left', marginBottom:'0.3em'}} >
			{(currentTeam && teams && teams[currentTeam]) && <Link style={{fborder:'1px solid blue'}} className="button" to={"/team/" + currentTeam} ><Button variant="outline-none" >
				{icons.pencil}
			</Button></Link>}
			
			<LoadRoleModal {...{forceRefresh, categoryFilter, setCategoryFilter, roles, currentRole, newRole, importRoles, exportRoles, loadRole, setRoles, setCurrentRole, chatHistoryId, categories, setUserMessage, icons,teams, setTeams, currentTeam, setCurrentTeam, teams}}  />
			
			<SelectSampleModal setUserMessage={setUserMessage} samples={teams && teams[currentTeam] && Array.isArray(teams[currentTeam].samples) ? teams[currentTeam].samples : []}/>
		</ButtonGroup>
	// USE PERSONA/ROLE
	} else {
		content = <ButtonGroup style={{border:'1px solid blue', padding:'0.1em', float:'left', marginBottom:'0.3em'}} >
			{(currentRole && roles && roles[currentRole]) && <Link style={{fborder:'1px solid blue'}} className="button" to={"/role/" + currentRole} ><Button variant="outline-none" >
				{icons.pencil}
			</Button></Link>}
			
			<LoadRoleModal {...{forceRefresh, categoryFilter, setCategoryFilter, roles, currentRole, newRole, importRoles, exportRoles, loadRole, setRoles, setCurrentRole, chatHistoryId, categories, setUserMessage, icons,teams, setTeams, currentTeam, setCurrentTeam, teams, chatHistoryId}}  />
			
			<SelectSampleModal setUserMessage={setUserMessage} samples={roles && roles[currentRole] && Array.isArray(roles[currentRole].samples) ? roles[currentRole].samples : []}/>
		</ButtonGroup>
	}
	
	return <div>{content}</div>
	

}

import {React, useState, useRef} from 'react'
import {Button, Modal, ListGroup, Form, Tabs, Tab, Badge} from 'react-bootstrap'

import useIcons from '../useIcons'

import TTSConfigForm from './TTSConfigForm'
import STTConfigForm from './STTConfigForm'
import LLMConfigForm from './LLMConfigForm'
//import SystemMessageForm from './SystemMessageForm'
import RoleList from './RoleList'
import TeamList from './TeamList'
import {Link} from 'react-router-dom'

export default function LoadRoleModal(props) {
	const {chatHistoryId, roles, setRoles, loadRole, importRoles, currentRole, exportRoles, newRole, setCurrentRole, teams, currentTeam, setCurrentTeam, categoryFilter, setCategoryFilter, forceRefresh} = props
	const [show, setShow] = useState(false);
	const icons = useIcons()
	const handleClose = () => {
		setShow(false);
	}
	const handleShow = () => setShow(true);
	const hiddenInput = useRef()
	
	let useName = (teams && currentTeam && teams[currentTeam]) ? teams[currentTeam].name : ((roles && roles[currentRole]) ? roles[currentRole].name : '')
	
	function unsetAssistantSelection(e) {
		setCurrentRole(null)
		setCurrentTeam(null)
		e.preventDefault()
		e.stopPropagation()
	}
	if (!show) {
		return <Button variant="primary"  onClick={handleShow} >{icons.team} {useName}{(currentTeam || currentRole) && <Badge style={{marginLeft:'1em'}} onClick={unsetAssistantSelection} >{icons.close}</Badge>}</Button>
	} else {
		return (
			<>
			  <Modal
				show={show} 
				onHide={handleClose}
			  >
				<Modal.Header closeButton>
				  <Modal.Title style={{marginRight:'2em'}}>Talk To
				  </Modal.Title>
				  
				</Modal.Header>
				<Modal.Body style={{minHeight:'50em'}}>
				 <Tabs
				  defaultActiveKey="roles"
				  id="uncontrolled-tab-example"
				  className="mb-3"
				>
					<Tab eventKey="roles" title="Persona">
						<RoleList {...props} mini={true} onChange={function(e) {console.log("onchange set role",e);setCurrentRole(e, chatHistoryId); setCurrentTeam(null); handleClose()}} handleClose={handleClose} categories={props.categories}  forceRefresh={forceRefresh} />
					</Tab>
					<Tab eventKey="teams" title="Team">
						<TeamList {...props} mini={true} onChange={function(e) {console.log("onchange set team",e); setCurrentRole(null); setCurrentTeam(e, chatHistoryId); handleClose()}} handleClose={handleClose} categories={props.categories}  forceRefresh={forceRefresh}  />
					</Tab>
				</Tabs>
				</Modal.Body>
				
			  </Modal>
			</>
		)
	}
}

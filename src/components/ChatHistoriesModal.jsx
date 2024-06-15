import {React, useState, useRef} from 'react'
import {Button, Modal, ListGroup, Form, Tabs} from 'react-bootstrap'

import useIcons from '../useIcons'

import ChatHistories from './ChatHistories'


export default function ChatHistoriesModal(props) {
	const {chatHistories,setChatHistories, chatHistory,setChatHistory, setSystemConfig, setSystemMessage, setCategory, setCurrentRole, duplicateChatHistory} = props
	const [show, setShow] = useState(false);
	const icons = useIcons()
	const handleClose = () => {
		setShow(false);
	}
	const handleShow = () => setShow(true);
	const hiddenInput = useRef()
	const [refresh,setRefresh] = useState()
	
	return (
		<>
		  <Button variant="primary" style={{float:'left', borderRight:'1px solid black'}} onClick={handleShow} >{icons.menu}</Button>
		  
		  <Modal
			show={show}
			onHide={handleClose}
			id={refresh}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>Load Chat History</Modal.Title>
			</Modal.Header>
			
			<Modal.Body style={{minHeight:'50em'}}>

			  <div style={{clear:'both', marginBottom:'0.4em'}} />
			  <ChatHistories {...props} />
			   
			</Modal.Body>
			
		  </Modal>
		</>
	)
}

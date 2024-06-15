import {React, useState, useRef} from 'react'
import {Button, Modal, ListGroup, Form, Tabs} from 'react-bootstrap'

import useIcons from '../useIcons'

import TTSConfigForm from './TTSConfigForm'
import STTConfigForm from './STTConfigForm'
import LLMConfigForm from './LLMConfigForm'
import {Link} from 'react-router-dom'

export default function SelectSampleModal(props) {
	const {setUserMessage, samples} = props
	const [show, setShow] = useState(false);
	const icons = useIcons()
	const handleClose = () => {
		setShow(false);
	}
	const handleShow = () => setShow(true);
	const hiddenInput = useRef()
	
	return samples && samples.length > 0 ? (
		<>
			<Button onClick={handleShow} variant="outline-primary" >{icons['palette']}</Button>
		  
		  <Modal
			show={show}
			onHide={handleClose}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>Select a Sample
			  
			  </Modal.Title>
			  
			</Modal.Header>
			<Modal.Body style={{minHeight:'50em'}}>
			<ListGroup style={{clear:'both'}} >
			{samples.map(function(sample, k) {
				return <ListGroup.Item key={k} onClick={function() {setUserMessage(sample); handleClose()}} >{sample}</ListGroup.Item>
			})}
			</ListGroup>
			</Modal.Body>
			
		  </Modal>
		</>
	) : null
}

			

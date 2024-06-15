import {React, useState, useRef, useEffect} from 'react'
import {Button, Modal, ListGroup, Form, Tabs} from 'react-bootstrap'

import useIcons from '../useIcons'


export default function ConfirmDialog(props) {
	const {onConfirm, onCancel, title, message, forceShow, setForceShow} = props
	const [show, setShow] = useState(false);
	const icons = useIcons()
	const handleClose = () => {
		setShow(false);
	}
	const handleShow = () => setShow(true);
	const okButton = useRef()
	
	useEffect(function() {
		if (forceShow) {
			setShow(true)
			setForceShow(false)
		} 
		//else {
			//setShow(false)
		//}
	},[forceShow])

	return (
		<>
		  
		  <Modal
			animation={false}
			show={show}
			onHide={handleClose}
		>
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>{title ? title : ''}</Modal.Title>
			</Modal.Header>
			
			<Modal.Body style={{minHeight:'10em'}}>

			  <div style={{clear:'both', marginBottom:'0.4em'}} >
				{message ? message : ''}
			  </div>
			  <div style={{clear:'both', marginTop:'1.4em'}} >
			  <Form onSubmit={onConfirm} >
				<Button autoFocus={true} ref={okButton} style={{float:'left'}} onClick={function(e) {setForceShow(false);setShow(false);  onConfirm(e)}} variant="success" >OK</Button> 
				<Button style={{float:'right'}} onClick={function(e) {setForceShow(false);setShow(false); onCancel(); e.preventDefault(); return false}} variant="danger" >Cancel</Button> 
			  </Form>
			  </div>
			
			</Modal.Body>
			
		  </Modal>
		</>
	)
}

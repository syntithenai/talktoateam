import {React, useState, useRef, useEffect} from 'react'
import {Button, Modal, ListGroup, Form, Tabs} from 'react-bootstrap'

import useIcons from '../useIcons'
import TextareaAutosize from 'react-textarea-autosize';

export default function MessageEditorDialog({value, onChange}) {
	const [show, setShow] = useState(false);
	const icons = useIcons()
	const handleClose = () => {
		setShow(false);
	}
	const handleShow = () => setShow(true);
	const hiddenInput = useRef()
	
	if (!show) {
		return 	<Button variant="primary" style={{zIndex:0,float:'left', borderRight:'1px solid black', marginRight:'1px'}} onClick={handleShow} >{icons.pencil}</Button>
	} else {
		return (
		<>
		  

		  <Modal dialogClassName="fullwidthmodal"
			show={show}
			onHide={handleClose}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>Edit Message</Modal.Title>
			  
			</Modal.Header>
			<Modal.Body style={{minHeight:'50em'}}>
			<div style={{clear:'both'}} ></div>
			<TextareaAutosize 
					   minRows={'12'}
					   style={{width:'100%'}}
						onChange={(e) => {
							//console.log("CHANGE TEXT",e)
							onChange(e.target.value)
						}}
						value={value ? value : ''}
						
		   	  ></TextareaAutosize>
		   	  
			</Modal.Body>
			
		  </Modal>
		</>
	)}
}
//<div>
				//<Button style={{marginLeft:'0.2em'}} variant="danger">Cancel</Button>
				//<Button style={{marginRight:'0.2em', float:'right'}} variant="success">OK</Button>
			//</div>

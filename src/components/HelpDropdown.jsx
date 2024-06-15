import React, { useState } from 'react';
import { Modal, Button} from 'react-bootstrap';

export default function HelpDropdown({ title, content, icons, style }) {
	const [show, setShow] = useState(false);
	const handleClose = () => {
		setShow(false);
	}
	const handleShow = () => setShow(true);
	
	return <span>
			<Button style={style} onClick={handleShow} variant="outline-primary" >{icons['question']}</Button>
		  
		  <Modal
			show={show}
			onHide={handleClose}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>{title}</Modal.Title>
			  
			</Modal.Header>
			<Modal.Body style={{minHeight:'50em'}}>
			{content}
			</Modal.Body>
			
		  </Modal>
		</span>
	
}

			

import {React, useState, useRef} from 'react'
import {Button, Modal, ListGroup, Form, Tabs, Tab, Badge} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import useIcons from '../useIcons'

import {Link} from 'react-router-dom'

export default function AdminAddTransactionModal({disabled, loadUserTransactions, icons, user, token}) {
	const [show, setShow] = useState(false);
	const handleClose = () => {
		setShow(false);
	}
	const navigate = useNavigate()
	const handleShow = () => setShow(true);
	const hiddenInput = useRef()
	const [amount, setAmount] = useState(0)
	const [type, setType] = useState('credit')
	
	function submitForm() {
		handleClose()
		fetch(import.meta.env.VITE_API_URL + '/admin_add_transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer '+(token ? token.access_token : '')
            },
            body: JSON.stringify({amount: amount, type: type, user:user, model:''}),
        }).then(function(response) {
            if (response.ok) {
				setAmount(0)
				setType('credit')
                loadUserTransactions()
			}
        })
	}

	if (!show) {
		return <Button variant="success" disabled={disabled} style={{marginRight:'2em'}}   onClick={handleShow} >Add Transaction</Button>
	} else {
		return (
			<>
			  <Modal
				show={show} 
				onHide={handleClose}
			  >
				<Modal.Header closeButton>
				  <Modal.Title style={{marginRight:'2em'}}>Add A Transaction
				  </Modal.Title>
				  
				</Modal.Header>
				<Modal.Body style={{minHeight:'50em'}}>
				<Form onSubmit={submitForm}>
					<Form.Label>User</Form.Label>
					<Form.Control type="text" disabled={true} value={user}/>
                    <Form.Label>Amount $</Form.Label>
					<Form.Control type='text' value={amount} onChange={function(e) {setAmount(e.target.value)}}  />
					<Form.Label>Type</Form.Label>
					<Form.Select value={type} onChange={function(e) {setType(e.target.value)}} >
						<option value="credit">Credit</option>
						<option value="adjustment">Adjustment</option>
					</Form.Select>
					<Button style={{marginTop:'1em'}} onClick={submitForm} >Add Transaction</Button>
                </Form>
				</Modal.Body>
				
			  </Modal>
			</>
		)
	}
}

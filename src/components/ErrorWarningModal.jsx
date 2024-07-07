import {Button, Modal, Row, Col} from 'react-bootstrap'
import {Link} from 'react-router-dom'


export default function ErrorWarningModal({errorMessage, setErrorMessage, icons}) {

  function handleClose() {setErrorMessage('')}

    return <Modal className="fullwidthmodal" show={true} onHide={handleClose}>
    <Modal.Header closeButton>
      {<Modal.Title>Error</Modal.Title>}
    </Modal.Header>
    <Modal.Body >
    {errorMessage}
    </Modal.Body>
    <Modal.Footer >
      <Row>
        <Col><Link to='/settings/externaltools'  onClick={handleClose} ><Button style={{minWidth:'6em'}}>Settings</Button></Link></Col>
        <Col><Link to='/payment'  onClick={handleClose}  ><Button variant="success" style={{minWidth:'9em'}} >Buy Credit</Button></Link></Col>
        <Col><Button variant="danger" onClick={handleClose} style={{minWidth:'6em'}} >Close</Button></Col>
      </Row>
    </Modal.Footer>
  </Modal>
}
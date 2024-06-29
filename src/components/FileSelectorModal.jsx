import {useState} from 'react'
import {Button, ButtonGroup, Modal, ListGroup, Badge, ListGroupItem} from 'react-bootstrap'
import useIcons from '../useIcons'
import ModelSelector from './ModelSelector'

export default function FileSelectorModal(props) {
    const {files,  defaultOptions, onChange , value, icons} = props
  const [show, setShow] = useState(false);
  const handleClose = () => {
      setShow(false);
  }
  const handleShow = () => setShow(true);
  
  function onChangeWrap(v) {
    onChange(v)
    handleClose()
  }

  if (!show) {
	  return <Button style={{maxWidth: '30em', float:'left', color:'green'}} size="sm" variant="outline-success"  onClick={handleShow} >{icons.cursor}</Button>
     
  } else  {
  
  return (
    <span style={{float:'right'}} >
       
     
      <Modal className="fullwidthmodal" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          {<Modal.Title>Select File</Modal.Title>}
        </Modal.Header>
        <Modal.Body style={{minHeight:'800px'}} >
         {Array.isArray(files) && <ListGroup>{files.map(function(f) {
            return <ListGroupItem onClick={function() {
              let items = value
              items.push(f.id)
              onChangeWrap(items)
            }} >{f.name}</ListGroupItem>
        })}</ListGroup>}
        </Modal.Body>
        <Modal.Footer style={{minHeight:'800px', verticalAlign:'top'}} >
         
        </Modal.Footer>
      </Modal>
    </span>
  );
}
}

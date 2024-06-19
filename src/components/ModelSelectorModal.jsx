import {useState} from 'react'
import {Button, ButtonGroup, Modal, ListGroup, Badge} from 'react-bootstrap'
import useIcons from '../useIcons'
import ModelSelector from './ModelSelector'

export default function ModelSelectorModal({ defaultOptions, onChange , value, icons}) {
    
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
	  return <Button style={{maxWidth: '30em', float:'left'}} size="sm" variant="secondary"  onClick={handleShow} >
			<span style={{float:'left'}} >{icons.brain}</span>
      <span> {value}</span> 
		</Button>
     
  } else  {
  
  return (
    <span style={{float:'right'}} >
       
     
      <Modal className="fullwidthmodal" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          {<Modal.Title>Select Model</Modal.Title>}
        </Modal.Header>
        <Modal.Body style={{minHeight:'800px'}} >
        
            <ModelSelector onChange={onChangeWrap}  value={value} defaultOptions={defaultOptions} />
        </Modal.Body>
        <Modal.Footer style={{minHeight:'800px', verticalAlign:'top'}} >
         
        </Modal.Footer>
      </Modal>
    </span>
  );
}
}

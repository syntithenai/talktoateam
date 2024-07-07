import {useState, useEffect} from 'react'
import {Button, Modal, ListGroup, Badge} from 'react-bootstrap'
import useIcons from '../useIcons'
import useUtils from '../useUtils'
export default function ToolSelector({defaultOptions, onChange , value , forceRefresh, userTools}) {
    const utils = useUtils()
    const icons = useIcons()
    const [show, setShow] = useState(false);
    const [options, setOptions] = useState([]);
    const [filter, setFilter] = useState('');

    function filterChange(e) {
      let f = e.target.value
      setFilter(f)
      var sortedOptions = defaultOptions && Array.isArray(defaultOptions) ? defaultOptions : []
      if (f && f.length > 0) {
        sortedOptions = sortedOptions.filter(function (a) {if ( !f || f.length === 0 || (filter && a && ((a.name && a.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1)) )) return true; else return false})
      }
      setOptions(sortedOptions)
    }

    useEffect(function() {
      var sortedOptions = defaultOptions && Array.isArray(defaultOptions) ? defaultOptions : []
      setOptions(sortedOptions)
    },[])

    function selectTool(tool) {
      console.log('sel tool',tool)
      let newTool = JSON.parse(JSON.stringify(tool))
      delete newTool.no_delete
      var newValue = Array.isArray(value) ? value : []
      newValue.push(newTool)
      var uniqueSelected = newValue //utils.uniquifyArray(newValue)
      setFilter('')
      setShow(false)
      setOptions(defaultOptions)
      console.log('sel tool FINal',uniqueSelected)
      onChange(uniqueSelected)
    }
    
    function deselectTool(toolKey) {
      console.log('desel tool',toolKey, value)
      // var uniqueSelected = value.filter(function(selectedTool) {
      //   if (selectedTool === tool) {
      //     return false
      //   } else {
      //     return true
      //   }
      // })

      //onChange(uniqueSelected)
      value.splice(toolKey,1)

      onChange(value)
    }
  
    function handleShow() {
      setShow(true)
    }

    function handleClose() {
      setShow(false)
    }

    return (<>
			<div style={{width:'100%', height:'2em'}}><Button style={{float:'right'}}  onClick={handleShow} variant="success" >{icons['cursor']} Select</Button></div>
		   
		  <Modal
			show={show}
			onHide={handleClose}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>Select a Tool
			  
			  </Modal.Title>
			  
			</Modal.Header>
			<Modal.Body style={{minHeight:'50em'}}>
			<div style={{width:'100%'}}>
        <input type='search' value={filter} onChange={filterChange}   />
      </div>
      {show && <div style={{position:'relative', top:'0px', width: '100%'}} >
        <ListGroup  style={{textAlign:'left',clear:'both', width: '100%'}}>
          {options.map(function(option,tk) {
            return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	selectTool(option)}} >
              <div style={{marginBottom:'0.1em'}} >{option.name}</div>
              <div style={{marginBottom:'0.4em', fontSize:'0.6em'}} >{option.description}</div>
              </ListGroup.Item>
          })}
        </ListGroup>
      
        
      </div>}
			</Modal.Body>
			
		  </Modal>
		</>
    
    );
}

// {Array.isArray(value) && value.map(function(tool, toolKey) {
//   return <Button style={{marginLeft:'0.2em', marginBottom:'0.2em'}} onClick={function() {deselectTool(toolKey)}}>{icons.bin} {tool.name}</Button>
// })} 
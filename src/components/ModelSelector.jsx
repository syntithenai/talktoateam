import {useState, useEffect} from 'react'
import {Button, Modal, ListGroup, Badge} from 'react-bootstrap'
import useIcons from '../useIcons'

export default function ModelSelector({defaultOptions, onChange , value , forceRefresh}) {
    
  const icons = useIcons()
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState([]);
  const [filter, setFilter] = useState('');

    function selectModel(model) {
      console.log('sel model',model)
      setFilter('')
      setOptions(defaultOptions)
      onChange(model.provider + ' ' + model.model)
    }
    
    function filterChange(e) {
      let f = e.target.value
      setFilter(f)
      var sortedOptions = defaultOptions && Array.isArray(defaultOptions) ? defaultOptions : []
      if (f && f.length > 0) {
        sortedOptions = sortedOptions.filter(function (a) {if ( !f || f.length === 0 || (filter && a && ((a.model && a.model.toLowerCase().indexOf(filter.toLowerCase()) !== -1) || (a.provider && a.provider.toLowerCase().indexOf(filter.toLowerCase()) !== -1)) )) return true; else return false})
      }
      setOptions(sortedOptions)
    }

    useEffect(function() {
      var sortedOptions = defaultOptions && Array.isArray(defaultOptions) ? defaultOptions : []
      setOptions(sortedOptions)
    },[])


  
  return (
    <>
		<div style={{width:'100%'}}>
        <input type='search' value={filter} onChange={filterChange}   />
        </div>
        {<div style={{position:'relative', top:'0px', zIndex:10, width: '100%'}} >
          <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
            {options.map(function(option,tk) {
              return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	selectModel(option)}} >
                <div style={{marginBottom:'0.4em'}} ><b>{option.provider}</b> {option.model}</div>
                {option.comments && <div style={{marginBottom:'0.4em'}} >{option.comments}</div>}
                <div  >
                {option.parameters && <Button  style={{marginLeft:'0.5em'}} variant="secondary" >{option.parameters}B Parameters</Button>}
                {option.context_length && <Button  style={{marginLeft:'0.5em'}} variant="secondary" >{parseInt(option.context_length)/1024}k Context</Button>}
                <Button style={{marginLeft:'0.5em'}} variant="outline-success" >$In/Out {option.price_in}/{option.price_out}</Button>
                {option.tags && <div >{option.tags.map(function(tag) {return <Button style={{marginBottom:'0.4em', marginTop:'0.4em', marginLeft:'0.4em'}}  variant="warning" >{tag}</Button>})}</div>}
                </div>
                
                </ListGroup.Item>
            })}
          </ListGroup>
          
          
        </div>}
    </>
  );
}

 //<Button onClick={function() {
              //handleClose()
            //}} variant="success" style={{float:'right', marginBottom:'0.3em'}}>OK</Button>

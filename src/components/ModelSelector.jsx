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
      onChange(model)
    }
    
    function filterChange(e) {
      let f = e.target.value
      setFilter(f)
      var sortedOptions = Array.isArray(defaultOptions) ? defaultOptions : []
      if (f && f.length > 0) {
        sortedOptions = sortedOptions.filter(function (a) {if ( !f || f.length === 0 || (filter && a && ((a.model && a.model.toLowerCase().indexOf(filter.toLowerCase()) !== -1) || (a.provider && a.provider.toLowerCase().indexOf(filter.toLowerCase()) !== -1)) )) return true; else return false})
      }
      setOptions(sortedOptions)
    }

    useEffect(function() {
      var sortedOptions = Array.isArray(defaultOptions) ? defaultOptions : []
      setOptions(sortedOptions)
    },[])


  
  return (
    <>
		<div>
        <input type='search' value={filter} onChange={filterChange}   />
         
        </div>
        {<div style={{position:'relative', top:'0px', zIndex:10}} >
          <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
            {options.map(function(option,tk) {
              return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	selectModel(option)}} ><b>{option.provider}</b> {option.model}</ListGroup.Item>
            })}
          </ListGroup>
          
          
        </div>}
        {JSON.stringify(defaultOptions)}
    </>
  );
}

 //<Button onClick={function() {
              //handleClose()
            //}} variant="success" style={{float:'right', marginBottom:'0.3em'}}>OK</Button>

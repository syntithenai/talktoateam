import {useState, useEffect} from 'react'
import {Button, Modal, ListGroup, Badge} from 'react-bootstrap'
import useIcons from '../useIcons'

export default function ModelSelector({defaultOptions, onChange , value }) {
    
  const icons = useIcons()
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('');
  const [options, setOptions] = useState(defaultOptions);
    
    
    useEffect(function() {
		setOptions(defaultOptions)
	},[defaultOptions])
    
     /**
     * Remove all duplicates from an array
     */ 
    function uniquifyArray(a) {
        if (Array.isArray(a)) {
            var index = {}
            a.map(function(value) {
                index[value] = true 
                return null
            })
            return Object.keys(index)
        } else {
            return []
        }
    } 
    
  var filterChangeTimeout = null
  
  function filterChange(e) {
    setFilter(e.target.value.toLowerCase())
    if (!e.target.value) {
      setOptions(defaultOptions)
    } else {
      if (filterChangeTimeout) clearTimeout(filterChangeTimeout) 
      filterChangeTimeout = setTimeout(function() {
		  let newOptions = Array.isArray(options) ? options : []
        setOptions(newOptions.filter(function(option) {
			if (option.indexOf(e.target.value) !== -1) {
				return true
			}
			return false
		}))
      },500)
    }
  } 
  
  
    function selectModel(model) {
      console.log('sel model',model)
      setFilter('')
      setOptions(defaultOptions)
      onChange(uniqueCategoriesSelected)
    }
    
    
    const [showOptions, setShowOptions] = useState(false)
  var sortedOptions = Array.isArray(options) ? options : []
    sortedOptions.sort(function (a,b) {if (a > b) return 1; else return -1})
  return (
    <>
		<div>
          <input type='search' value={filter} onChange={filterChange} onFocus={function() {setShowOptions(true)}} onBlur={function() {
			  setTimeout(function() {
				  setShowOptions(false)
			  },500)
		  }}  />
         
          
        </div>
        {showOptions && <div style={{position:'relative', top:'-40px', zIndex:10}} >
          <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
            {sortedOptions.map(function(option,tk) {
              return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	selectModel(option)}} >{option}</ListGroup.Item>
            })}
          </ListGroup>
        </div>}
      
    </>
  );
}

 //<Button onClick={function() {
              //handleClose()
            //}} variant="success" style={{float:'right', marginBottom:'0.3em'}}>OK</Button>

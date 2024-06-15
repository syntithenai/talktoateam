import {useState} from 'react'
import {Button, ButtonGroup, Modal, ListGroup, Badge} from 'react-bootstrap'
import useIcons from '../useIcons'

function CategoriesSelectorModal({defaultOptions, forceRefresh, onChange , value , allowNew, blockDeselectAll}) {
    
    const icons = useIcons()
  const [show, setShow] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(false);
  const [filter, setFilter] = useState('');
  const [options, setOptions] = useState(defaultOptions);
  const handleClose = () => {
      setShow(false);
  }
  const handleShow = () => setShow(true);
  
  //console.log(props,options)
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
  
  
    function newCategory(category) {
        //console.log('new category',category)
        if(category && category.trim()) {
            var newValue = Array.isArray(value) ? value : []
            newValue.push(category)
            var uniqueCategoriesSelected = uniquifyArray(newValue)
            setFilter('')
            setOptions(options)
			onChange(uniqueCategoriesSelected)
			//forceRefresh()
	   
        }
    }
    
    function selectCategory(category) {
        //console.log('sel category',category)
      var newValue = Array.isArray(value) ? value : []
      newValue.push(category)
      var uniqueCategoriesSelected = uniquifyArray(newValue)
      setFilter('')
      setOptions(options)
            onChange(uniqueCategoriesSelected)
            //forceRefresh()
    }
    
    function deselectCategory(category) {
        //console.log('desel category',category)
      var uniqueCategoriesSelected = value.filter(function(selectedCategory) {
        if (selectedCategory === category) {
          return false
        } else {
          return true
        }
      })
             onChange(uniqueCategoriesSelected)
            //forceRefresh()
    }
    
   
    
  var sortedOptions = Array.isArray(options) ? options : []
    sortedOptions.sort(function (a,b) {if (a > b) return 1; else return -1})
  
  
  if (!show) {
	  return <ButtonGroup  style={{height:'2.37em'}} variant="secondary" >
        {!blockDeselectAll && <Button size="sm" variant="dark"  onClick={function() {onChange([])}} >{icons.close}</Button>}
        <Button size="sm" variant="secondary"  onClick={handleShow} >
			<span> {icons.tag}</span> 
			{!blockDeselectAll && <>&nbsp;&nbsp;&nbsp;{(value && Array.isArray(value)) && value.join(",")}</>}
		</Button>
      </ButtonGroup>
  } else  {
  
  return (
    <span style={{float:'right'}} >
       
     
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          {<Modal.Title>Select Categories</Modal.Title>}
          
        </Modal.Header>
        <Modal.Body style={{minHeight:'800px'}} >
         <Button onClick={function() {
              handleClose()
            }} variant="success" style={{float:'right', marginBottom:'0.3em'}}>OK</Button>
          <div>{Array.isArray(value) && value.map(function(selectedCategory) {
              return <Button key={selectedCategory} style={{marginRight:'0.2em'}} variant="info" onClick={function(e) {deselectCategory(selectedCategory)}} >{icons.bin}&nbsp;{selectedCategory}</Button>
            })}</div>
           <div style={{clear:'both', marginTop:'1em'}} /> 
          <input type='search' value={filter} onChange={filterChange} onFocus={function() {}} onBlur={function() {
			  
		  }}  />
		  
          {allowNew && <Button style={{marginLeft:'0.3em'}} key="newcategory" onClick={function() {newCategory(filter)}}  >New Category</Button>}
           <ListGroup  style={{zIndex:'30',clear:'both', width: '100%'}}>
            {sortedOptions.map(function(option,tk) {
              return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {selectCategory(option)}} >{option}</ListGroup.Item>
            })}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer style={{minHeight:'800px', verticalAlign:'top'}} >
         
        </Modal.Footer>
      </Modal>
    </span>
  );
}
}
export default CategoriesSelectorModal
 //<Button onClick={function() {
              //handleClose()
            //}} variant="success" style={{float:'right', marginBottom:'0.3em'}}>OK</Button>

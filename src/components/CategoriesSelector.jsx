import {useState, useEffect} from 'react'
import {Button, Modal, ListGroup, Badge} from 'react-bootstrap'
import useIcons from '../useIcons'

export default function CategoriesSelector({defaultOptions, onChange , value }) {
    
  const icons = useIcons()
  const [show, setShow] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(false);
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
      setOptions(uniqueCategoriesSelected)
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
    
   
    const [showOptions, setShowOptions] = useState(false)
  var sortedOptions = Array.isArray(options) ? options : []
    sortedOptions.sort(function (a,b) {if (a > b) return 1; else return -1})
  return (
    <>
		<div>
          <input type='search' value={filter} onChange={filterChange} onFocus={function() {setShowOptions(true)}} onBlur={function() {
			  setTimeout(function() {
				  setShowOptions(false)
			  },200)
		  }}  />
          {(options.length === 0) && <Button style={{marginLeft:'0.3em'}} key="newcategory" onClick={function() {newCategory(filter)}}  >{icons.add}</Button>}
           <div style={{clear:'both', marginTop:'0.5em'}} /> 
           
         {showOptions && <div style={{position:'relative', zIndex:10}} >
          <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
            {sortedOptions.map(function(option,tk) {
              return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	selectCategory(option)}} >{option}</ListGroup.Item>
            })}
          </ListGroup>
        </div>}
        <div>{Array.isArray(value) && value.map(function(selectedCategory) {
              return <Button key={selectedCategory} style={{marginRight:'0.2em'}} variant="secondary" onClick={function(e) {deselectCategory(selectedCategory)}} >{icons.bin}&nbsp;{selectedCategory}</Button>
            })}</div>
          
        </div>
        
    </>
  );
}

 //<Button onClick={function() {
              //handleClose()
            //}} variant="success" style={{float:'right', marginBottom:'0.3em'}}>OK</Button>

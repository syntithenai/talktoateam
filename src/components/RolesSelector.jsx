import {useState, useEffect} from 'react'
import {Button, Modal, ListGroup, Badge, ButtonGroup, Tabs, Tab} from 'react-bootstrap'
import useIcons from '../useIcons'
import {Link} from 'react-router-dom'
import TeamList from './TeamList'
import RoleList from './RoleList'

export default function RolesSelector(props) {
	const {categoryFilter, setCategoryFilter} = props
  const {defaultOptions, onChange , value , single, utils} = props  
  const icons = useIcons()
  const [show, setShow] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(false);
  //const [filter, setFilter] = useState('');
  const [options, setOptions] = useState(defaultOptions);
    
    function handleClose() {}
    
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
    setCategoryFilter(e.target.value.toLowerCase())
    if (!e.target.value) {
      setOptions(defaultOptions)
    } else {
      if (filterChangeTimeout) clearTimeout(filterChangeTimeout) 
      filterChangeTimeout = setTimeout(function() {
		  let newOptions = {}
          Object.keys(defaultOptions).map(function(roleKey) {
			if (roleKey && defaultOptions && defaultOptions[roleKey] && defaultOptions[roleKey].name && defaultOptions[roleKey].name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1)   {
				newOptions[roleKey] = defaultOptions[roleKey]
			}
		  })
          setOptions(newOptions)
      },500)
    }
  } 
  
  function moveUp(index) {
	 //console.log('U',value, index)
	 let tmp = value.length > index ? value[index] : ''
	 value[index] = value[index -1]
	 value[index - 1] = tmp
	 onChange(value)
  }
  
  function moveDown(index) {
	 //console.log('D',value, index)
	 let tmp = value.length > index ? value[index] : ''
	 value[index] = value[index +1]
	 value[index + 1] = tmp 
	 onChange(value)
  }
  
  function canMoveUp(index) {
	  return index > 0
  }
  
  function canMoveDown(index) {
	  return Array.isArray(value) && index < value.length -1
  }

    function selectRole(role) {
        console.log('sel role',role)
      if (!single) {
		  var newValue = Array.isArray(value) ? value : []
		  newValue.push(role)
		  //var uniqueRolesSelected = uniquifyArray(newValue)
		  setCategoryFilter('')
		  //setOptions(uniqueRolesSelected)
		  onChange(newValue)      
	  } else {
		  //setOptions([role])
		  console.log('sel role single',[role])
		  onChange([role])
	  }
	  
      
            //forceRefresh()
    }
    
    function deselectRole(roleIndex) {
        //console.log('desel role',role)
        value.splice(roleIndex,1)
        onChange(value)
      //var uniqueRolesSelected = value.filter(function(selectedRole) {
        //if (selectedRole === role) {
          //return false
        //} else {
          //return true
        //}
      //})
             //onChange(uniqueRolesSelected)
            //forceRefresh()
    }
    
   const newId = utils.generateRandomId();
    const [showOptions, setShowOptions] = useState(false)
    //console.log(options)
  var sortedOptions = options ? Object.keys(options) : []
    sortedOptions.sort(function (a,b) {if (a && b && options[a]  && options[b] && options[a].name > options[b].name) return 1; else return -1})
  return (
    <>
		<div>
         
          

           
           <input type='search' value={categoryFilter} onChange={filterChange} onFocus={function() {setShowOptions(true)}} onBlur={function() {
			  setTimeout(function() {
				  setShowOptions(false)
			  },500)
		  }}  />
           <div style={{clear:'both', marginTop:'1em'}} /> 
            
          <div>{Array.isArray(value) && value.map(function(roleKey,roleIndex) {
              return <ButtonGroup key={roleIndex} style={{marginRight:'0.2em'}} >
				{(!single && canMoveUp(roleIndex)) &&  <Button onClick={function(i) {moveUp(roleIndex)}}  variant="info">{icons.left}</Button>}
				{(defaultOptions && defaultOptions[roleKey]) && <Link to={"/role/"+roleKey} ><Button  variant="info">{icons.pencil}</Button></Link>}
				<Button key={roleKey} variant="info" onClick={function(e) {deselectRole(roleIndex)}} >{icons.bin}</Button>
				<Button variant="info" >{defaultOptions && defaultOptions[roleKey]? defaultOptions[roleKey].name : ''}</Button>
				{(!single && canMoveDown(roleIndex)) && <Button onClick={function(i) {moveDown(roleIndex)}} variant="info">{icons.right}</Button>}
              </ButtonGroup>
            })}</div>
          
			</div>
			{showOptions && <div style={{position:'relative', top:'-5px', zIndex:10, backgroundColor:'white'}} >
				 <Tabs
			  defaultActiveKey="roles"
			  id="uncontrolled-tab-example"
			  className="mb-3"
			>
				<Tab eventKey="roles" title="Persona">
					<Link onClick={function() { selectRole(newId);}} to={"/role/"+newId} ><Button style={{float:'right'}} variant="success"  >{icons.add}</Button></Link>
					  <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
						{sortedOptions.map(function(option,tk) {
							let o = options[option]
						  return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	setCategoryFilter(''); selectRole(option); }} >{o.name}</ListGroup.Item>
						})}
					  </ListGroup>
				</Tab>
				<Tab eventKey="teams" title="Team">
					<TeamList {...props} mini={true} handleClose={handleClose} categories={props.categories} />
				</Tab>
				
			</Tabs>
				
			</div>}
      
    </>
  );
}

 //<Button onClick={function() {
              //handleClose()
            //}} variant="success" style={{float:'right', marginBottom:'0.3em'}}>OK</Button>

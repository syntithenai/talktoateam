import {React, useState, useRef, useEffect} from 'react'
import {Button, Modal, ListGroup, Form, Tabs, Tab, ButtonGroup} from 'react-bootstrap'
import useIcons from '../useIcons'
import {Link} from 'react-router-dom'

export default function RoleOrTeamSelector(props) {
	//const {roles, setRoles, loadRole, importRoles, currentRole, exportRoles, newRole, setCurrentRole, teams, currentTeam} = props
	const {teamId, defaultTeamOptions, defaultOptions, onChange , value , single, utils, rolesOnly, categoryFilter, setCategoryFilter, roles, teams, currentTeam} = props  
	const newId = utils.generateRandomId();
	const [showOptions, setShowOptions] = useState(false)
    const [show, setShow] = useState(false);
	const icons = useIcons()
	const handleClose = () => {
		setFilter('')
		setShow(false);
		//onChange(o.id)
	}
	const handleShow = () => setShow(true);
	const hiddenInput = useRef()
	const [filter, setFilter] = useState('');
    const [options, setOptions] = useState(defaultOptions);
    const [teamOptions, setTeamOptions] = useState(defaultTeamOptions);
	useEffect(function() {
		setOptions(defaultOptions)
	},[defaultOptions])
	useEffect(function() {
		setTeamOptions(defaultTeamOptions)
	},[defaultTeamOptions])
	//let useName = (teams && currentTeam && teams[currentTeam]) ? teams[currentTeam].name : ((roles && roles[currentRole]) ? roles[currentRole].name : '')
	
	  var filterChangeTimeout = null
  
	function filterChange(e) {
		setFilter(e.target.value.toLowerCase())
		if (!e.target.value) {
			setOptions(defaultOptions)
			console.log("SETDEF",defaultTeamOptions)
			setTeamOptions(defaultTeamOptions)
		} else {
			if (filterChangeTimeout) clearTimeout(filterChangeTimeout) 
			filterChangeTimeout = setTimeout(function() {
			  let newOptions = {}
			  let newTeamOptions = {}
			  Object.keys(defaultOptions).map(function(roleKey) {
				if (roleKey && defaultOptions && defaultOptions[roleKey] && defaultOptions[roleKey].name && defaultOptions[roleKey].name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1)   {
					newOptions[roleKey] = defaultOptions[roleKey]
				}
			  })
			  Object.keys(defaultTeamOptions).map(function(roleKey) {
				if (roleKey && defaultTeamOptions && defaultTeamOptions[roleKey] && defaultTeamOptions[roleKey].name && defaultTeamOptions[roleKey].name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1)   {
					newTeamOptions[roleKey] = defaultTeamOptions[roleKey]
				}
			  })
			  setOptions(newOptions)
			  setTeamOptions(newTeamOptions)
			},5)
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
        //console.log('sel role',role)
      if (!single) {
		  var newValue = Array.isArray(value) ? value : []
		  newValue.push(role)
		  //var uniqueRolesSelected = uniquifyArray(newValue)
		  setFilter('')
		  //setOptions(uniqueRolesSelected)
		  onChange(newValue)      
	  } else {
		  //setOptions([role])
		  console.log('sel role single',[role])
		  onChange([role])
	  }
	}
    
    function deselectRole(roleIndex) {
        //console.log('desel role',role)
        value.splice(roleIndex,1)
        onChange(value)
     }
	let firstCategory = defaultTeamOptions && teamId && defaultTeamOptions[teamId] && defaultTeamOptions[teamId].category && defaultTeamOptions[teamId].category[0] ? "/" + defaultTeamOptions[teamId].category[0] : ''
	
	//console.log(options)
	var sortedOptions = options ? Object.keys(options) : []
    sortedOptions.sort(function (a,b) {if (a && b && options[a]  && options[b] && options[a].name > options[b].name) return 1; else return -1})
	var sortedTeamOptions = teamOptions ? Object.keys(teamOptions) : []
    sortedTeamOptions.sort(function (a,b) {if (a && b && teamOptions[a]  && teamOptions[b] && teamOptions[a].name > teamOptions[b].name) return 1; else return -1})
	
	// STARRED
	function sortItems(a,b) {
		return 0
		console.log('s',roles[a].category, roles[b].category)
		
		if (!a || !b ) return -1
        if (!roles[a] || !roles[a].name) {
			return -1
		} else if (!roles[b] ||  !roles[b].name) {
			return 1
		} else if (roles[a].name.trim().toLowerCase() < roles[b].name.trim().toLowerCase()) {
			//console.log("neg")
			return -1
		} else if (roles[a].name.trim().toLowerCase() > roles[b].name.trim().toLowerCase()) {
			//console.log("pos")
			return 1
		} else if (roles[a].name.trim().toLowerCase() === roles[b].name.trim().toLowerCase()) {
			
		}
		//else {
			//if (a.name < b.name) {
				//return -1
			//} else if (a.name > b.name) {
				//return 1
			//}
		//}
	}
    let filterStarred = function(a) {
        // console.log(a && a.isStarred  ? "YT" : "NN ",a)
        return a.isStarred ? true : false
    } 
    // add ids to team objects
    let teamsPlus = teamOptions ? Object.keys(teamOptions).map(function(t) {
        let team = teamOptions[t]
        team.id = t
        return team
    }) : []
	let rolesPlus = options ? Object.keys(options).map(function(t) {
        let role = options[t]
        role.id = t
        return role
    }) : []
    let items = [].concat(Object.values(rolesPlus).filter(filterStarred).map(function(i) {return Object.assign({},i,{list_type: 'role'})}), Object.values(teamsPlus).filter(filterStarred).map(function(i) {return Object.assign({},i,{list_type: 'team'})}))
   	// console.log(teamOptions, teamsPlus, items)
		//let aa = teams && currentTeam && teams[currentTeam] && Array.isArray(teams[currentTeam].category) && teams[currentTeam].category.length > 0 ? teams[currentTeam].category[0] : null
	//aa ? "/team/" + randomId + "/" + aa : "/team"
	return (
		<>
		 {<Button variant="primary" style={{marginBottom:'0.8em',marginLeft:'1em'}} onClick={handleShow} >{icons.add}</Button>}
		  <div>{Array.isArray(value) && value.map(function(roleKey,roleIndex) {
              return <ButtonGroup key={roleIndex} style={{marginRight:'0.2em'}} >
				{(roleKey.startsWith("TEAM:::::")) && <>
					{(!single && canMoveUp(roleIndex)) &&  <Button onClick={function(i) {moveUp(roleIndex)}}  variant="primary">{icons.left}</Button>}
					{(defaultTeamOptions && defaultTeamOptions[roleKey.slice(9)]) && <Link to={"/team/"+roleKey.slice(9)} ><Button  variant="primary">{icons.pencil}</Button></Link>}
					<Button key={roleKey} variant="primary" onClick={function(e) {deselectRole(roleIndex)}} >{icons.bin}</Button>
					<Button variant="primary" >{defaultTeamOptions && defaultTeamOptions[roleKey.slice(9)]? defaultTeamOptions[roleKey.slice(9)].name : ''}</Button>
					{(!single && canMoveDown(roleIndex)) && <Button onClick={function(i) {moveDown(roleIndex)}} variant="primary">{icons.right}</Button>}
				</>}
				{!(roleKey.startsWith("TEAM:::::")) && <>
					{(!single && canMoveUp(roleIndex)) &&  <Button onClick={function(i) {moveUp(roleIndex)}}  variant="info">{icons.left}</Button>}
					{(defaultOptions && defaultOptions[roleKey]) && <Link to={"/role/"+roleKey} ><Button  variant="info">{icons.pencil}</Button></Link>}
					<Button key={roleKey} variant="info" onClick={function(e) {deselectRole(roleIndex)}} >{icons.bin}</Button>
					<Button variant="info" >{defaultOptions && defaultOptions[roleKey]? defaultOptions[roleKey].name : ''}</Button>
					{(!single && canMoveDown(roleIndex)) && <Button onClick={function(i) {moveDown(roleIndex)}} variant="info">{icons.right}</Button>}
				</>}
				</ButtonGroup>
            })}</div>

		  <Modal
			show={show}
			onHide={handleClose}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>Select Persona Or Team
			  </Modal.Title>
			  
			</Modal.Header>
			<Modal.Body style={{minHeight:'50em'}}>
				<input type='search' value={filter} onChange={filterChange} onFocus={function() {setShowOptions(true)}} onBlur={function() {
				  setTimeout(function() {
					  setShowOptions(false)
				  },500)
			  }}  />
			   <div style={{clear:'both', marginTop:'1em'}} /> 
			
				{<div style={{position:'relative', top:'-5px', zIndex:10, backgroundColor:'white'}} >
					 <Tabs
				  defaultActiveKey="starred"
				  id="uncontrolled-tab-example"
				  className="mb-3"
				>
					<Tab eventKey="starred" title="Starred">
						  <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
							{items.sort(sortItems).map(function(o,tk) {
								
							  return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	
									console.log(o); 
									if (o.list_type === 'team') {
										selectRole("TEAM:::::"+o.id);
									} else if (o.list_type === 'role') {
										selectRole(o.id)
									}
									setFilter(''); 
									handleClose() 
								}} >
							    <span  >{(options && options[o] && Array.isArray(options[o].category)) && options[o].category.map(function(c) {
									return <Button variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{float:'right', marginLeft:'0.2em'}} >{c}</Button>
								})	
								}</span>
								
							  {o.name}
							  
							  </ListGroup.Item>
							})}
						  </ListGroup>
					</Tab>
					<Tab eventKey="roles" title="Persona">
						<Link onClick={function() {selectRole(newId); }}  to={"/role/" + newId + firstCategory } ><Button style={{float:'right'}} variant="success"  >{icons.add}</Button></Link>
						  <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
							{sortedOptions.map(function(option,tk) {
								let o = options[option]
							  return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	selectRole(option); setFilter(''); handleClose() }} >
							    <span  >{(options && options[o] && Array.isArray(options[o].category)) && options[o].category.map(function(c) {
									return <Button variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{float:'right', marginLeft:'0.2em'}} >{c}</Button>
								})	
								}</span>
								
							  {o.name}
							  
							  </ListGroup.Item>
							})}
						  </ListGroup>
					</Tab>
					{!rolesOnly && <Tab eventKey="teams" title="Team">
						<Link onClick={function() {selectRole("TEAM:::::"+newId); handleClose() }} to={"/team/" + newId  + firstCategory} ><Button style={{float:'right'}} variant="success"  >{icons.add}</Button></Link>
						  <ListGroup  style={{zIndex:'20',clear:'both', width: '100%'}}>
							{sortedTeamOptions.map(function(option,tk) {
								let o = teamOptions && teamOptions[option]
							  return <ListGroup.Item  key={tk} className={(tk%2 === 0) ? 'even': 'odd'} onClick={function(e) {	selectRole("TEAM:::::"+option);	  setFilter(''); handleClose() }} >
								{o && o.name}
								</ListGroup.Item>
							})}
						  </ListGroup>
					</Tab>}
					
				</Tabs>
				</div>}
			</Modal.Body>
			
		  </Modal>
		</>
	)
}



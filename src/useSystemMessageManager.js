import {useState, useEffect, useRef} from 'react'
import useUtils from './useUtils'
//import {useNavigate} from 'react-router-dom'
import useNameGenerator from './useNameGenerator'

import defaults from './defaultRolesTeamsWorkflows'

export default function useSystemMessageManager({forceRefresh, doSave, chatHistoryId, categories, setCategories}) {
	
	const defaultRoles = defaults.roles
	const nameGenerator = useNameGenerator()
	
	//const navigate =useNavigate()
	const utils = useUtils()
	
	function newRole() {
		localStorage.setItem("voice2llm_last_role", '')
		setCurrentRole('')
	}
	
	function duplicateRole(roleId) {
		if (roles && roles[roleId]) {
			const newId = utils.generateRandomId()
			roles[newId] = JSON.parse(JSON.stringify(roles[roleId]))	
			roles[newId].name = (roles[newId].name ? roles[newId].name : '') + ' ' + nameGenerator.generate()
			setRoles(roles)
			forceRefresh()
		}
	}
	
	const [chatHistoryRoles, setChatHistoryRolesInner] = useState({})
	function setChatHistoryRoles(roles) {
		localStorage.setItem('voice2llm_chat_history_roles',JSON.stringify(roles))
		setChatHistoryRolesInner(roles)
		doSave()
	}
	
	const [chatHistoryTeams, setChatHistoryTeamsInner] = useState({})
	function setChatHistoryTeams(teams) {
		localStorage.setItem('voice2llm_chat_history_teams',JSON.stringify(teams))
		setChatHistoryTeamsInner(teams)
		doSave()
	}
	
	
	const [roles, setRolesInner] = useState(defaultRoles) // [{name:'',message:'',config:{}}]
	const rolesRef = useRef()
	function setRoles(roles) {
		rolesRef.current = roles
		let cleanRoles = {}
		Object.keys(roles).filter(function(roleId) {
			//console.log(roleId)
			let role = roles[roleId]
			// allow one property for samples
			if (Object.keys(role).length === 0) {
				return false
			} else if (role.hasOwnProperty('samples') && Object.keys(role).length === 1) {
				return false
			} else if (role.hasOwnProperty('samples') && role.hasOwnProperty('category') &&  Object.keys(role).length === 2) {
				return false
			} 
			return true
		}).forEach(function(roleId) {
			cleanRoles[roleId] = roles[roleId]
		});
		let rr = JSON.stringify(cleanRoles)
		//console.log('setroles', cleanRoles, roles)
		localStorage.setItem('voice2llm_roles',rr)
		setRolesInner(rolesRef.current)
		doSave()
	}
	
	const [currentRole, setCurrentRoleInner] = useState(null)
	const currentRoleRef = useRef('')
	async function setCurrentRole(role, chatHistoryId=null) {
		localStorage.setItem('voice2llm_current_role',role)
		setCurrentRoleInner(role)
		currentRoleRef.current = role
		if (chatHistoryRoles && chatHistoryId) chatHistoryRoles[chatHistoryId] = role
		setChatHistoryRoles(chatHistoryRoles)
		doSave()
	}
	
	function deleteRole(deleteRole) {
		if (roles[deleteRole]) { 
			if (window.confirm('Really delete the role '+roles[deleteRole].name+' ?')) {
				delete roles[deleteRole]
				setRoles(roles)
				forceRefresh()
			} 
		}
	}
	
	const [teams, setTeamsInner] = useState({})
	function setTeams(c) {
		//let cleanTeams = {}
		//Object.keys(teams).filter(function(teamId) {
			////console.log(roleId)
			//let team = teams[teamId]
			//// allow one property for samples
			//if (Object.keys(team).length === 0) {
				//return false
			//} else if (team.hasOwnProperty('samples') && Object.keys(team).length === 1) {
				//return false
			//} else if (team.hasOwnProperty('samples') && Object.keys(team).length === 1) {
				//return false
			//} else if (team.hasOwnProperty('samples') && team.hasOwnProperty('category') &&  Object.keys(team).length === 2) {
				//return false
			//} 
			//return true
		//}).forEach(function(teamId) {
			//cleanTeams[teamId] = teams[teamId]
		//});
		let rr = JSON.stringify(c)
		setTeamsInner(c)
		localStorage.setItem("voice2llm_teams",rr)
		doSave()
	}
	const [currentTeam, setCurrentTeamInner] = useState({})
	function setCurrentTeam(c) {
		//console.log("set current team",c)
		setCurrentTeamInner(c)
		localStorage.setItem("voice2llm_current_team",c)
		if (chatHistoryTeams && chatHistoryId) chatHistoryTeams[chatHistoryId] = c
		setChatHistoryTeams(chatHistoryTeams)
		doSave()
	}
	
	
	function deleteTeam(deleteTeam) {
		//console.log("DDD",deleteTeam,teams)
		if (teams[deleteTeam]) { 
			if (window.confirm('Really delete the team '+teams[deleteTeam].name+' ?')) {
				delete teams[deleteTeam]
				setTeams(teams)
				forceRefresh()
			} 
		}
	}
	
	function fixNull(a) {
		return (a === 'null') ? null : a
	}
	
	function init() {
		// load roles
		//console.log("INIT  SYSMAN ")
		//setSystemMessageInner(localStorage.getItem('voice2llm_system_message'))
		setCurrentRoleInner(fixNull(localStorage.getItem('voice2llm_current_role')))
		//setCategory(localStorage.getItem('voice2llm_current_category'))
		//try {
			//setSystemConfigInner(JSON.parse(localStorage.getItem('voice2llm_system_config')))
		//} catch (e) {}
		setCurrentTeamInner(fixNull(localStorage.getItem('voice2llm_current_team')))
		
		try {
			const loadedRoles = JSON.parse(localStorage.getItem('voice2llm_roles'))
			if (loadedRoles) {
				setRolesInner(loadedRoles)
			} else {
				setRoles(defaults.roles) 
			}
			//console.log("INIT DONE SYSMAN",loadedRoles, roles)
		} catch (e) {
			//console.log("INIT DONE SYSMAN default")
			setRoles(defaults.roles) 
		}
		try {
			setChatHistoryRoles(JSON.parse(localStorage.getItem('voice2llm_chat_history_roles')))
			
		} catch (e) {
			//console.log("INIT DONE SYSMAN default")
			setChatHistoryRoles({}) 
		}
		try {
			let c = JSON.parse(localStorage.getItem("voice2llm_teams"))
			if (c) {
				setTeams(c)
			} else {
				//console.log("SET DEF TEAMS",defaults.teams)
				setTeams(defaults.teams)
			}
			forceRefresh()
		} catch (e) {
			//console.log("SET DEF TEAMS",defaults.teams)
			setTeams(defaults.teams)
			forceRefresh()
		}
		
		if (!roles) setRoles(defaultRoles) 
		if (!chatHistoryRoles) setChatHistoryRoles({}) 
		if (!chatHistoryRoles) setChatHistoryTeams({}) 
		let catList = {}
		let i = 1
		Object.values(roles).forEach(function(r) {
			if (r && Array.isArray(r.category)) {
				r.category.forEach(function(c) {
					if (!catList[c]) {
						catList[c] = i
						i = i + 1
					}
				})
			}
		})
		Object.values(teams).forEach(function(r) {
			if (r && Array.isArray(r.category)) {
				r.category.forEach(function(c) {
					if (!catList[c]) {
						catList[c] = i
						i = i + 1
					}
				})
			}
		})
		//console.log("OINIT",roles,teams,catList)
		setCategories(catList)
		
	}
	
	useEffect(function() {
		init()
	},[])

	function exportRoles() {
		try {
			const roles = JSON.parse(localStorage.getItem('voice2llm_roles'))
			const teams = JSON.parse(localStorage.getItem('voice2llm_teams'))
			const blob = new Blob([JSON.stringify({roles,teams}, null, '\t')], { type: "application/json" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = 'roles.json';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (e) {}
	}
	
	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
		  const text = e.target.result;
		  return text
		};
		reader.readAsText(file);
	};
	
	function importRoles(e) {
		//console.log("IMPORT e",e,e.target.files)
		let roles = {}
		try {
			roles = JSON.parse(localStorage.getItem('voice2llm_roles'))
		} catch (e) {roles = {}}
		let teams = {}
		try {
			teams = JSON.parse(localStorage.getItem('voice2llm_teams'))
		} catch (e) {teams = {}}
		
		//console.log(roles)
		if (!roles) roles = {}
		if (!teams) teams = {}
		
		//let willOverwrite = 0
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target.result;
			try {
				//console.log("IMPORT loaded",text)
				let parsed = JSON.parse(text)
				if (parsed) {
					console.log('TTT',parsed)
					if (parsed.roles) {
						Object.keys(parsed.roles).forEach(function(key) {
							roles[key] = parsed.roles[key]
						})
						setRoles(roles)
					}
					if (parsed.teams) {
						Object.keys(parsed.teams).forEach(function(key) {
							teams[key] = parsed.teams[key]
						})
						setTeams(teams)
					}
					forceRefresh()
					doSave()
					console.log('TTT',teams)
				}
				
			} catch (e) {console.log(e)}
		}
		reader.readAsText(file);
	}
	
	
	
	return {exportRoles,importRoles, init, roles,rolesRef, setRoles, currentRole, setCurrentRole, defaultRoles, newRole, deleteRole, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams, currentRoleRef,setCurrentTeam,  currentTeam, deleteTeam, duplicateRole, teams, setTeams}
}

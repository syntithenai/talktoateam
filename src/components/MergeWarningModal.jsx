import {React, useState, useEffect} from 'react'
import {Button, Modal, Form, Row, Col} from 'react-bootstrap'

import useIcons from '../useIcons'

export default function MergeWarningModal({chatHistoryId, chatHistories, setChatHistories, logs, setLogs, doSave, forceRefresh, mergeData, setMergeData, systemConfig, setSystemConfig, roles, setRoles, category, setCategory, systemMessage, setSystemMessage,chatHistory, setChatHistory, currentRole, setCurrentRole , config, setConfig, setChatHistoryRoles}) {
	const icons = useIcons()
	
	function merge() {
		//console.log("MERGE",mergeData,currentRole,roles, chatHistories, logs)
		if (mergeData) {
			if (mergeData.config) setConfig(mergeData.config)
			//console.log('setconfig',mergeData.config)
			if (mergeData.currentRole) setCurrentRole( mergeData.currentRole)
			if (mergeData.chatHistoryRoles) setChatHistoryRoles(mergeData.chatHistoryRoles)
			
			if (typeof mergeData.roles === 'object') {
				let useRoles = roles
				if (!useRoles) useRoles = {}
				//console.log('UR', roles, useRoles)
				Object.keys(mergeData.roles).forEach(function(roleKey) {
					if (roleKey && mergeData.roles[roleKey]) useRoles[roleKey] = mergeData.roles[roleKey]
				})
				//console.log("MERGE ROLES",useRoles)
				setRoles(useRoles)
			}
			
			if (mergeData.chatHistories) {
				if (!chatHistories) chatHistories = {}
				Object.keys(mergeData.chatHistories).forEach(function(historyKey) {
					chatHistories[historyKey] = mergeData.chatHistories[historyKey]
				})
				//console.log("MERGE HISTS",chatHistories)
				setChatHistories(chatHistories)
			}
			
			setLogs(typeof logs === "object" ? logs : {})
			let finalLogs = logs
			if (typeof mergeData.logs === "object") {
				if (Array.isArray(mergeData.logs.openai_log)) {
					if (!Array.isArray(finalLogs.openai_log)) finalLogs.openai_log = []
					let logIndex = {}
					finalLogs.openai_log.forEach(function(log) {
						if (log && log.id) logIndex[log.id] = 1
					})
					mergeData.logs.openai_log.forEach(function(log) {
						if (log && log.id && !logIndex.hasOwnProperty(log.id)) {
							finalLogs.openai_log.push(log)
						}
					})
					
				}
				if (Array.isArray(mergeData.logs.openai_log_stt)) {
					if (!Array.isArray(finalLogs.openai_log_stt)) finalLogs.openai_log_stt = []
					let logIndex = {}
					finalLogs.openai_log_stt.forEach(function(log) {
						if (log && log.id) logIndex[log.id] = 1
					})
					mergeData.logs.openai_log_stt.forEach(function(log) {
						if (log && log.id && !logIndex.hasOwnProperty(log.id)) {
							finalLogs.openai_log_stt.push(log)
						}
					})
					
				}
				if (Array.isArray(mergeData.logs.openai_log_tts)) {
					if (!Array.isArray(finalLogs.openai_log_tts)) finalLogs.openai_log_tts = []
					let logIndex = {}
					finalLogs.openai_log_tts.forEach(function(log) {
						if (log && log.id) logIndex[log.id] = 1
					})
					mergeData.logs.openai_log_tts.forEach(function(log) {
						if (log && log.id && !logIndex.hasOwnProperty(log.id)) {
							finalLogs.openai_log_tts.push(log)
						}
					})
					
				}
				setLogs(finalLogs)
			}
			setMergeData(null)
		}
	}


	useEffect(function() {
		if (mergeData) merge()
	},[mergeData])

	// function discard() {
	// 	//console.log("DISCARD",mergeData,currentRole,category,systemMessage,systemConfig,roles,chatHistory,config)
	// 	doSave()
	// 	setMergeData(null)
	// }
	
	// function overwrite() {
	// 	//console.log("OVERWRITE",mergeData,currentRole,category,systemMessage,systemConfig,roles,chatHistory,config)
	// 	if (mergeData) {
	// 		if (mergeData.currentRole) setCurrentRole( mergeData.currentRole)
	// 		if (mergeData.category) setCategory( mergeData.category)
	// 		if (mergeData.category) setCategory( mergeData.category)
	// 		if (mergeData.systemMessage) setSystemMessage(mergeData.systemMessage)
	// 		if (mergeData.systemConfig) setSystemConfig(mergeData.systemConfig)
	// 		if (mergeData.config) setConfig(mergeData.config)
			
	// 		if (Array.isArray(mergeData.roles)) {
	// 			setRoles(mergeData.roles)
	// 		}
	// 		if (Array.isArray(mergeData.logs)) {
	// 			setLogs(mergeData.logs)
	// 		}
	// 		if (typeof mergeData.chatHistory === 'object') {
	// 			setChatHistory(mergeData.chatHistory)
	// 		}
	// 	}
	// }	
	return null

	// return (
	// 	<>
		  
	// 	  <Modal
	// 		show={true}
	// 	  >
	// 		<Modal.Header closeButton>
	// 		  <Modal.Title style={{marginRight:'2em'}}>Merge Warning</Modal.Title>
			 
	// 		</Modal.Header>
	// 		<Modal.Body>
	// 		<div style={{width:'100%',clear:'both', marginBottom:'2em'}} >
	// 		Do you want to merge changes made on another device?
	// 		</div>
			
	// 		<Row>
	// 			<Col className='mb-3' >
	// 				<Button variant="success" style={{float:'left', marginLeft:'2em', marginBottom:'0.3em'}} onClick={function() {merge()}} >Yes</Button>
	// 			</Col>
	// 			<Col className='mb-3' >
	// 				<Button variant="danger" style={{float:'left', marginLeft:'2em', marginBottom:'0.3em'}} onClick={function() {discard()}} >No</Button>
	// 			</Col>
				
	// 		</Row>
	// 		</Modal.Body>
			
	// 	  </Modal>
	// 	</>
	// )
}
//<Col className='mb-3' >
					//<Button variant="danger" style={{float:'left', marginLeft:'2em', marginBottom:'0.3em'}} onClick={function() {overwrite()}} >Overwrite</Button>
				//</Col>

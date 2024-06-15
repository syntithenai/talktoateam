import {React, useState, useRef} from 'react'
import {Button, Modal, ListGroup, Form, Tabs} from 'react-bootstrap'

import useIcons from '../useIcons'

import {Link  } from 'react-router-dom'

import ConfirmDialog from './ConfirmDialog'

export default function ChatHistories({currentChatHistory, utils, stopLanguageModels, chatHistories,chatHistoriesRef, setChatHistories, setSystemConfig, setSystemMessage, setCategory, setCurrentRole, newChat, setChatHistoryId, chatHistoryId, deleteChatHistory, duplicateChatHistory}) {
	const icons = useIcons()
	const hiddenInput = useRef()
	const [refresh,setRefresh] = useState()
	const [filter, setFilter] = useState('')
	const [showConfirm, setShowConfirm] = useState(false)
	const toDelete = useRef()
	
	function loadChatHistory(k) {
		setChatHistoryId(k)
	}
	const newChatId = currentChatHistory() && currentChatHistory().length > 0 ?  utils.generateRandomId() : null
	//console.log("CHHH",chatHistoryId, chatHistoriesRef.current, chatHistories)
				
				
	//let chatHistory = chatHistories[chatHistoryId]
	
	return (<div style={{paddingLeft:'0.5em'}}>
	
	<ConfirmDialog forceShow={showConfirm}  setForceShow={setShowConfirm} title="Delete Chat History" message="Do you really want to delete this chat history ?" onCancel={function() {setShowConfirm(false)}} onConfirm={function() {deleteChatHistory(toDelete.current); setShowConfirm(false)}}  />
	
	<Button style={{float:'right',marginTop:'0.4em',marginRight:'0.2em'}} variant="danger" onClick={function() {if (window.confirm("Really delete all chat history?")) {setChatHistories({}) }}} >{icons.bin}</Button> 
	<Link  to={"/chat/"+newChatId} style={{float:'right',marginTop:'0.2em',marginRight:'2em'}}><Button onClick={stopLanguageModels} disabled={!newChatId} style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}}  variant="primary"  >{icons["newchat"]}</Button></Link>
	<h3>Chat History</h3>
	<br/>
	<Form.Control style={{marginBottom:'1em'}}
				type="text"
				value={filter}
				placeholder={"Search"}
				onChange={(e) => {setFilter(e.target.value)}}
				/>
	<ListGroup>
				  {chatHistoriesRef.current && Object.keys(chatHistoriesRef.current).filter(function(chatHistoryKey) {
						let chatHistory = chatHistoriesRef.current[chatHistoryKey]
						if (!filter) {
							return true && chatHistory && chatHistory.length > 0
						} else if (filter && chatHistory && chatHistory[0] && chatHistory[0].content && chatHistory[0].content.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
							return true && chatHistory && chatHistory.length > 0
						} else {
							return false
						}
					  }).map(function(chatHistoryKey, hKey) {
						  let chatHistory = chatHistoriesRef.current[chatHistoryKey]
						 return <ListGroup.Item key={hKey} >
						 <Link to={"/chat/"+chatHistoryKey} ><Button variant="outline-primary" style={{textAlign:'left',width:'70%'}}  >{chatHistory && chatHistory[0] && chatHistory[0].content && chatHistory[0].content.split ? chatHistory[0].content.split(' ').slice(0,20).join(' ') : ''}</Button></Link>
						 <Button style={{float:'right'}} variant="danger" onClick={function() {toDelete.current = chatHistoryKey; setShowConfirm(true)}} >{icons.bin}</Button> 
						 <Button style={{float:'right', marginRight:'0.5em'}} variant="warning" onClick={function() {duplicateChatHistory(chatHistoryKey)}} >{icons.filecopy}</Button></ListGroup.Item> 
					  })}
			</ListGroup>
	</div>)
}

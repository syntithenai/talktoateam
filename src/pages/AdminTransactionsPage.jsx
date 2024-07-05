import {React} from 'react'
import {Button, Tabs, Tab, Form} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {useEffect, useState} from 'react'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
import SortableTable from '../components/SortableTable'
import AdminAddTransactionModal from '../components/AdminAddTransactionModal'
import useEmbeddingsWorker from '../useEmbeddingsWorker'

export default function AdminTransactionsPage({ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
    const [transactions,setTransactions] = useState([])
    const [filter,setFilter] = useState([])
    const [balance,setBalance] = useState(null)


    function loadUserTransactions() {
        fetch(import.meta.env.VITE_API_URL + '/admin_users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer '+(token ? token.access_token : '')
            },
            body: JSON.stringify({filter:filter}),
        }).then(function(paymentResponse) {
            if (paymentResponse.ok) {
                paymentResponse.json().then(function(data) {
                    // console.log(data)
                    if (Array.isArray(data) && data.length > 0) {
                        let b = 0
                        setTransactions(data.map(function(transaction) {
                            b += parseFloat(transaction.amount)
                            return {
                                date: convertUnixTimestampToAUFormat(transaction.date),
                                type: transaction.type,
                                model: transaction.model,
                                amount: "$" + parseFloat(transaction.amount).toFixed(4)
                            }
                        }))
                        setBalance(b)
                    } else {
                        setBalance(null)
                    }
                })
            }
        })
    }   
    function convertUnixTimestampToAUFormat(unixTimestamp) {
        // Create a new Date object with the Unix timestamp (in milliseconds)
        const date = new Date(unixTimestamp * 1000);
    
        // Extract the day, month, and year
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
    
        // Format the date in dd/mm/yyyy format
        return `${day}/${month}/${year}`;
    }
    const headers = [
        { key: "date", label: "Date" },
        { key: "amount", label: "Amount $USD" },
        { key: "type", label: "Type" },
        { key: "model", label: "Model" },
      ];
      let paraStyle={marginTop:'0.5em'}
      
      return (<div className="App" style={{textAlign:'left'}}  >
              <Menu {...{ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}} />
              {!(user && user.email && user.email === 'syntithenai@gmail.com') && <div id="body" style={bodyStyle}  ><b>No Access</b></div>}
              {(user && user.email && user.email === 'syntithenai@gmail.com') && <div id="body" style={bodyStyle}  >
                            {<span style={{float:'right'}}><AdminAddTransactionModal disabled={!(filter.indexOf("@") !== -1 && filter.indexOf(".") !== -1)} token={token} user={filter} icons={icons} loadUserTransactions={loadUserTransactions} /></span>}
                            <h3>Admin Transactions</h3>
                              <br/>
                              <Form style={{marginBottom:'2em' }}>
                                <Form.Control style={{width:'18em',float:'left' }} type='text' value={filter} onChange={function(e) {setFilter(e.target.value)}} />  
                                <Button style={{float:'left', marginLeft:'0.5em' }} onClick={loadUserTransactions} >Search</Button>
                                {(balance!=null) && <span>
                                    <b style={{marginLeft:'2em'}} >Balance</b> ${balance.toFixed(4)}
                                </span>}
                              </Form>
                              
                              <br/>
                              <SortableTable data={Array.isArray(transactions) ? JSON.parse(JSON.stringify(transactions)).reverse() : []} headers={headers} />
                              
              </div>}
              
              <Footer icons={icons} />
      </div>)
    
}
import {React} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {useEffect, useState} from 'react'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
import SortableTable from '../components/SortableTable'
export default function TransactionsPage({ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
    const [transactions,setTransactions] = useState([])
    useEffect(function() {
        fetch(import.meta.env.VITE_API_URL + '/transactions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer '+(token ? token.access_token : '')
            }
        }).then(function(paymentResponse) {
            if (paymentResponse.ok) {
                paymentResponse.json().then(function(data) {
                    // console.log(data)
                    if (Array.isArray(data)) {
                        setTransactions(data.map(function(transaction) {
                            return {
                                date: convertUnixTimestampToAUFormat(transaction.date),
                                type: transaction.type,
                                amount: "$" + parseFloat(transaction.amount).toFixed(4)
                            }
                        }))
                    }
                })
            }
        })
    },[])
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
        { key: "type", label: "Type" }
      ];
      let paraStyle={marginTop:'0.5em'}
      
      return (<div className="App" style={{textAlign:'left'}}  >
              <Menu {...{ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}} />
              
              <div id="body" style={bodyStyle}  >
                            <Link style={{float:'right', marginRight:'1em', marginTop:'1em'}} to="/payment" ><Button variant="success" size="lg" >Buy Credit</Button></Link>
                            <h3>Transaction History</h3>
                              
                              <br/>
                              <SortableTable data={Array.isArray(transactions) ? JSON.parse(JSON.stringify(transactions)).reverse() : []} headers={headers} />
                              
              </div>
              
              <Footer icons={icons} />
      </div>)
    
}
import {React} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {useEffect, useState} from 'react'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
import SortableTable from '../components/SortableTable'
import { enAU } from "date-fns/locale";
import { registerLocale, setDefaultLocale } from  "react-datepicker";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TransactionsPage({ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
    registerLocale('enAU', enAU)
    setDefaultLocale('enAU')
    const [transactions,setTransactions] = useState([])
    // search filter
	const twoWeeksAgo = new Date()
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
	const tomorrow = new Date()
	tomorrow.setDate(tomorrow.getDate() + 1)
	const [startDate, setStartDate] = useState(twoWeeksAgo);
	const [endDate, setEndDate] = useState(tomorrow);
	
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
                    //  console.log(data)
                    if (Array.isArray(data)) {
                        setTransactions(data.map(function(transaction) {
                            return {
                                date: convertUnixTimestampToAUFormat(transaction.date),
                                type: transaction.type,
                                model: transaction.model,
                                amount: "$" + parseFloat(transaction.amount).toFixed(6)
                            }
                        }))
                    }
                })
            }
        })
    },[])
    
    function renderDateAsAU(date) {
        // Extract the day, month, and year
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
    
        // Format the date in dd/mm/yyyy format
        return `${day}/${month}/${year}`;
    }

    function convertUnixTimestampToAUFormat(unixTimestamp) {
        // Create a new Date object with the Unix timestamp (in milliseconds)
        const date = new Date(unixTimestamp * 1000);
        return renderDateAsAU(date)
    }
    const headers = [
        { key: "date", label: "Date" },
        { key: "amount", label: "Amount $USD" },
        { key: "type", label: "Type" },
        { key: "model", label: "Model" },
    ];
    let paraStyle={marginTop:'0.5em'}
    
    // return true if a > b
    function compareDates(a,b) {
        let aParts = a.split("/")
        let bParts = b.split("/")
        // console.log(aParts,bParts)
        if (parseInt(aParts[2]) > parseInt(bParts[2])) {
            // console.log("win year")
            return true
        } else if (parseInt(aParts[2]) === parseInt(bParts[2])) {
            if (parseInt(aParts[1]) > parseInt(bParts[1])) {
                // console.log("win month")
                return true
            } else if (parseInt(aParts[1]) === parseInt(bParts[1])) {
                if (parseInt(aParts[0]) > parseInt(bParts[0])) {
                    // console.log("win day")
                    return true
                } else if (parseInt(aParts[0]) === parseInt(bParts[0])) {
                    return true // equal
                }
            }
        }
        // console.log("lose")
        return false
    }

    function dateFilter(a) {
        let startOk = true
        let endOk = true
        if (a && a.date) {
            if (startDate) {
                startOk = false
                // console.log(compareDates(renderDateAsAU(startDate), a.date), renderDateAsAU(startDate),a.date)
        
                if (compareDates(a.date, renderDateAsAU(startDate) )) {
                    startOk = true
                }
            }
            if (endDate) {
                endOk = false
                if (compareDates(renderDateAsAU(endDate), a.date)) {
                    endOk = true
                }
            }
        }
        return startOk && endOk
    }

    
    return (<div className="App" style={{textAlign:'left'}}  >
              <Menu {...{ isOnlineRef,allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}} />
              
              <div id="body" style={bodyStyle}  >
                            <Link style={{float:'right', marginRight:'1em', marginTop:'1em'}} to="/payment" ><Button variant="success" size="lg" >Buy Credit</Button></Link>
                            <h3>Transaction History</h3>
                            <br/>
                            <div style={{borderBottom:'2px solid black', marginBottom:'1em', paddingBottom:'1em'}}>
                                <h4>Search</h4>
                                <b>From:</b> <DatePicker locale="enAU" selected={startDate} onChange={(date) => {setStartDate(date);}} />
                                &nbsp;&nbsp;&nbsp;<b>To:</b> <DatePicker locale="enAU" selected={endDate} onChange={(date) => {setEndDate(date);}} />
                                
                            </div>
                              <br/>
                              <SortableTable data={Array.isArray(transactions) ? JSON.parse(JSON.stringify(transactions)).filter(dateFilter).reverse() : []} headers={headers} />
                              
              </div>
              
              <Footer icons={icons} />
      </div>)
    
}
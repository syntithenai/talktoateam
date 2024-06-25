import {React} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import PaypalPaymentForm from '../components/PaypalPaymentForm'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
export default function PaypalPaymentPage({creditBalance, refreshHash, icons,token, logout, user,login }) {
	
	return <>
	 
              <Menu {...{bodyStyle, creditBalance, refreshHash, token, logout, user,login, utils, usingStt, usingTts, isSpeaking, isMuted, mute, stopAllPlaying, icons, unmute, stopPlaying, lastLlmTrigger, config, aiUsage, forceRefresh, autoStartMicrophone, setAutoStartMicrophone, isPlaying, allowRestart, isWaiting, startWaiting, stopWaiting, onCancel, isReady, setIsReady, onTranscript, onPartialTranscript, setUserMessage}} />
              <PaypalPaymentForm />
			  </>
}

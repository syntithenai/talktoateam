import {React, useEffect, useState} from 'react'  
//import useHotwordManager from './hotword/useHotwordManager'
// import {useLocalTranscriber} from '../useLocalTranscriber.ts'
import useWebsocketTranscriber from '../useWebsocketTranscriber.ts'
import useOpenAITranscriber from '../useOpenAITranscriber.ts'
import useGroqTranscriber from '../useGroqTranscriber.ts'
import useSelfHostedTranscriber from '../useSelfHostedTranscriber'
import useAudioRecorder from '../useAudioRecorder.tsx'
import {Button, Modal} from 'react-bootstrap'
import useIcons from '../useIcons'  
import useIsOnline from '../useIsOnline'  
  
export default function SpeechButton(props) {
	//console.log("SBC",props.config, typeof props.config)
	let useOpenAi = (props.config && props.config.stt && props.config.stt.use === "openai" && props.config.stt.openai_key)? true : false
	let useGroq = (props.config && props.config.stt && props.config.stt.use === "groq" && props.config.stt.groq_key)? true : false
	let useSelfHosted = (props.config && props.config.stt && props.config.stt.use === "self_hosted" && props.config.stt.self_hosted_url)? true : false
	let useLocal = (props.config && props.config.stt && props.config.stt.use === "local" && props.config.stt.local_whisper_model) ? true : false
	let useHotword = (props.config && props.config.stt && props.config.stt.use_hotword)? true : false
		
	useEffect(function() {
		//console.log("AUTOSTART change",props.autoStartMicrophone)
		if (props.autoStartMicrophone)  {
			audioRecorder.startRecording()
			props.setAutoStartMicrophone(false)
		}
		//console.log("SPEK CHNG",props.isSpeaking)
	},[props.autoStartMicrophone])
	useEffect(function() {
		//console.log("AUTOSTOP change",props.autoStopMicrophone)
		if (props.autoStopMicrophone)  {
			audioRecorder.stopRecording()
			props.setAutoStopMicrophone(false)
		}
		//console.log("SPEK CHNG",props.isSpeaking)
	},[props.autoStopMicrophone])
	
	const icons = useIcons()
	let onlineCheck = useIsOnline()
	//let hotwordManager = useHotwordManager({
		//porcupineWorkerScript:'./hotword/porcupine_worker.js',
		//downsamplerScript:'./hotword/downsampling_worker.js',
		//detectionCallback:function(e) {
			//if (e && (useLocal || useSelfHosted || useOpenAi) ) {
				//if (e + '' === "Hey Edison") {
					//console.log("HW edison") 
					//if (props.stopLanguageModels) props.stopLanguageModels()
					//audioRecorder.startRecording(true)
				//}
				////console.log("HW"+e+"||")
			//}
		//}, 
		//errorCallback:function(e) {console.log("HW err",e)}, 
	//})
	let hotwordManager = {start: function() {}, processFrame: function() {}, stop: function() {}, isStarted: function() {}}
	
	
	let audioRecorder = useAudioRecorder({
		forceRefresh: props.forceRefresh,
		config: props.config,
		isPlaying: props.isPlaying,
		onRecordingComplete: function (duration, blob, data, config) {
			console.log("REC COMPLETE",duration, blob, data, config, typeof config	)
			let useOpenAi = (config && config.stt && config.stt.use === "openai" && config.stt.openai_key)? true : false
			let useSelfHosted = (config && config.stt && config.stt.use === "self_hosted" && config.stt.self_hosted_url)? true : false
			let useGroq = (props.config && props.config.stt && props.config.stt.use === "groq" && props.config.stt.groq_key)? true : false
			// let useLocal = (config && config.stt && config.stt.use === "local" && config.stt.local_whisper_model) ? true : false
			// //console.log("REC COMPLETE",useLocal,useSelfHosted,useOpenAi, useGroq, config.stt.use, config.stt.openai_key)
			// if (useLocal) {
			// 	//console.log("TSstart")
			// 	function blobToAudioBuffer(blob) {
			// 		return new Promise(function(resolve,reject) {
			// 			//console.log("TSstart b", blob)
			// 			const audioContext = new AudioContext();
			// 			blob.arrayBuffer().then(function(arrayBuffer) {
			// 				//console.log("TSstart ab", arrayBuffer)
			// 				audioContext.decodeAudioData(arrayBuffer).then(function(audioBuffer) {
			// 					//console.log("TSstart aab", audioBuffer)
			// 					resolve(audioBuffer)
			// 				})
			// 			})
			// 		})
			// 	}
			// 	blobToAudioBuffer(blob).then(function(b) {
			// 		//console.log("TSstart got",b)
			// 		localTranscriber.start(b)
			// 	})
			// } else 
			if (useSelfHosted) {
				//console.log("WS start")
				selfHostedTranscriber.start(blob)
			} else if (useOpenAi) {
				//console.log("AI start")
				openAITranscriber.start(blob, duration)
			} else if (useGroq) {
				//console.log("AI start")
				groqTranscriber.start(blob, duration)
			}
			//if (onlineCheck.isOnline) {
				//console.log("USE ONLINE ASR")
				//transcriber.start(data)
			//} else  {
				//transcriber.start(data)
			//}
			//hotwordManager.start()
		},
		onRecordingStarted: function() {
			console.log("REC Start")
			hotwordManager.stop()
		},
		onRecordingStopped: function() {
			console.log("REC Stop")
			if (useHotword) hotwordManager.start()
		},
		onReady: function() {
			console.log("REC Ready")
			props.forceRefresh()
		},
		onDataAvailable: function(d) {
			console.log("DATAAVAIL",d)
			if (useLocal) {
				//console.log("TSFEED")
				//localTranscriber.feed(d)
			} else if (useSelfHosted) {
				//console.log("WSFEED")
				//websocketTranscriber.feed(d)
			} else if (useOpenAi) {
				//console.log("WSFEED")
				//openAITranscriber.feed(d)
			} else if (useGroq) {
				//console.log("WSFEED")
				//groqTranscriber.feed(d)
			}
		}
	})
	
	// let localTranscriber = useLocalTranscriber({
	// 	whisperModel: props.config && props.config.stt && props.config.stt.local_whisper_model ? props.config.stt.local_whisper_model : '',
	// 	onStart: function() {
	// 		props.startWaiting()
	// 	},
	// 	onReady: function(v) {
	// 		//console.log("wsTRANSCRIBER READY")
	// 		audioRecorder.init()
	// 	},
	// 	onUpdate: function(v) {
	// 		//console.log('U',v)
	// 		if (props.onPartialTranscript) props.onPartialTranscript(v)
	// 	},
	// 	onComplete: function(v) {
	// 		//console.log('C',v,props.config)
	// 		if (props.onTranscript) props.onTranscript(v)
	// 		props.stopWaiting()
	// 		//if (props.allowRestart) audioRecorder.startRecording()
	// 	},
	// 	onError: function(e) {
	// 		props.stopWaiting()
	// 	}
	// })
	// 
	let websocketTranscriber = useWebsocketTranscriber({
		onReady: function(v) {
			//console.log("wsTRANSCRIBER READY")
			// audioRecorder.init()
		},
		onUpdate: function(v) {
			//console.log('U',v)
			if (props.onPartialTranscript) props.onPartialTranscript(v)
		},
		onComplete: function(v) {
			//console.log('C',v)
			if (v.trim() === "stop" || v.trim() === "cancel") {
				audioRecorder.stopRecording()
				if (props.onCancel) props.onCancel()
			} else {
				if (props.onTranscript) props.onTranscript(v)
				props.stopWaiting()
			}
			//if (props.allowRestart) audioRecorder.startRecording()
		},
		onStart: function() {
			props.startWaiting()
		},
		onError: function(e) {
			props.stopWaiting()
		}
	})
	
	
	//let transcriber = localTranscriber;
	let openAITranscriber = useOpenAITranscriber({
		aiUsage: props.aiUsage,
		onReady: function(v) {
			//console.log("aiTRANSCRIBER READY")
			// audioRecorder.init()
		},
		onUpdate: function(v) {
			//console.log('aiU',v)
			if (props.onPartialTranscript) props.onPartialTranscript(v)
		},
		onComplete: function(v) {
			//console.log('aiC',v)
			if (v.trim() === "stop" || v.trim() === "cancel") {
				audioRecorder.stopRecording()
				if (props.onCancel) props.onCancel()
			} else {
				if (props.onTranscript) props.onTranscript(v)
				props.stopWaiting()
			}
			//if (props.allowRestart) audioRecorder.startRecording()
		},
		onStart: function() {
			props.startWaiting()
		},
		onError: function(e) {
			props.stopWaiting()
		}
	})
	
	
	//let transcriber = localTranscriber;
	let groqTranscriber = useGroqTranscriber({
		aiUsage: props.aiUsage,
		onReady: function(v) {
			//console.log("aiTRANSCRIBER READY")
				//audioRecorder.init()
		},
		onUpdate: function(v) {
			//console.log('aiU',v)
			if (props.onPartialTranscript) props.onPartialTranscript(v)
		},
		onComplete: function(v) {
			//console.log('aiC',v)
			if (v.trim() === "stop" || v.trim() === "cancel") {
				audioRecorder.stopRecording()
				if (props.onCancel) props.onCancel()
			} else {
				if (props.onTranscript) props.onTranscript(v)
				props.stopWaiting()
			}
			//if (props.allowRestart) audioRecorder.startRecording()
		},
		onStart: function() {
			props.startWaiting()
		},
		onError: function(e) {
			props.stopWaiting()
		}
	})
	
	//let transcriber = localTranscriber;
	let selfHostedTranscriber = useSelfHostedTranscriber({
		url: props.config && props.config.stt && props.config.stt.self_hosted_url,
		aiUsage: props.aiUsage,
		onReady: function(v) {
			//console.log("aiTRANSCRIBER READY")
			// audioRecorder.init()
		},
		onUpdate: function(v) {
			//console.log('aiU',v)
			if (props.onPartialTranscript) props.onPartialTranscript(v)
		},
		onComplete: function(v) {
			//console.log('aiC',v)
			if (v.trim() === "stop" || v.trim() === "cancel") {
				audioRecorder.stopRecording()
				if (props.onCancel) props.onCancel()
			} else {
				if (props.onTranscript) props.onTranscript(v)
				props.stopWaiting()
			}
			//if (props.allowRestart) audioRecorder.startRecording()
		},
		onStart: function() {
			props.startWaiting()
		},
		onError: function(e) {
			props.stopWaiting()
		}
	})
	
	
	useEffect(function() {
		if (useHotword) hotwordManager.start()
	},[])
	
	useEffect(function() {
		//console.log("CONF CHANGE",JSON.stringify(props.config))
		let useLocal = (props.config && props.config.stt && props.config.stt.use === "local" && props.config.stt.local_whisper_model)
		let useOpenAi = (props.config && props.config.stt && props.config.stt.use === "openai" && props.config.stt.openai_key)? true : false
		let useGroq = (props.config && props.config.stt && props.config.stt.use === "groq" && props.config.stt.groq_key)? true : false
		let useSelfHosted = (props.config && props.config.stt && props.config.stt.use === "self_hosted" && props.config.stt.self_hosted_url)? true : false
		if (useLocal) {
			//console.log("CONF CHANGE LL")
			//localTranscriber.init("Xenova/whisper-"+props.config.stt.local_whisper_model)
		} else if (useSelfHosted) {
			//console.log("CONF CHANGE SH",props.config.stt.self_hosted_url)
			//websocketTranscriber.init(props.config.stt.self_hosted_url)
			selfHostedTranscriber.init()
		} else if (useOpenAi) {
			//console.log("CONF CHANGE AI",props.config.stt.openai_key)
			openAITranscriber.init(props.config.stt.openai_key)
		} else if (useGroq) {
			//console.log("CONF CHANGE AI",props.config.stt.openai_key)
			groqTranscriber.init(props.config.stt.groq_key)
		}
		
	},[JSON.stringify(props.config)])
	
	//[((props.config && props.config.stt && props.config.stt.use )  ? props.config.stt.use : ''),((props.config && props.config.stt && props.config.stt.local_whisper_model) ? props.config.stt.local_whisper_model : '')])
	
	useEffect(function() {
		//console.log("CONF CHANGE hw",JSON.stringify(props.config))
		let useHotword = (props.config && props.config.stt && props.config.stt.use_hotword)
		if (useHotword) {
			//console.log("CONF CHANGE hotword start")
			hotwordManager.start()
		} else {
			hotwordManager.stop()
		}
	},[(props.config && props.config.stt && props.config.stt.use_hotword )])

	
	/* button COLORS
	  grey - not available, not activated
	* red (with line) - recording
	* green - online available, 
	* blue - offline available
	*/
		
	let useOnline = (useLocal || useOpenAi || useSelfHosted || useGroq) && onlineCheck.isOnline
	//console.log("IS ONLINE", 	useOnline, useOpenAi, useSelfHosted, useGroq, useLocal)
	const buttonStyleSending = {borderRadius:'35px',color:'black', backgroundColor:'#dc3545', border: '2px solid '+(audioRecorder.isSpeaking ? 'pink' : 'darkred')}
	const buttonStyleSpeaking = {borderRadius:'35px',color:'black', backgroundColor:'#e0acb1', border: '2px solid '+(audioRecorder.isSpeaking ? 'pink' : 'darkred')}
	const buttonStyleOnline = {borderRadius:'35px',color:'black', backgroundColor:'#198754', border: '2px solid '+(audioRecorder.isSpeaking ? 'lightgreen' : 'darkgreen')}
	const buttonStyleLocal = {borderRadius:'35px',color:'black', backgroundColor:'#0b5ed7', border: '2px solid '+(audioRecorder.isSpeaking ? 'lightblue' : 'darkblue')}
	const buttonStyleLoading = {borderRadius:'35px',color:'black', backgroundColor:'grey', border: '2px solid '+(audioRecorder.isSpeaking ? 'lightgrey' : 'darkgrey')}
	
	let buttonStyle
	let onClick = audioRecorder.handleToggleRecording
	//console.log('SB',useOpenAi, useSelfHosted, useLocal, transcriber.isBusy, transcriber.isModelLoading, audioRecorder.isInitialised.current)
	//websocketTranscriber.isBusy || openAITranscriber.isBusy || localTranscriber.isBusy
	//||  localTranscriber.isModelLoading
	//console.log("AA",(!useOpenAi && !useSelfHosted && !useLocal && !useGroq) ,audioRecorder.isInitialised.current)
	if (((!useOpenAi && !useSelfHosted && !useLocal && !useGroq) )) { // || !audioRecorder.isInitialised.current
		buttonStyle = buttonStyleLoading
		
		//|| localTranscriber.isBusy.current
		if (websocketTranscriber.isBusy || openAITranscriber.isBusy.current || groqTranscriber.isBusy.current) {
			// TODO FORCE STOP TRANSCRIPTION NOW AND/OR AT LEAST STAY STOPPED
			onClick = function() {audioRecorder.stopRecording()}
		} else {
			onClick = function() {}
		}
	} else {
		if (audioRecorder.isEnabled.current) { 	
			if (props.isPlaying.current) { 	
				buttonStyle = buttonStyleSpeaking
			} else {
				buttonStyle = buttonStyleSending
			}
		} else {
			if (useOnline) {
				buttonStyle = buttonStyleOnline
			} else {
				buttonStyle = buttonStyleLocal
			}
		}
		if (useHotword) buttonStyle.color="white"
	}
	//|| localTranscriber.isBusy || localTranscriber.isModelLoading
	 //"#dc3545" 
	return <>
	<Button style={buttonStyle}  onClick={onClick}  >{(websocketTranscriber.isBusy || openAITranscriber.isBusy|| groqTranscriber.isBusy ) ? icons['loader-line'] : (audioRecorder.isEnabled.current) ? icons['mic-off-fill'] : icons['mic-fill']}</Button>
	</>;
}

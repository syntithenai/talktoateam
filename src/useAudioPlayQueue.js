import {useRef, useState, useEffect} from 'react'
import useUtils from './useUtils'
export default function useAudioPlayQueue({forceRefresh, onStopPlaying, onStartPlaying, onFinishedPlaying, onError}) {
	let PLAYBACK_RATE=1
	let isPlaying = useRef(false)
	function setIsPlaying(v) {
		isPlaying.current = v
	}
	const utils = useUtils()
	let speechDatas = useRef({})
	
	let urlAudioPlayer = useRef()
	let playQueue=useRef([])
	
	const [isMuted, setIsMutedInner] = useState(false)
	const isMutedRef = useRef(false)
	function setIsMuted(f) {
		isMutedRef.current = f
		setIsMutedInner(f)
	}
	
	function mute() {
		//console.log('MUTE')
		setIsMuted(true)
		if (urlAudioPlayer.current) {
			urlAudioPlayer.current.volume = 0
		}
		forceRefresh()
	}
	
	function unmute() {
		//console.log('UNMUTE')
		setIsMuted(false)
		if (urlAudioPlayer.current) urlAudioPlayer.current.volume = 1
		forceRefresh()
	}
		
	function stopPlaying() {
		//console.log('STOP PLAY',urlAudioPlayer.current)
		if (onStopPlaying) onStopPlaying()
		setIsPlaying(false)
		playQueue.current = []
		if (urlAudioPlayer.current) {
			urlAudioPlayer.current.pause()
		}
	};
	
	// load internet url and return dataUri
	//async function getUrl(url,id) {
		//console.log("geturl",url,id)
	  //try {
		//const response = await fetch(url);
		//const arrayBuffer = await response.arrayBuffer();
		//const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
		//console.log("geturl loaded",url,id, base64)
		//return `data:${response.headers.get('content-type') || 'application/octet-stream'};base64,${base64}`;
	  //} catch (error) {
		//console.error('Error:', error);
		//return null;
	  //}
	//}

	function getUrl(url, id) {
		//console.log("geturl",url,id)
		return new Promise((resolve, reject) => {
			try {
				fetch(url).then(function(response) {
					response.blob().then(function(blob) {
						const reader = new FileReader();
						reader.onloadend = () => {
							//console.log("geturl loaded",url,id)
							resolve(reader.result, id);
						}
						reader.onerror = reject;
						reader.readAsDataURL(blob);
					}).catch(function(e) {console.log(e)});
				}).catch(function(e) {console.log(e)});
			} catch (error) {
				console.error('Error:', error);
				resolve(null);
			}
		})
	}	
	
	const playNextTimeout = useRef()
	
			
	function queueSpeech(textIn, config, engines, forceEngine='', forceVoice='', forceSpeed = '') {
		let text = utils.stripCodeParts(textIn)
		//console.log("STRIPPED", text, textIn)
		let id = utils.generateRandomId()
		playQueue.current.push(id)
		//console.log("QUEU SP",id, text, playQueue.current, speechDatas.current) //,config, id, engines, forceEngine)
		return new Promise(function(resolve,reject) {
			
			function playNextInQueue() {
				//console.log("PLAY NEXT IN Q11UE", isPlaying.current)
				if (!isPlaying.current || forceEngine) {
					//console.log("PLAY NEXT IN QUE", playQueue.current, speechDatas.current)
					clearTimeout(playNextTimeout.current)
					if (playQueue.current.length > 0) {
						let nextId = playQueue.current[0]
						let nextData = speechDatas.current[nextId]
						//console.log("PLAY ", nextId)
						// if data isn't loaded yet, 
						if (nextId && !nextData) {
							//console.log("PLAY wait", playQueue.current, speechDatas.current)
							playNextTimeout.current = setTimeout(function() {
								playNextInQueue()
							},200)
						} else if (nextId && nextData) { 
							//console.log("PLAY NEXT", nextId, playQueue.current, speechDatas.current)
							isPlaying.current = true
							playQueue.current = playQueue.current.slice(1)
						
							urlAudioPlayer.current.src = nextData
							urlAudioPlayer.current.pause()
							urlAudioPlayer.current.load()
							urlAudioPlayer.current.playbackRate = forceSpeed >= 0.25 && forceSpeed <=2 ? forceSpeed : PLAYBACK_RATE
							setTimeout(function() {
								if (onStartPlaying) onStartPlaying()
								urlAudioPlayer.current.play().catch(function(e) {console.log(e)})
							},100)
						}
						//resolve()
						
					} else {
						//console.log("PLAY ENDED all doNE",onFinishedPlaying, playQueue.current, speechDatas.current)
						isPlaying.current = false
						speechDatas.current = {}
						if (onFinishedPlaying) onFinishedPlaying()
						resolve()
					}
				} else {
					//console.log("PLAY wait2", playQueue.current, speechDatas.current)
					playNextTimeout.current = setTimeout(function() {
						playNextInQueue()
					},200)
				}
			}
			
			if (isMutedRef.current) resolve()
			
			urlAudioPlayer.current = new Audio();
			urlAudioPlayer.current.playbackRate = forceSpeed >= 0.25 && forceSpeed <=2 ? forceSpeed :  PLAYBACK_RATE
			urlAudioPlayer.current.volume = isMutedRef.current ? 0 : 1
			urlAudioPlayer.current.addEventListener("canplaythrough", event => {
			  //console.log('PLAY audio loaded')
			  if (onStartPlaying) onStartPlaying()
			  urlAudioPlayer.current.play().catch(function(e) {console.log(e)});
			});
			urlAudioPlayer.current.addEventListener("ended", event => {
				//console.log("PLAY ENDED", playQueue.current, speechDatas.current)
				isPlaying.current = false
				playNextInQueue()
			})
			urlAudioPlayer.current.addEventListener("error", event => {
				//console.log("PLAY error",event)
				isPlaying.current = false
				if (onError) onError(event)
				resolve()
			})
			
			if (!isMutedRef.current) { 
				//console.log("speekit", forceEngine)
				if (text && (forceEngine === 'self_hosted' || (!forceEngine && config && config.tts && config.tts.use === "self_hosted" && config.tts.self_hosted_url))) { 
					//setIsPlaying(true)
					let q = config.tts.self_hosted_url +  "/api/tts?text="+text + "&speaker_id="+(forceVoice ? forceVoice : (config.tts && config.tts.speaker_id ? config.tts.speaker_id : 'p299'))+"&style_wav=&language_id="
					//console.log('GU',q)
					getUrl(q,id).then(function(d) {
						//console.log("got data",id,q)
						speechDatas.current[id] = d
						playNextInQueue()
					})
					//.catch(function(e) {
						//console.log(e)
					//})
				} else if (text && (forceEngine === 'openai' || (!forceEngine && config && config.tts && config.tts.use === "openai" && config.tts.openai_key))) { 
					//setIsPlaying(true)
					engines.aiTts.speak(config.tts.openai_key, text, forceVoice ? forceVoice : (config.tts && config.tts.openai_voice ? config.tts.openai_voice : 'alloy'),forceSpeed).then(function(d) {
						//console.log("openai data",d,id)
						speechDatas.current[id] = d
						playNextInQueue()
						//playDataUri(b64).then(function() {
							////setIsPlaying(false)
							//resolve()
						//})
					})
				} else if (text && (forceEngine === 'web_speech' || (!forceEngine && config && config.tts && config.tts.use === "web_speech"))) { 
					//setIsPlaying(true)
					engines.webSpeechTts.speak(text).then(function() {
						//setIsPlaying(false)
						resolve()
					})
				} else if (text && (forceEngine === 'me_speak' || (!forceEngine &&  config && config.tts && config.tts.use === "me_speak"))) { 
					//setIsPlaying(true)
					engines.meSpeakTts.speak(text).then(function(d) {
						speechDatas.current[id] = d
						playNextInQueue()
						//playDataUri(dataUri).then(function() {
							//resolve()
						//})
					})
				} else {
					resolve()
				}
			} else {
				resolve()
			}
		})
	}
	
	return {mute, unmute, stopPlaying, queueSpeech, getUrl, isPlaying,setIsPlaying, isMuted, isMutedRef, urlAudioPlayer}	
}

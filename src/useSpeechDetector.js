import hark from 'hark'
import {useEffect, useRef, useState} from 'react'

export default function useSpeechDetector({onSpeech, onStopSpeech})  {

	const [isSpeaking, setIsSpeaking] = useState(false)
	const isInitialised = useRef(false)
	
	useEffect(function() {
		if (!isInitialised.current) {
			isInitialised.current = true
			
			var getUserMedia = navigator.getUserMedia || 
			navigator.mozGetUserMedia || 
			navigator.webkitGetUserMedia;
		 
			if (getUserMedia) {
				getUserMedia = getUserMedia.bind(navigator);
				getUserMedia(// media constraints
					{video: false, audio: true}, 
					// success callback
					function (stream) {
						// gets stream if successful
						var options = {interval: 50, threshold:-50};
						var speechEvents = hark(stream, options);
					 
						speechEvents.on('speaking', function() {
							//console.log('speaking')
						  if (onSpeech) onSpeech()
						  setIsSpeaking(true)
						});
					 
						speechEvents.on('stopped_speaking', function() {
							//console.log('stop speaking')
						  if (onStopSpeech) onStopSpeech()
						  setIsSpeaking(false)
						});
					}, 
					// error callback
					function (error) {
						console.log(error)
					}
				)
			} else {
				console.log("Failed get user media")
				// have to figure out how to handle the error somehow
			}
		 
			
		}	
	},[])	
	
	return {isSpeaking}
}

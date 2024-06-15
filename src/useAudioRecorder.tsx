import { useState, useEffect, useRef } from "react";
import { useMicVAD } from "@ricky0123/vad-react"


export default function useAudioRecorder({isPlaying, onRecordingComplete, onRecordingStarted, onRecordingStopped, config, forceRefresh}) {
    
    const isSpeaking = useRef(false)
	const isEnabled = useRef(false)
	let noSpeechTimeout = useRef()
	const haveSpeech = useRef(false)
	const isInitialised = useRef(true)
	
	const vad = useMicVAD({
		startOnLoad: true,
		// start
		onFrameProcessed: (probs, audio) => {
			//console.log("FFF",probs,audio)
		},
		onSpeechStart: () => {
			if (!isPlaying.current) { 
				//console.log("User started talking")
				stopNoSpeechTimeout()
			}
			isSpeaking.current = true
			forceRefresh()
		},
		// stop
		onVADMisfire: () => {
		  //console.log("User stopped talking")
		  startNoSpeechTimeout()
		  isSpeaking.current = false
		  forceRefresh()
		},
		onSpeechEnd: (audio) => {
		  //console.log("User stopped talking", audio, isEnabled.current)
		  startNoSpeechTimeout()
		  isSpeaking.current = false
		  if (isEnabled.current) {
				let duration = audio ? audio.length/16000 : 0
				console.log("Submit audio", duration, new Blob([encodeWAV(audio)],{type:'audio/wav'}),audio,config)
				let b = new Blob([encodeWAV(audio)],{type:'audio/wav'})
				//downloadBlobAsWav(b)
				playBlob(b)
				onRecordingComplete(duration, b,audio,config)
				
		  }
		  forceRefresh()
		}
	  })
	  
	  
	
    function stopNoSpeechTimeout() {
		//console.log('TIMEOUT clear')
		clearTimeout(noSpeechTimeout.current)
	}
	
	function startNoSpeechTimeout() {
		//return
		//console.log('TIMEOUT reset')
		clearTimeout(noSpeechTimeout.current)
		noSpeechTimeout.current = setTimeout(function() {
			//console.log('TIMEOUT')
			stopRecording()
		},8000)
	}

     const startRecording = async (forceHaveSpeech) => {
		//console.log("start rec")
		isEnabled.current = true
		//console.log("start rec done ")
		if (onRecordingStarted) onRecordingStarted()
		startNoSpeechTimeout()
		forceRefresh()
	}
	
    
	function downloadBlobAsWav(blob, filename) {
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = filename;
	  document.body.appendChild(a);
	  a.click();
	  setTimeout(() => {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);  
	  }, 0);
	}
	
	function playBlob(blob) {
		try { 
			const url = URL.createObjectURL(blob);
			const audio = document.createElement('audio');
			audio.src = url;
			audio.play().catch (function(e) {console.log("FAILED TO PLAY1",e)})
		} catch (e) {
			console.log("FAILED TO PLAY",e)
		}		
	}
	
	
	const stopRecording = () => {
		//console.log("stop rec")
		isEnabled.current = false
		if (onRecordingStopped) onRecordingStopped()
		forceRefresh()
	};
	
	
    

    const handleToggleRecording = () => {
        if (isEnabled.current) {
            stopRecording();
        } else {
            startRecording();
        }
    };

	
		
	function encodeWAV(
	  samples: Float32Array,
	  format: number = 3,
	  sampleRate: number = 16000,
	  numChannels: number = 1,
	  bitDepth: number = 32
	) {
	  var bytesPerSample = bitDepth / 8
	  var blockAlign = numChannels * bytesPerSample
	  var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
	  var view = new DataView(buffer)
	  /* RIFF identifier */
	  writeString(view, 0, "RIFF")
	  /* RIFF chunk length */
	  view.setUint32(4, 36 + samples.length * bytesPerSample, true)
	  /* RIFF type */
	  writeString(view, 8, "WAVE")
	  /* format chunk identifier */
	  writeString(view, 12, "fmt ")
	  /* format chunk length */
	  view.setUint32(16, 16, true)
	  /* sample format (raw) */
	  view.setUint16(20, format, true)
	  /* channel count */
	  view.setUint16(22, numChannels, true)
	  /* sample rate */
	  view.setUint32(24, sampleRate, true)
	  /* byte rate (sample rate * block align) */
	  view.setUint32(28, sampleRate * blockAlign, true)
	  /* block align (channel count * bytes per sample) */
	  view.setUint16(32, blockAlign, true)
	  /* bits per sample */
	  view.setUint16(34, bitDepth, true)
	  /* data chunk identifier */
	  writeString(view, 36, "data")
	  /* data chunk length */
	  view.setUint32(40, samples.length * bytesPerSample, true)
	  if (format === 1) {
		// Raw PCM
		floatTo16BitPCM(view, 44, samples)
	  } else {
		writeFloat32(view, 44, samples)
	  }
	  return buffer
	}

	function interleave(inputL: Float32Array, inputR: Float32Array) {
	  var length = inputL.length + inputR.length
	  var result = new Float32Array(length)
	  var index = 0
	  var inputIndex = 0
	  while (index < length) {
		result[index++] = inputL[inputIndex] as number
		result[index++] = inputR[inputIndex] as number
		inputIndex++
	  }
	  return result
	}

	function writeFloat32(output: DataView, offset: number, input: Float32Array) {
	  for (var i = 0; i < input.length; i++, offset += 4) {
		output.setFloat32(offset, input[i] as number, true)
	  }
	}

	function floatTo16BitPCM(
	  output: DataView,
	  offset: number,
	  input: Float32Array
	) {
	  for (var i = 0; i < input.length; i++, offset += 2) {
		var s = Math.max(-1, Math.min(1, input[i] as number))
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
	  }
	}

	function writeString(view: DataView, offset: number, string: string) {
	  for (var i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i))
	  }
	}
	
	function init(){} 
	
	
    return {startRecording, stopRecording, handleToggleRecording, isSpeaking, isEnabled, isInitialised, init}
}




//function int16ArrayToWavBlob(int16Array) {
		//const sampleRate = 16000
		//// Set the WAV file header properties
		//const numChannels = 1; // Mono
		//const bitsPerSample = 16;
		//const byteRate = sampleRate * numChannels * bitsPerSample / 8;
		//const blockAlign = numChannels * bitsPerSample /8;
		//const dataSize = int16Array.length * 2; // 2 bytes per sample

		//// Create a Uint8Array to hold the WAV file header and audio data
		//const wavArray = new Uint8Array(44 + dataSize);

		//// Set the WAV file header
		//let offset = 0;
		//// RIFF header
		//wavArray[offset++] = 0x52; // R
		//wavArray[offset++] = 0x49; // I
		//wavArray[offset++] = 0x46; // F
		//wavArray[offset++] = 0x46; // F
		//// File size
		//wavArray[offset++] = (36 + dataSize) & 0xFF;
		//wavArray[offset++] = ((36 + dataSize) >> 8) & 0xFF;
		//wavArray[offset++] = ((36 + dataSize) >> 16) & 0xFF;
		//wavArray[offset++] = ((36 + dataSize) >> 24) & 0xFF;
		//// WAVE
		//wavArray[offset++] = 0x57; // W
		//wavArray[offset++] = 0x41; // A
		//wavArray[offset++] = 0x56; // V
		//wavArray[offset++] = 0x45; // E
		//// fmt
		//wavArray[offset++] = 0x66; // f
		//wavArray[offset++] = 0x6d; // m
		//wavArray[offset++] = 0x74; // t
		//// Subchunk1Size
		//wavArray[offset++] = 0x10; // 16 bytes
		//wavArray[offset++] = 0x00; // 
		//wavArray[offset++] = 0x00; // 
		//wavArray[offset++] = 0x00; // 
		//// AudioFormat
		//wavArray[offset++] = 0x01; // PCM
		//// NumChannels
		//wavArray[offset++] = numChannels;
		//wavArray[offset++] = 0x00; // 
		//// SampleRate
		//wavArray[offset++] = sampleRate & 0xFF;
		//wavArray[offset++] = (sampleRate >> 8) & 0xFF;
		//wavArray[offset++] = (sampleRate >> 16) & 0xFF;
		//wavArray[offset++] = (sampleRate >> 24) & 0xFF;
		//// ByteRate
		//wavArray[offset++] = byteRate & 0xFF;
		//wavArray[offset++] = (byteRate >> 8) & 0xFF;
		//wavArray[offset++] = (byteRate >> 16) & 0xFF;
		//wavArray[offset++] = (byteRate >> 24) & 0xFF;
		//// BlockAlign
		//wavArray[offset++] = blockAlign;
		//wavArray[offset++] = 0x00; // 
		//// BitsPerSample
		//wavArray[offset++] = bitsPerSample;
		//wavArray[offset++] = 0x00; // 
		//// data
		//wavArray[offset++] = 0x64; // d
		//wavArray[offset++] = 0x61; // a
		//wavArray[offset++] = 0x74; // t
		//wavArray[offset++] = 0x61; // a
		//// DataSize
		//wavArray[offset++] = dataSize & 0xFF;
		//wavArray[offset++] = (dataSize >> 8) & 0xFF;
		//wavArray[offset++] = (dataSize >> 16) & 0xFF;
		//wavArray[offset++] = (dataSize >> 24) & 0xFF;

		//// Copy the audio data
		//for (let i = 0; i < int16Array.length; i++) {
		//wavArray[offset++] = int16Array[i] & 0xFF;
		//wavArray[offset++] = (int16Array[i] >> 8) & 0xFF;
		//}

		//// Create a Blob from the WAV file data
		//const wavBlob = new Blob([wavArray], { type: 'audio/wav' });

		//return wavBlob;
	//}




//function wavArrayToBlob(audioData) {
	  //// Prepare the WAV header (assuming 16-bit signed PCM)
	  //const header = new ArrayBuffer(44);
	  //const view = new DataView(header);

	  //view.setUint32(0, 0x46464952, true); // "RIFF" chunk identifier
	  //const fileSize = audioData.length * 2 + 36; // Size of entire file
	  //view.setUint32(4, fileSize, true);
	  //view.setUint32(8, 0x4E534F46, true); // "WAVE" chunk identifier
	  //view.setUint32(12, 0x20746D66, true); // "fmt " subchunk identifier
	  //view.setUint32(16, 16, true);         // Subchunk size (16 for PCM)
	  //view.setUint16(20, 1, true);          // Audio format (1 for PCM)
	  //view.setUint16(22, 1, true);          // Number of channels (1 for mono)
	  //view.setUint32(24, 16000, true);       // Sample rate (adjust if needed)
	  //view.setUint32(28, 16000 * 2, true); // Bytes per second
	  //view.setUint16(32, 2, true);          // Block alignment
	  //view.setUint16(34, 16, true);         // Bits per sample

	  //view.setUint32(36, audioData.length * 2, true); // "data" chunk identifier

	  //// Combine header and audio data into a single buffer
	  //const buffer = new ArrayBuffer(header.byteLength + audioData.length * 2);
	  //const fullView = new Uint8Array(buffer); // Use Uint8Array instead of DataView

	  //fullView.set(new Uint8Array(header), 0);
	  //fullView.set(new Int16Array(audioData), header.byteLength);

	  //// Create the Blob with WAV data and type
	  //return new Blob([buffer], { type: 'audio/wav' });
	//}
			//const fileReader = new FileReader();
			//fileReader.onloadend = async () => {
				//const audioCTX = new AudioContext({
					//sampleRate: 16000
				//});
				//const arrayBuffer = fileReader.result as ArrayBuffer;
				////console.log(arrayBuffer)
				//const decoded = await audioCTX.decodeAudioData(arrayBuffer);
				//console.log("AR FS",config, decoded)
				//if (onRecordingComplete) {
					//calculateAudioDuration(blob).then(function(duration) {
						//console.log("AR FS",config, decoded, blob)
						//
					//})
				//}
			//};
			//fileReader.readAsArrayBuffer(blob);




	//function init() {
		//console.log("rec init")
		//if (isInitialised.current) return
		//return new Promise(function(resolve,reject) {
			//navigator.mediaDevices.getUserMedia({ audio: true })
            //.then(stream => {
				////console.log("create rec")
				////recorder = RecordRTC(stream, {
					////type: 'audio',
					////recorderType: RecordRTC.StereoAudioRecorder,
					////mimeType: 'audio/wav',
					////timeSlice: 500,
					////desiredSampRate: 16000,
					////numberOfAudioChannels: 1,
					////ondataavailable: handleDataAvailable
				////});
				////recorder.startRecording()
				////isInitialised.current = true
				////if (onReady) onReady()
				////resolve()
			//})
		//})
	//}
	


//import RecordRTC from 'recordrtc'
//import { WebVoiceProcessor } from '@picovoice/web-voice-processor';



//const RecordRTC = window.RecordRTC
//function getMimeType() {
	////return "audio/wav"
    //const types = [
        //"audio/webm",
        //"audio/mp4",
        //"audio/ogg",
        //"audio/wav",
        //"audio/aac",
    //];
    //for (let i = 0; i < types.length; i++) {
        //if (MediaRecorder.isTypeSupported(types[i])) {
			////console.log('use type '+types[i])
            //return types[i];
        //}
    //}
    ////console.log('use type undefined')
    //return undefined;
//}

//export default function useAudioRecorder({isPlaying, config, onRecordingComplete, onRecordingStarted, onRecordingStopped, onReady, onDataAvailable}) {
    
   
    //return {startRecording, stopRecording, recording, handleToggleRecording, isSpeaking: speechDetector.isSpeaking, init, isEnabled, isInitialised, recordedData}
//}

	//function combineWavBlobs(blobs) {
		//return new Promise(function(resolve,reject) {
			//var type='audio/wav'
			//var buffers = [];

			//var index = 0;

			//function readAsArrayBuffer() {
				//if (!blobs[index]) {
					//return concatenateBuffers();
				//}
				//var reader = new FileReader();
				//reader.onload = function(event) {
					//buffers.push(event.target.result);
					//index++;
					//readAsArrayBuffer();
				//};
				//reader.readAsArrayBuffer(blobs[index]);
			//}

			//readAsArrayBuffer();


			//function audioLengthTo32Bit(n) {
				//n = Math.floor(n);
				//var b1 = n & 255;
				//var b2 = (n >> 8) & 255;
				//var b3 = (n >> 16) & 255;
				//var b4 = (n >> 24) & 255;
			 
				//return [b1, b2, b3, b4];
			//}
			
			//function concatenateBuffers() {
				//var byteLength = 0;
				//buffers.forEach(function(buffer) {
					//byteLength += buffer.byteLength;
				//});

				//var tmp = new Uint8Array(byteLength);
				//var lastOffset = 0;
				//var newData;
				//buffers.forEach(function(buffer) {
					//if (type=='audio/wav' && lastOffset >  0) newData = new Uint8Array(buffer, 44);
					//else newData = new Uint8Array(buffer);
					//tmp.set(newData, lastOffset);
					//lastOffset += newData.length;
				//});
				//if (type=='audio/wav') {
					//tmp.set(audioLengthTo32Bit(lastOffset - 8), 4);
					//tmp.set(audioLengthTo32Bit(lastOffset - 44), 40); // update audio length in the header
				//}
				//var blob = new Blob([tmp.buffer], {
					//type: type
				//});
				//resolve(blob);         
				
			//}
		//})
    //}
	//function calculateAudioDuration(blob) {
		  //return new Promise((resolve, reject) => {
			//const audio = new Audio();
			//const objectURL = URL.createObjectURL(blob);
			
			//audio.addEventListener('loadedmetadata', function() {
			  //const duration = audio.duration;
			  //URL.revokeObjectURL(objectURL);
			  //console.log('Duration',duration)
			  //resolve(duration);
			//});

			//audio.addEventListener('error', function(err) {
			  //URL.revokeObjectURL(objectURL);
			  //reject(err);
			//});

			//audio.src = objectURL;
		  //});
	//}
	
	
	


	//function handleDataAvailable(d) {
		//if (isPlaying.current) { 
			////console.log("skip record due to playback")
			//preChunksRef.current  = []
			//chunksRef.current  = []
			//return
		//}
		//if (onReady && preChunksRef.current.length === 0) {
			////console.log("DO READY")
			//onReady()
			
		//}
				
		////console.log('hd',isEnabled.current?'true':'false',onDataAvailable)
		//if (onDataAvailable && isEnabled.current) {
			//onDataAvailable(d)
		//}	
			
		//if (!isEnabled.current) {
			//preChunksRef.current.push(d);
			//// capture audio for 200ms before actual start to avoid losing words at beginning of sentence
			//if (preChunksRef.current.length > 2) {
				//preChunksRef.current.shift()
			//}
			////console.log("B",d)
		//} else {
			//// push from prechunks to chunks
			//for (let chunk in preChunksRef.current) {
				//chunksRef.current.push(preChunksRef.current[chunk]);
			//}
			//preChunksRef.current = [];
			//if (d.size > 0) {
				//chunksRef.current.push(d)
			//}
			////console.log("C",d)
		//}
		//recorder.getInternalRecorder().freeMemory()
		
	//}
	
	

	
	//function downloadBlobAsWav(blob, filename) {
	  //const url = URL.createObjectURL(blob);
	  //const a = document.createElement('a');
	  //a.href = url;
	  //a.download = filename;
	  //document.body.appendChild(a);
	  //a.click();
	  //setTimeout(() => {
		//document.body.removeChild(a);
		//window.URL.revokeObjectURL(url);  
	  //}, 0);
	//}
	
	//// This is passed in an unsigned 16-bit integer array. It is converted to a 32-bit float array.
	//// The first startIndex items are skipped, and only 'length' number of items is converted.
	//function int16ToFloat32(inputArray) {
		//let startIndex = 0
		//let length = inputArray.length
		//var output = new Float32Array(inputArray.length-startIndex);
		//for (var i = startIndex; i < length; i++) {
			//var int = inputArray[i];
			//// If the high bit is on, then it is a negative number, and actually counts backwards.
			//var float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
			//output[i] = float;
		//}
		//return output;
	//}
	
	//function createWavFile(int16Array) {
    //const numberOfChannels = 1; // Mono
    //const sampleRate = 16000; // 16 kHz
    //const bytesPerSample = 2; // Int16
    //const buffer = new ArrayBuffer(44 + int16Array.length * bytesPerSample);
    //const view = new DataView(buffer);

    //// Write WAV header
    //writeString(view, 0, 'RIFF');
    //view.setUint32(4, 36 + int16Array.length * bytesPerSample, true);
    //writeString(view, 8, 'WAVE');
    //writeString(view, 12, 'fmt ');
    //view.setUint32(16, 16, true); // PCM format
    //view.setUint16(20, 1, true); // Number of channels
    //view.setUint32(22, sampleRate, true); // Sample rate
    //view.setUint32(24, sampleRate * bytesPerSample * numberOfChannels, true); // Byte rate
    //view.setUint16(28, bytesPerSample * numberOfChannels, true); // Block align
    //view.setUint16(30, bytesPerSample * 8, true); // Bits per sample
    //writeString(view, 36, 'data');
    //view.setUint32(40, int16Array.length * bytesPerSample, true);

    //// Write audio data
    //for (let i = 0; i < int16Array.length; i++) {
        //view.setInt16(44 + i * bytesPerSample, int16Array[i], true);
    //}

    //return buffer;
//}

//function writeString(view, offset, string) {
    //for (let i = 0; i < string.length; i++) {
        //view.setUint8(offset + i, string.charCodeAt(i));
    //}
//}
	
			
	//const finaliseRecording = async (config) => {
		////console.log(haveSpeech.current,chunksRef.current)
		////console.log("AR F",haveSpeech.current ,chunksRef.current.length, config)
		//if (haveSpeech.current && chunksRef.current.length > 1) {    
			//// Received a stop event
			////let flat = chunksRef.current.flat(1)
			////console.log("FLAT",flat)
			
			//let combined = Int16Array.from(Array.prototype.concat(...chunksRef.current.map(a => Array.from(a))));
			////console.log("AR F ccc ",combined)
			////let asFloat = int16ToFloat32(combined)
			////console.log("AR F FFF ",asFloat)
			//let wave = new WaveFile()
			//wave.fromScratch(1, 16000, '16', combined);
			//let asWav = wave.toBuffer()
			////console.log("AR F WWW ",asWav)
			//let blob = new Blob([asWav],{type:'audio/wav'})
			////console.log("AR F bbb ",blob, config, typeof config)
			//if (typeof config === 'string' && config) {
				//try {
					//config = JSON.parse(config)
					//let duration = combined.length/16000
					//onRecordingComplete(duration, blob, combined, config);
				//} catch (e) {
					////console.log("Failed to parse config ", config)
				//}
			//}

			////let bb = wavArrayToBlob(chunksRef.current)
			////blobToBase64(blob).then(function(b64) {
				////setRecordedData(b64);
			////})
			////let ff = createWavFile(combined)
			////console.log("wavfile as buffer",ff)
			////let blob = new Blob([ff],{type:'audio/wav'})
			
 //You can now use the WAV file Blob as needed
 //For example, you can create a URL for the Blob and set it as the src of an audio element
	//try { 
		//const url = URL.createObjectURL(blob);
		//const audio = document.createElement('audio');
		//audio.src = url;
		//audio.play().catch (function(e) {console.log("FAILED TO PLAY1",e)})
	//} catch (e) {
		//console.log("FAILED TO PLAY",e)
	//}		
			////console.log("AR F bbb ",blob)
			////downloadBlobAsWav(blob,'last_recording.wav')
		//}	
		
	
	//}
	
//function blobToBase64(blob) {
	//return new Promise((resolve, reject) => {
		//if (!blob) resolve('')
		//const reader = new FileReader();
		//reader.readAsDataURL(blob);
		//reader.onload = () => {
			//const base64String = reader.result.split(',')[1];
			//resolve('data:audio/wav;base64,'+base64String);
		//};
		//reader.onerror = (error) => reject(error);
	//});
//}

	
	//})
	
	//useEffect(function() {
		//if (!isInitialised.current) {
			//isInitialised.current = true
		
			//connect().then(function(a) {
				//register(a).then(function() {
					//navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
						////const audioContext = new AudioContext({ sampleRate: 16000 });
						////const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
						////const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);
						////mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode);
						////mediaRecorder.current = new MediaRecorder(mediaStreamAudioDestinationNode.stream, { mimeType: 'audio/wav' });
						//mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/wav' });

						//mediaRecorder.current.ondataavailable = function(d) {console.log("SA",d)}
						//mediaRecorder.current.onstop = function() {console.log("STOP")}
						//mediaRecorder.current.onstart = function() {console.log("START")}
						//mediaRecorder.current.onerror = function() {console.log("ERROR")}
						//mediaRecorder.current.onpause = function() {console.log("PAUSE")}
						//mediaRecorder.current.onresume = function() {console.log("RESUME")}
						//mediaRecorder.current.start(100)
						//console.log("SDTD",mediaRecorder.current)
					//})
				//})
			//})
		//}
	
		
		//audioProcessor.start([{processFrame: function(d) {
			////const d = new Blob([e])
			//if (isPlaying.current) { 
				////console.log("skip record due to playback")
				//preChunksRef.current  = []
				//chunksRef.current  = []
				//return
			//}
			//if (onReady && preChunksRef.current.length === 0) {
				////console.log("DO READY")
				//onReady()
				
			//}
					
			////console.log('hd',isEnabled.current?'true':'false',onDataAvailable)
			//if (onDataAvailable && isEnabled.current) {
				//onDataAvailable(d)
			//}	
				
			//if (!isEnabled.current) {
				//preChunksRef.current.push(d);
				//// TODO check chunk duration with audioProcessor
				//// capture audio for 200ms before actual start to avoid losing words at beginning of sentence
				//if (preChunksRef.current.length > 2) {
					//preChunksRef.current.shift()
				//}
				////console.log("B",d)
			//} else {
				//// push from prechunks to chunks
				//for (let chunk in preChunksRef.current) {
					//chunksRef.current.push(preChunksRef.current[chunk]);
				//}
				//preChunksRef.current = [];
				//if (d.length > 0) {
					//chunksRef.current.push(d)
				//}
				////console.log("C",d)
			//}
			//}}],function(e) {
			//console.log('ERROR',e)
		//})
	//},[])
	
	
	//useEffect(function() {
		////console.log('config change',JSON.stringify(config))
		//if (config) configRef.current = JSON.parse(JSON.stringify(config))
	//},[JSON.stringify(config)])
    
    
	 //const [recording, setRecording] = useState(false);
    //const [duration, setDuration] = useState(0);
    //const [recordedData, setRecordedData] = useState<Blob | null>(null);
    ////const audioWorklet = useAudioWorklet()
    //const chunksRef = useRef<Blob[]>([]);
	//const preChunksRef = useRef<Blob[]>([]);
    ////const audioRef = useRef<HTMLAudioElement | null>(null);

	//let recorder = null
    
    //import use AudioProcessor from './useAudioProcessor'
//import useSpeechDetector from './useSpeechDetector'
//import {WaveFile} from 'wavefile'
//import useAudioWorklet from './useAudioWorklet'

//import { MediaRecorder, register } from 'extendable-media-recorder';
//import { connect } from 'extendable-media-recorder-wav-encoder';

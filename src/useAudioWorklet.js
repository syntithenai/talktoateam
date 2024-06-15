export default function useAudioWorklet(props) {


	function int16ToWav(buffer, sampleRate) {
		const wavBuffer = new ArrayBuffer(44 + buffer.length * 2);
		const view = new DataView(wavBuffer);

		function writeString(view, offset, string) {
			for (let i = 0; i < string.length; i++) {
				view.setUint8(offset + i, string.charCodeAt(i));
			}
		}

		const writeHeader = () => {
			writeString(view, 0, 'RIFF');
			view.setUint32(4, 36 + buffer.length * 2, true);
			writeString(view, 8, 'WAVE');
			writeString(view, 12, 'fmt ');
			view.setUint32(16, 16, true);
			view.setUint16(20, 1, true);
			view.setUint16(22, 1, true);
			view.setUint32(24, sampleRate, true);
			view.setUint32(28, sampleRate * 2, true);
			view.setUint16(32, 2, true);
			view.setUint16(34, 16, true);
			writeString(view, 36, 'data');
			view.setUint32(40, buffer.length * 2, true);
		};

		const writeData = () => {
			for (let i = 0; i < buffer.length; i++) {
				view.setInt16(44 + i * 2, buffer[i], true);
			}
		};

		writeHeader();
		writeData();

		return new Blob([view], { type: 'audio/wav' });
	}


	async function initAudio() {
		const audioContext = new AudioContext();
		console.log('context')
		// Load the AudioWorkletProcessor
		await audioContext.audioWorklet.addModule('./resampleProcessor.js');
		console.log('added module')
		// Create an instance of the processor
		const resampleNode = new AudioWorkletNode(audioContext, 'resample-processor');

		// Handle messages from the AudioWorkletProcessor
		resampleNode.port.onmessage = (event) => {
			const int16Buffer = event.data;
			// Here, you can handle the int16Buffer, like saving it as a WAV file
			console.log('Resampled audio buffer:', int16Buffer);
		};

		// Get user media (microphone input)
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const source = audioContext.createMediaStreamSource(stream);

		// Connect the source to the processor and the processor to the audio context
		source.connect(resampleNode);
		resampleNode.connect(audioContext.destination);
	}


	return {initAudio}
}

//async function initAudio() {
    //const audioContext = new AudioContext();

    //await audioContext.audioWorklet.addModule('audio-processor.js');

    //const resampleNode = new AudioWorkletNode(audioContext, 'resample-processor');

    //resampleNode.port.onmessage = (event) => {
        //const int16Buffer = event.data;
        //console.log('Resampled audio buffer:', int16Buffer);

        //const wavBlob = int16ToWav(int16Buffer, 16000);
        //const url = URL.createObjectURL(wavBlob);
        //const a = document.createElement('a');
        //a.style.display = 'none';
        //a.href = url;
        //a.download = 'resampled-audio.wav';
        //document.body.appendChild(a);
        //a.click();
        //window.URL.revokeObjectURL(url);
    //};

    //const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //const source = audioContext.createMediaStreamSource(stream);

    //source.connect(resampleNode);
    //resampleNode.connect(audioContext.destination);
//}

//initAudio().catch(console.error);

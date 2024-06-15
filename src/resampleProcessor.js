class ResampleProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.sampleRate = 16000; // Target sample rate
        this.buffer = [];
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            this.buffer.push(...input[0]);

            if (this.buffer.length >= this.sampleRate) {
                // Resample and post message to main thread
                const resampled = this.resample(this.buffer, this.sampleRate);
                this.port.postMessage(resampled);
                this.buffer = [];
            }
        }
        return true;
    }

    resample(inputBuffer, targetSampleRate) {
        const inputSampleRate = sampleRate; // Original sample rate
        const ratio = inputSampleRate / targetSampleRate;
        const length = Math.ceil(inputBuffer.length / ratio);
        const outputBuffer = new Float32Array(length);

        for (let i = 0; i < length; i++) {
            const index = i * ratio;
            const before = Math.floor(index);
            const after = Math.ceil(index);
            const atPoint = index - before;

            outputBuffer[i] = inputBuffer[before] + (inputBuffer[after] - inputBuffer[before]) * atPoint;
        }

        // Convert Float32 to Int16
        const int16Buffer = new Int16Array(outputBuffer.length);
        for (let i = 0; i < outputBuffer.length; i++) {
            int16Buffer[i] = Math.max(-1, Math.min(1, outputBuffer[i])) * 0x7FFF;
        }

        return int16Buffer;
    }
}

registerProcessor('resample-processor', ResampleProcessor);

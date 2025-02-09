import { useState, useRef } from "react";

export interface MessageEventHandler {
    (event: MessageEvent): void;
}

export function useWhisperWorker(messageEventHandler: MessageEventHandler): Worker {
	// Create new worker once and never again
    const [worker] = useState(() => createWorker(messageEventHandler));
    return worker;
}

function createWorker(messageEventHandler: MessageEventHandler): Worker {
	//console.log('CREATE WORKER')
    const worker = new Worker(new URL("./whisper_worker.js", import.meta.url), {
        type: "module",
    });
    // Listen for messages from the Web Worker
    worker.addEventListener("message", messageEventHandler);
    return worker;
}

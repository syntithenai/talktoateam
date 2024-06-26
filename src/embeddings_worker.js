
import { pipeline , env} from '@xenova/transformers';
import { getEmbedding, EmbeddingIndex } from 'client-vector-search';
console.log("WORKER")

env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * This class uses the Singleton pattern to ensure that only one instance of the
 * pipeline is loaded. This is because loading the pipeline is an expensive
 * operation and we don't want to do it every time we want to translate a sentence.
 */

function generateFragments(inputString, chunkSize = 20, overlapSize = 3) {
    const words = inputString.split(/\s+/);
    const result = [];
    
    for (let i = 0; i < words.length; i += (chunkSize - overlapSize)) {
        const chunk = words.slice(i, i + chunkSize);
        result.push(chunk.join(' '));
        if (i + chunkSize >= words.length) {
            break;
        }
    }
    return result;
    
    // return split(inputString).filter(function(a) { return (a.type === 'Sentence') }).map(function(a) {return a.raw})
}


class MyEmbeddingPipeline {
    static model = 'TaylorAI/gte-tiny' //'Xenova/gte-small'
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline('feature-extraction', this.model, { progress_callback });
        }
        console.log("GET INST",this.instance)
        return this.instance;
    }
}
function generateFragments(inputString, chunkSize = 20, overlapSize = 3) {
		const words = inputString.split(/\s+/);
		const result = [];
		
		for (let i = 0; i < words.length; i += (chunkSize - overlapSize)) {
			const chunk = words.slice(i, i + chunkSize);
			result.push(chunk.join(' '));
			if (i + chunkSize >= words.length) {
				break;
			}
		}
		return result;
		
		// return split(inputString).filter(function(a) { return (a.type === 'Sentence') }).map(function(a) {return a.raw})
	}
// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
	 console.log("WORKER mesage",event)
    // Retrieve the translation pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let embedder = await MyEmbeddingPipeline.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });
    let fragments = generateFragments(event.data.text)
    console.log("FRAGS",fragments)
    let output = await Promise.all(fragments.map((q) => embedder(q)));
    console.log("EMBS",output)
    //let output = await embedder(event.data.text)
    // let precision = 7
    // const roundedOutput = Array.from(output.data).map(
    //     (value) => parseFloat(value.toFixed(precision)),
    // )
    // Send the output back to the main thread
    console.log("WORKER COMPLETE",output)

    self.postMessage({
        status: 'complete',
        output: output,
    });
});

const config = require('../config');
const  agenticLlmApiClient = require('../agenticLlmApiClient');
const  tavilySearch = require('../tavily');
const  linearCodingTeam = require('../data/linearCodingTeam');

test('linear team flow', async () => {
   
	let updateContent = null
	let readyCalled = false
	let startCalled = false
	let resolveContent = null
	let errorContent = null
	
	let onUpdate = function(partial, content) {
		updateContent = content
	}
	let onComplete = function(content) {
		console.log('COMPLETE',content)
		expect(content.indexOf('```python')).not.toBe(-1)
	}
	let onReady = function(e) {
		readyCalled = true
	}
	let onError = function(e) {
		errorContent = e
		c.stop()
	}
	let onStart = function(e) {
		startCalled = true
	}
	let c = agenticLlmApiClient({url: config.url,key: config.key,model: config.model, onReady, onError})

	let modelConfig = {}

	async function start() {
		//console.log("startup")
		return c.startTeam({message: "write a program to count to 10", team: linearCodingTeam,modelConfig, onUpdate, onComplete, onStart}).then(function(answer) {
			resolveContent = answer
		})
	}

	await start()
  
  
 
});

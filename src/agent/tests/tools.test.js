const config = require('../config');
const  agenticLlmApiClient = require('../agenticLlmApiClient');
const  tavilySearch = require('../tavily');
const  team = require('../data/research team');

//test('startToolCalls', async () => {
	//let f = function(e) {}
	
	//let c = agenticLlmApiClient({url: config.url,key: config.key,model: config.model, onReady: f, onError: f})

	//let res = await c.startToolCalls("```tool\ngoogle_search(where is london)\n```")
	//console.log(res)
	//expect(Object.keys(res).length).toBeGreaterThan(0)

	
//},2000);


test('tool use research team', async () => {
   
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
		expect(content.indexOf('```tool')).toBe(-1)
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
		console.log("startup")
		return c.startTeam({message: "what is the latest news on covid", team: team, onUpdate, onComplete, onStart}).then(function(answer) {
			resolveContent = answer
		})
	}
	await start()
},20000);


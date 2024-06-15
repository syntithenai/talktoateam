import {useState, useEffect, useRef} from 'react'
import useUtils from './useUtils'
export default function useOpenAiUsageLogger() {
	
	const [logs, setLogsInner] = useState([])
	const utils = useUtils()
	function setLogs(v) {
		setLogsInner(v)
		if (v.openai_log) localStorage.setItem('openai_log',JSON.stringify(v.openai_log))
		if (v.openai_log_stt) localStorage.setItem('openai_log_stt',JSON.stringify(v.openai_log_stt))
		if (v.openai_log_tts) localStorage.setItem('openai_log_tts',JSON.stringify(v.openai_log_tts))
		
	}
	
	useEffect(function() {
		try {
			let logEntries = JSON.parse(localStorage.getItem("openai_log"))
			let logEntriesStt = JSON.parse(localStorage.getItem("openai_log_stt"))
			let logEntriesTts = JSON.parse(localStorage.getItem("openai_log_tts"))
			setLogs({openai_log: logEntries, openai_log_stt: logEntriesStt, openai_log_tts: logEntriesTts})
		} catch (e) {}
	},[])
	
	const pricing = {
		"---------- OPENAI  -------": {
		"price_in": "0.00",
		"price_out": "0.00",
	  },
	  "gpt-4o": {
		"price_in": "5.00",
		"price_out": "15.00"
	  },
	  "gpt-4-turbo-2024-04-09": {
		"price_in": "10.00",
		"price_out": "30.00"
	  },
	  "gpt-4": {
		"price_in": "30.00",
		"price_out": "60.00"
	  },
	  "gpt-4-32k": {
		"price_in": "60.00",
		"price_out": "120.00"
	  },
	  "gpt-3.5-turbo-0125": {
		"price_in": "0.50",
		"price_out": "1.50"
	  },
	  "gpt-3.5-turbo-instruct": {
		"price_in": "1.50",
		"price_out": "2.00"
	  },
	  "davinci-002": {
		"price_in": "2.00",
		"price_out": "2.00",
	  },
	  "babbage-002": {
		"price_in": "0.40",
		"price_out": "0.40",
	  },
	  "---------- GROQCLOUD  -------": {
		"price_in": "0.00",
		"price_out": "0.00",
	  },
	  "llama3-8b-8192": {
		"price_in": "5.00",
		"price_out": "10.00",
	  },
	  "llama3-70b-8192": {
		"price_in": "5.00",
		"price_out": "10.00",
	  },
	   "mixtral-8x7b-32768": {
		"price_in": "0.00",
		"price_out": "0.00",
	  },
	   "gemma-7b-it": {
		"price_in": "0.00",
		"price_out": "0.00",
	  }
		
	}
	
	function getSttPrice(seconds) {
		return (0.006/60) * parseInt(seconds)
	}
	
	function getTtsPrice(characters) {
		return parseInt(characters)/1000000 * 15
	}
	
	function getLlmPrice(model, tokens_in, tokens_out) {
		let price_in = 0
		let price_out = 0
		let total = 0
		if (pricing && pricing[model] && (pricing[model].price_in > 0 || pricing[model].price_out > 0)) {
			price_in = parseFloat(pricing[model].price_in) * tokens_in / 1000000
			price_out = parseFloat(pricing[model].price_out) * tokens_out / 1000000
			total += (price_in + price_out)
		}
		return {price_in, price_out, total}
	}
	
	const [totals, setTotals] = useState({})
	
	function collated(start=null, end=null) {
		//console.log("collate", start, end)
		//let startTime = start ? new Date(start).now() : null
		//let endTime = end ? new Date(end).now() : null
		////let startTime = new Date(start)
		////let endTime  = new Date(start)
		if (start) start.setUTCHours(0,0,0,0);
		if (end) end.setUTCHours(23,59,59,999);
		let startTime = start ? start.valueOf() : 0
		let endTime = end ? end.valueOf() : 0
		//console.log("collatesss", startTime, endTime) //typeof start, typeof  end, start, end,	
		let collated = {}
		let tallies = {}
		let grandTotals = {}
		
		if (Array.isArray(logs.openai_log)) {
			logs.openai_log.forEach(function(logEntry) {
				let key = (logEntry.url ? logEntry.url : 'https://api.openai.com') + (logEntry.key ? ":::::" + logEntry.key : '')
				if (logEntry && logEntry.model && pricing[logEntry.model] && (logEntry.tokens_in > 0 ||logEntry.tokens_out > 0 )) {
					let logDate = new Date(logEntry.date).valueOf()
					//console.log('LOG', new Date(logEntry.date).toUTCString() , 'START',start.toUTCString(), 'END',end.toUTCString(), logDate, startTime, endTime, (logDate - startTime)/86400, (endTime - logDate)/86400)
					if ((end === null || logDate <= endTime) && (start === null || logDate >= startTime)) {
						if (!collated.hasOwnProperty(key)) collated[key] = []
						if (!tallies.hasOwnProperty(key)) tallies[key] = []
						let price_in = parseFloat(pricing[logEntry.model].price_in) * logEntry.tokens_in / 1000000
						let price_out = parseFloat(pricing[logEntry.model].price_out) * logEntry.tokens_out / 1000000
						if (price_in === NaN) price_in = 0
						if (price_out === NaN) price_out = 0
						collated[key].push({date: logEntry.date, tokens_in: (logEntry.tokens_in > 0 ? logEntry.tokens_in : 0), tokens_out: (logEntry.tokens_out > 0 ? logEntry.tokens_out : 0), price_in, price_out})
						grandTotals.tokens_in = (grandTotals.tokens_in > 0 ? grandTotals.tokens_in : 0) + (logEntry.tokens_in > 0 ? logEntry.tokens_in : 0)
						grandTotals.tokens_out = (grandTotals.tokens_out > 0 ? grandTotals.tokens_out : 0) + (logEntry.tokens_out > 0 ? logEntry.tokens_out : 0)
						grandTotals.price_in = (grandTotals.price_in > 0 ? grandTotals.price_in : 0) + (logEntry.price_in > 0 ? logEntry.price_in : 0)
						grandTotals.price_out = (grandTotals.price_out > 0 ? grandTotals.price_out : 0) + (logEntry.price_out > 0 ? logEntry.price_out : 0)
						
						tallies[key].tokens_in = (tallies[key].tokens_in > 0 ? tallies[key].tokens_in : 0) + (logEntry.tokens_in > 0 ? logEntry.tokens_in : 0)
						tallies[key].tokens_out = (tallies[key].tokens_out > 0 ? tallies[key].tokens_out : 0) + (logEntry.tokens_out > 0 ? logEntry.tokens_out : 0)
						tallies[key].price_in = (tallies[key].price_in > 0 ? tallies[key].price_in : 0) + (logEntry.price_in > 0 ? logEntry.price_in : 0)
						tallies[key].price_out = (tallies[key].price_out > 0 ? tallies[key].price_out : 0) + (logEntry.price_out > 0 ? logEntry.price_out : 0)
					}
				}
			})
		}
		return {logs: collated, grandTotals, tallies}
	}
	
	function getTotal() {
		let total = 0
		try {
			let logEntries = JSON.parse(localStorage.getItem("openai_log"))
			//console.log(logEntries)
			logEntries.map(function(logEntry) {
				if (logEntry && logEntry.model && pricing[logEntry.model] && (logEntry.tokens_in > 0 ||logEntry.tokens_out > 0 )) {
					total += parseFloat(pricing[logEntry.model].price_in) * logEntry.tokens_in / 1000000
					total += parseFloat(pricing[logEntry.model].price_out) * logEntry.tokens_out / 1000000
					//console.log("add",total,pricing[logEntry.model].price_in ,logEntry.tokens_in, pricing[logEntry.model].price_out,logEntry.tokens_out)
				}
			})
		} catch (e) {}
		try {
			let logEntries = JSON.parse(localStorage.getItem("openai_log_stt"))
			//console.log(logEntries)
			logEntries.map(function(logEntry) {
				if (logEntry && logEntry.model && logEntry.seconds > 0) {
					total += getSttPrice(logEntry.seconds)
					//console.log("add stt",total,getSttPrice(logEntry.seconds))
				}
			})
		} catch (e) {}
		try {
			let logEntries = JSON.parse(localStorage.getItem("openai_log"))
			//console.log(logEntries)
			logEntries.map(function(logEntry) {
				if (logEntry && logEntry.model && logEntry.letters > 0) {
					total += getTtsPrice(logEntry.letters)
					//console.log("add tts",total,getTtsPrice(logEntry.seconds))
				}
			})
		} catch (e) {}
		return total.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD'
		  });
	}
	
	function log({tokens_in, tokens_out, model, key, url}) {
		//console.log("LOG",tokens_in, tokens_out, model, key)
		let logEntries
		try {
			logEntries = JSON.parse(localStorage.getItem("openai_log"))
		} catch (e) {
			
		}
		if (!Array.isArray(logEntries))  {
			logEntries = []
		}
		logEntries.push({id: utils.generateRandomId(), date: new Date(), tokens_in, tokens_out, model, key, url})
		logs.openai_log = logEntries
		setLogs(logs)
		//console.log("LOG llm",tokens_in, tokens_out, model)
		//localStorage.setItem("openai_log",JSON.stringify(logEntries))
	}
	
	function logSTT({seconds, model, key}) {
		let logEntries
		try {
			logEntries = JSON.parse(localStorage.getItem("openai_log_stt"))
		} catch (e) {
			
		}
		if (!Array.isArray(logEntries))  {
			logEntries = []
		}
		logEntries.push({id: utils.generateRandomId(), date: new Date(), seconds:  Math.round(seconds), model, key})
		//console.log("LOG stt",{seconds, model, key})
		//localStorage.setItem("openai_log_stt",JSON.stringify(logEntries))
		logs.openai_log_stt = logEntries
		setLogs(logs)
	}
	
	function logTTS({letters, model, key}) {
		let logEntries
		try {
			logEntries = JSON.parse(localStorage.getItem("openai_log_tts"))
		} catch (e) {
			
		}
		if (!Array.isArray(logEntries))  {
			logEntries = []
		}
		logEntries.push({id: utils.generateRandomId(), date: new Date(), letters, model, key})
		//console.log("LOG tts",{letters, model, key})
		//localStorage.setItem("openai_log_tts",JSON.stringify(logEntries))
		logs.openai_log_tts = logEntries
		setLogs(logs)
	}
	
	return {pricing, totals, log, getTotal, logSTT, logTTS, logs, setLogs, collated, getLlmPrice}
}

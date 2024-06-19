// requires config.tavilyKey and config.tavilyUrl and controller (for stopping web request)
export default function ({config, token, creditBalance, abortController}) {
	// console.log("websearch", config, token, creditBalance)
	async function tavilySearch(query, maxResults = 5)  {
		if (config) {
			// url and headers can be 
			// - all provided in config (optionally with proxy url and key)
			// - local websearch proxy (if logged in and credit > 0)

			let url =  ''
			let headers = {'Content-Type': 'application/json'}
			if (config && config.tools && config.tools.tavily_url) {
				url = config.tools.tavily_url
				headers['authorization'] = 'Bearer ' +  config.tools.tavily_key 
				if (config && config.tools && config.tools.cors_url) {
					url = config.tools.cors_url
					if (config && config.tools && config.tools.cors_key) {
						headers['x-cors-api-key'] = (config && config.tools && config.tools.cors_key ? config.tools.cors_key : '')
					}
				}
			} else if (creditBalance > 0 && token && token.access_token) {
				url = import.meta.env.VITE_API_URL + '/websearch'
				headers['authorization'] = 'Bearer ' +  token.access_token 
			}
			console.log(url,headers)
			if (url) {} 
				let response = await fetch(url, {
					signal: abortController.current ? abortController.current.signal : null,
					method: 'POST',
					headers: headers,
					body: JSON.stringify({
					"api_key": (config && config.tools && config.tools.tavily_key ? config.tools.tavily_key : ''),
					"query": query,
					"search_depth": "basic",
					"include_answer": true,
					"include_images": false,
					"include_raw_content": true,
					"max_results": maxResults,
					"include_domains": [],
					"exclude_domains": []
					})
				})
				return response.json()
		} else {
			return {error:'No access'}
		}
		return ''
	}
	function websearch_tavily(message) {
		console.log("START SEARCH", config)
		return new Promise(function(resolve,reject) {
			//console.log(config, config.tools.tavily_key)
			// if (!config.tools || !config.tools.tavily_key) {
			// 	resolve("A key is required to access the tavily web search API. Check your tools configuration.")
			// }
			tavilySearch(message, 5).then(function(results1) {
				try {
					let results = JSON.parse(results1)
					console.log("TTRES",results)
					if (results && results.detail && results.detail.error) {
						return reject(results.detail.error)
					}
					if (results && results.detail && results.detail.error) {
						return reject(results.detail.error)
					}
					let final = [results && results.answer ? results.answer : (results && Array.isArray(results.results) ? results.results.map(function(r) {return r.content}).join("\n") : '')]
					return resolve(final.join("\n"))
				} catch (e) {
					console.log(e)
					reject(String(e))}
					// resolve('')
			}).catch(function(e) {
					console.log(e)
					reject("Failed web search, check your configuration and/or try again later.")
			})
		})
	}



	return {websearch_tavily}
}





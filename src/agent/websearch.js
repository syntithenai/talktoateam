// requires config.tavilyKey and config.tavilyUrl and controller (for stopping web request)
export default function (config) {
	//console.log("websearch", config)
	async function tavilySearch(query, maxResults = 5)  {
		if (config) {
			let url =  (import.meta.env.VITE_API_URL + '/websearch')
			let response = await fetch(url, {
				//signal: config.controller ? config.controller.signal : null,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					 'x-cors-api-key': (config && config.tools && config.tools.cors_key ? config.tools.cors_key : '')
				},
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
		}
		return ''
	}
	function websearch_tavily(message) {
		//console.log("START SEARCH", config, config.tools.tavilyKey)
		return new Promise(function(resolve,reject) {
			//console.log(config, config.tools.tavily_key)
			// if (!config.tools || !config.tools.tavily_key) {
			// 	resolve("A key is required to access the tavily web search API. Check your tools configuration.")
			// }
			tavilySearch(message, 5, config.controller ? config.controller.signal : null).then(function(results) {
				try {
					//console.log("TTRES",results)
					//let results = JSON.parse(tresults)
					let final = [results && results.answer ? results.answer : (results && Array.isArray(results.results) ? results.results.map(function(r) {return r.content}).join("\n") : '')]
					return resolve(final.join("\n"))
				} catch (e) {resolve(String(e))}
				resolve('')
			}).catch(function(e) {
					resolve("Failed web search, check your configuration and/or try again later.")
			})
		})
	}



	return {websearch_tavily}
}





export default function({config, abortController}) {

  async function wikipedia_search(searchTerm) {
            const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&utf8=&format=json&origin=*`;
            let options =  {signal: abortController.current.signal}
            try {
                const response = await fetch(apiUrl, options);
                const data = await response.json();
				console.log("WIKISEARCH DATA",response,data)
                if (data.query.search.length > 0) {
				return "```" + "\n" + data.query.search.map(function(sr) {
					 return sr.title  
				   }).join("\n")  + "\n" + "```"
                    
                }
            } catch (error) {
                return error
            }
        }

        async function wikipedia_load_page(title) {
			const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(title)}&format=json&explaintext=true&origin=*`;
            let options =  {signal: abortController.current.signal}
            try {
                const response = await fetch(pageUrl, options);
                const data = await response.json();
                // console.log("DD",data)
				const key = Object.keys(data.query.pages).length > 0 ? Object.keys(data.query.pages)[0] : null
				const text = key ? data.query.pages[key].extract : ''
				return text
				
            } catch (error) {
                return error
            }
        }
        
        async function wikipedia_first_result(searchTerm) {
			let results = await wikipedia_search(searchTerm)
			console.log(results)
			if (results && results.slice) results =results.slice(3, results.length -3).trim()
			console.log(results)
			if (results && results.split("\n").length > 0) {
				return wikipedia_load_page(results.split("\n")[0])
			}
		}


	return {wikipedia_search, wikipedia_load_page, wikipedia_first_result}
}

export default function({config, abortController}) { 
	
        function thesession_settings_by_id(message) {
			return new Promise(function(resolve,reject) {
				let options =  {signal: abortController.current.signal}
				fetch("https://thesession.org/tunes/"+message+"?format=json", options).then(function(j) {
					j.json().then(function(h) {
						//console.log(h)
						let ires = []
						if (h && h.settings) {
							for (let k = 0; k < h.settings.length; k++) {
								let setting = h.settings[k]
								if (setting && setting.abc) {
									let res = '```abc' + "\n"
									res += "X:" + setting.id+ "\n"  
									res += "T:" + h.name+ "\n"  
									res += "C: \n"  
									res += "Z:" + (setting.name ? setting.name : '')+ "\n"  
									res += "R:" + (setting.type ? setting.type : '') + "\n"  
									res += "K:" + (setting.key ? setting.key : '') + "\n"
									res += setting.abc + "\n"
									res += "```"
									ires.push({content: res, log: {duration: 0, tokens_in:0,tokens_out:0}, name: 'Setting ' + (k + 1)})
								}
							}
						}
						resolve( ires)
					})
				})
				// .catch(function(e) {
				//    resolve('')
				// })
			})
		}
		
		function thesession_search_single(message) {
			return new Promise(function(resolve,reject) {
				let options =  {signal: abortController.current.signal}
				fetch("https://thesession.org/tunes/search?format=json&q=" + message,options).then(function(searchResults) {
					searchResults.json().then(function(sr) {
						if (sr && sr.tunes && sr.tunes[0] && sr.tunes[0].id) {
							fetch("https://thesession.org/tunes/"+sr.tunes[0].id+"?format=json").then(function(j) {
								j.json().then(function(h) {
									let res = '```abc' + "\n"
									if (h && h.settings && h.settings[0]) {
									res += "X:" + h.settings[0].id+ "\n"  
									res += "T:" + h.name+ "\n"  
									res += "C: \n"  
									res += "Z:" + (h && h.settings && h.settings[0] && h.settings[0].member && h.settings[0].member.name ? h.settings[0].member.name : '')+ "\n"  
									res += "R:" + (h && h.settings && h.settings[0] && h.settings[0].type ? h.settings[0].type : '') + "\n"  
									res += "K:" + (h && h.settings && h.settings[0] && h.settings[0].key ? h.settings[0].key : '')+ "\n"
									res += h.settings[0].abc+ "\n"
									}
									res += "```"
									resolve( res)
								})
							})
						} 
					})
				})
				// .catch(function(e) {
				// 	resolve('')
				// })	
			})
 
		}
        
        
        function thesession_search_list(message) {
			return new Promise(function(resolve,reject) {
				let options =  {signal: abortController.current.signal}
				fetch("https://thesession.org/tunes/search?format=json&q=" + message, options).then(function(searchResults) {
					searchResults.json().then(function(sr) {
						let res = sr.tunes.map(function(r) {
							 return r.id + ' ' + r.name
						}).join(`\n`)
						resolve( "```" + res + "```")
					})
				})
				// .catch(function(e) {
				//    resolve('')
				// })	
			})
		}
        	
	
	
	return {thesession_search_list, thesession_search_single, thesession_settings_by_id}
}

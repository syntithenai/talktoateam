const config = require('../config');
const  tavilySearch = require('../tavily');

test('tavily search', async () => {
   
	return tavilySearch(config.tavilyKey, 'why is the grass green',2).then(function(response) {
		console.log(response.results)
		 expect(response.results.length).toBeGreaterThan(0);
	})

})

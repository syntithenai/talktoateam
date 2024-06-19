// answer questions about the configuration

export default function useConfigManager({config, token}) {
	function codeRunnerEndpoint() {
		if ((config && config.tools && config.tools.piston_url)) {
			return config.tools.piston_url
		// } else if (token && token.access_token) {
		// 	return import.meta.env.VITE_API_URL + "/piston"
		} else {
			return "https://emkc.org/api/v2/piston"
		}
		
	}
	
	
	return {codeRunnerEndpoint}
}

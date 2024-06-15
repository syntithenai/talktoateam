// answer questions about the configuration

export default function useConfigManager({config}) {
	function codeRunnerEndpoint() {
		return "https://emkc.org"
		//"http://peppertrees.asuscomm.com:2000"
	}
	
	
	return {codeRunnerEndpoint}
}

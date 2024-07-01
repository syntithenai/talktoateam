import tools from "./agent/tools"

export default function useTools({runtimes, config, token, creditBalance, abortController, files, fileManager, onError}) {
	// console.log("USETOOLS",runtimes, config, token, creditBalance, abortController)
	window.tools = tools({runtimes, config, token, creditBalance, abortController, files, fileManager, onError})
	return window.tools
}

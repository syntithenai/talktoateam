import tools from "./agent/tools"

export default function useTools(runtimes, config, token, creditBalance, abortController) {
	// console.log("USETOOLS",runtimes, config, token, creditBalance, abortController)
	window.tools = tools({runtimes, config, token, creditBalance, abortController})
	return window.tools
}

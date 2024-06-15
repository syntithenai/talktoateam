import tools from "./agent/tools"

export default function useTools({runtimes, config}) {
	window.tools = tools({runtimes, config})
	return window.tools
}

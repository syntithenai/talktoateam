import mermaid from "mermaid";
import { useEffect, useRef , useState} from "react";
import useUtils from '../useUtils'
import React from "react";
import {Button} from 'react-bootstrap'

// THE DOM THAT MERMAID RENDERS INTO NEEDS TO BE STABLE OUTSIDE OF THIS COMPONENT
// Ensure that your HTML contains a div with ID matching the property elementId 
// eg <div id="mermaidrenderer_1" style={{position: 'fixed', top:-10000,left:-1000}} />

		

export default function MermaidViewer({count, chart, forceRefresh, elementId, submitForm, icons}) {
	const [error, setError] = useState('')
	const svg = useRef('')
	function setSvg(s) {svg.current = s}
	const utils = useUtils()
	const id = useRef() 
	
	async function buildChart() {
		return new Promise(function(resolve,reject) {
			if (chart) {
				try {
					//const type = mermaid.detectType(chart);
					//console.log("CHART TYPE"); // 'sequence'
					mermaid.parse(chart).catch(function(e) {
						//console.log("UPD parse ERR 1",e)  
						setError(e.message)		  
						setSvg(null)
						resolve()
					}).then(function() {
						//console.log("CHART TYPE parsed")
						mermaid.render(elementId, chart).then(function(data) {
							setSvg(data.svg)
							setError(null)
							//console.log("CHART TYPE rendered")
							forceRefresh()
							resolve()
						}).catch(function(e) {
							//console.log("UPD ERR",e)  
							setError(e.message)		  
							setSvg(null)
							resolve()
						})
					})
				} catch (e) {
					//console.log("UPD parse ERR",e)  
					setError(e.message)		  
					setSvg(null)
					resolve()
				}
			} else {
				resolve()
			} 
		})
	}
	
	
	
	// init
	useEffect(function() {
		
		setError(null)
		mermaid.initialize({
		  startOnLoad: false,
		});
		buildChart()
	}, [])
	
	// chart change
	useEffect(function() {
		buildChart()
	}, [chart])
				
  return <>
  {count}
		{error && <div style={{color:'red'}}  className='error' >
			<pre style={{color:'red'}} >{error}</pre>
		 <pre>{chart}</pre></div>}
		<div dangerouslySetInnerHTML={{ __html: svg.current }} ></div>
	</>
  
}
//<Button style={{float:'right'}} variant="warning" onClick={function() {submitForm(error)}} >{icons.hammer}</Button>

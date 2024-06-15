import React, { useEffect, useState, useRef } from "react";
import abcjs from "abcjs";
import {Link} from 'react-router-dom'
import {Button , Modal} from 'react-bootstrap'



export default function CodeViewer({pistonCodeRunnerEndpoint, language, code, icons, runtimes, submitForm}) {
    
    //function updateOnChange() {
          //renderCode(language, code)
    //}


    //// when abc changes, do a full update
    //useEffect(() => {
          //return updateOnChange()
    //}, [code, language])
    
    const [error, setError] = useState('')
    const [response, setResponse] = useState('')
    const [isWaiting, setIsWaiting] = useState(false)
    
    function startWaiting() {
		setIsWaiting(true)
	}
	
    function stopWaiting() {
		setIsWaiting(false)
	}
    
   ///api/v2/runtimes

  
	function runCode(language, code) {
		console.log("RUIN",language, code)
		
		let found = false
		if (runtimes && Array.isArray(runtimes)) {
			runtimes.forEach(function(r) {
				if (r.language === language || (Array.isArray(r.aliases) && r.aliases.indexOf(language) !== -1)) {
					found = r
				}
				
			})
		}
		if (found) {
			let formData = {
				"language": found.language,
				"version": found.version,
				"files": [
					{
						"name": "sample code",
						"content": code
					}
				],
				"stdin": "",
				"args": [],
				"compile_timeout": 10000,
				"run_timeout": 3000,
				"compile_memory_limit": -1,
				"run_memory_limit": -1
			}
			
			setError('')
			try {
				startWaiting()
				fetch(pistonCodeRunnerEndpoint + '/api/v2/piston/execute', {
					method: 'POST',
					headers: {
						//'Authorization': 'Bearer '+key,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData),
				}).then(function(response) {
					console.log("ai response",response)
					response.json().then(function(t) {
						console.log("CODE RESPONSE",t)
						if (t && t.compile && t.compile.stderr) {
							setError(t.compile.stderr)
						} else if (t && t.run && t.run.stderr) {
							setError(t.run.stderr)
						} 
						 
						if (t && t.run && t.run.stdout) {
							setResponse(t.run.stdout)
						}  else {
							setResponse("No response")
						}
						stopWaiting()
					})
				})
			} catch (error) {
				console.error('Speech generateion error:', error);
			}
		}
	}
 
     return (
      <div style={{position:'relative'}} >
			
			<pre style={{border:'1px dashed green', padding:'0.3em'}} >
				<Button style={{marginLeft:'0.3em',float:'right'}}  onClick={function() {navigator.clipboard.writeText(code)}} >{icons['filecopy']}</Button>
				<Button variant="success" style={{marginLeft:'0.3em',float:'right'}}  onClick={function() {runCode(language, code)}} >{icons['play']}</Button>
				
				{code}
				</pre>
				{error && <pre style={{border:'1px solid grey' ,color:'red'}} >{error}</pre>}
				{response && <pre >{response}</pre>}
				{isWaiting && <b><img style={{height:'6em'}} src="/spinner.svg" /></b>}
	  </div>
	);
    
}

//{error && <Button style={{float:'right'}} variant="warning" onClick={function() {submitForm(error)}} >{icons.hammer}</Button>}

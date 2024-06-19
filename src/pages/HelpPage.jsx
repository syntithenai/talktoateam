import {React, useEffect, useState} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import MarkdownViewer from '../components/MarkdownViewer'
import MermaidViewer from '../components/MermaidViewer'
import {split} from 'sentence-splitter'

function onLoggedIn(d) {
    console.log("logged ",d)

}

// import useEmbeddingsWorker from '../useEmbeddingsWorker'
export default function HelpPage({creditBalance, refreshHash, icons,token, logout, user,login, config, utils, aiUsage , forceRefresh}) {
	const {openAiBillable} = utils.summariseConfig(config)
	let paraStyle={marginTop:'0.5em'}

   

// 	const aiWorker = useEmbeddingsWorker({workerUrl: './embeddings_worker.js',
        
//         onComplete: function(a) {
//             console.log("COMP",a,"dddd")
//         },
//         onUpdate: function(a) {
//             console.log("UPDATE",a,"dddd")
//         }
//         ,
//         onReady: function() {
//             console.log("READY")
//         }
//         ,
//         onProgress: function(a) {
//             console.log("PROGRESS",a,"dddd")
//         }
//     })
//     async function testme() {

//         let c = await aiWorker.run("this is a test")
//         console.log("testres",c)

//     }
// // 
	return (<div className="App" style={{textAlign:'left', marginLeft:'0.3em'}} id={refreshHash} >
			<div id="menu" style={{zIndex:'9', backgroundColor:'lightgrey', border:'1px solid grey', position: 'fixed', top: 0, left: 0, width: '100%', height:'3em'}}  >
     
				<span style={{float:'left',marginTop:'0.2em',marginLeft:'0.2em'}} >
					<Link style={{marginLeft:'0.1em'}} to="/menu"><Button>{icons.menu}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/chat"><Button>{icons.chat}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/roles"><Button >{icons.teamlarge}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/settings"><Button >{icons.settings}</Button></Link>
					<Link style={{marginLeft:'0.2em'}} to="/help"><Button >{icons.question}</Button></Link>
				</span>
				
				{import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && <span style={{float:'right',marginTop:'0.3em',marginLeft:'0.2em',marginRight:'01em'}} >	
				{(token && token.access_token) && <Button onClick={function() { logout()}} variant="danger" >{!(user && user.picture) && icons["user_logout"]} {(user && user.picture) && <img height="28" width="28" src={user.picture + '?access_token='+token.access_token + '&not-from-cache-please'} />}</Button>}
				
				{!(token && token.access_token) && <Button onClick={function() { login()}} variant="success" >{icons["user"]}</Button>}
				</span>}
				{<Link to="/tokens" ><span style={{color:'black', float:'right', marginTop:'0.7em',marginRight:'1em'}}> <b>${creditBalance > 0 && token && token.access_token  ? parseFloat(creditBalance).toFixed(2) : 0}</b>
				</span></Link>}
			</div>
			
			<div id="body" style={{paddingLeft:'0.3em',paddingRight:'0.3em',textAlign:'left', zIndex:'3',position: 'relative', top: '3em', left: 0, width: '100%',  paddingTop:'0.2em', backgroundColor:'white'}}  >
							<h3>Help</h3>
                      

    <h2>Overview</h2>
    
   
    <p><i>TalkToATeam</i> is a web application supporting the use of agentic workflows with language models.</p>
    <p>It is essentially a chat user interface to talk to language models.</p>
    <p>By providing language models more context in the form of descriptive system prompts, responses can be made much more relevant. Management and application of Personas is provided to this end.</p>
    <p>By chaining requests to language models and tools, complex flows of information and workflows can be built. Management and application of Teams is provided to this end.</p>
    <p>The software provides for multiple data sources to be injected into prompt workflows including.</p>
    <ul>
        <li>Text and PDF files</li>
        <li>Web Search</li>
        <li>Google Documents</li>
        <li>Google Email</li>
        <li>Local Files Database</li>
        <li>Wikipedia</li>
        <li>TheSession.org tunes database</li>
    </ul>

    <p>This software provides many of the features of Langchain, the dominant solution for chained workflows with language models.</p>
    <p>The software supports tool use and comes with tools for web search and code execution. The injection of recent hard data into the messages we send to language models significantly improves their truthfulness.</p>


    <p>The software includes a File Manager that generates vector embeddings to be used with an integrated Retrieval Augmented Generation(RAG) system.</p>


    <h2>UI Overview</h2>
    <p>At the heart of the software is a chat interface. Most language models are trained on histories of conversations. Language models usually understand "chat history" well.</p>
    
    <h3>Menu Bar</h3>
    <p>The three lines in the top left take the user to the list of chats that have been saved. It also opens additional menu items not available on the chat page including (left to right), the current chat session, admin of personas and teams, settings, and help.</p>

    <h3>Chat Interface</h3>
    <p>Message input and send buttons plus a paperclip button to load a file as the user message.</p>
    <p>In the menu bar "New Chat" button.</p>
    <p>Assistant selector including:</p>
    <ul>
        <li>Pencil to edit current assistant</li>
        <li>Button with name that opens the assistant selector</li>
        <li>Button with examples showing how to use the assistant</li>
    </ul>
    <p>Edit, copy buttons per content section. It team flows shown in Accordion, edit and copy buttons per section.</p>
    <p>Revert history (user messages only) will delete all chat history after this point and load the user message into the form for editing and resubmission.</p>
    <p>Costs and duration are shown for assistant responses.</p>

    <h3>Chat History</h3>
    <p>Search filter at top of page.</p>
    <p>List showing previous conversations with copy and delete buttons.</p>
    <p>New chat button.</p>
    <p>Clear all chat history button.</p>

    <h2>Personas</h2>
    <p>A persona is a collection of properties that define how a model should respond. In particular, a persona has form fields to edit:</p>
    <ul>
        <li>Name, category (admin)</li>
        <li>Instructions, skills, backstory (used for system prompt)</li>
        <li>Model settings including temperature and top_k</li>
        <li>Output limits including stop tokens, maximum tokens</li>
        <li>Output format limits - require JSON, choice, or number. Provide JSON/choice examples. Provide JSON schema (Generate schema from samples button)</li>
        <li>Voice (for text to speech)</li>
        <li>Samples (example messages to clarify how to use the persona)</li>
    </ul>
    <p>A persona can have the type "inference" in which case it uses language models to generate responses. A persona can also have the type "algorithmic" in which case it executes the code inside the editable function block to generate a response.</p>
    <p>The output format wrap as field allows the addition of text before and after the generated content. This can be useful to trigger a renderer (more below). The output wrapping is applied before tool use so it can also be useful in ensuring the correct wrapping to trigger tools use.</p>
    <p>It is possible to select a preferred model size. This allows the use of the fastest most cost-effective model for the task. This field is used to determine the best model to call when using this persona. The configuration will determine the actual available models. <strong>!!!This feature is not implemented at this time.</strong></p>

    <h2>Teams</h2>
    <p>Teams enable flows of information between personas to generate a final output. Personas can be attached to teams as members or in a number of specialist roles. A team has a type that defines how the flow of information runs between the Personas associated with the team.</p>
    <p>Types include:</p>
    <ul>
        <li>Linear</li>
        <li>Linear collated</li>
        <li>Parallel</li>
        <li>Mixture of experts</li>
        <li>Role based</li>
        <li>Generator</li>
    </ul>
    <p>A linear team passes the question to each team member in turn, taking the result from the previous step and passing it along with the message to the next team member.</p>
    <MermaidViewer forceRefresh={forceRefresh} elementId={"mermaidrenderer_" + 1} chart={`flowchart LR
 IN --> A[Member 1] -->|member 1 data|B[Member 2] -->|member 2 data| C[Member 3] -->|member 3 data| Formatter -->OUT`} />
	
	<p>A linear collated team passes the results of all previous member personas to the next team member.</p>
    <MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 2} chart={`flowchart LR
 IN --> A[Member 1] -->|member 2 data| B[Member 2] --> |member 1 and 2 data|C[Member 3] --> |member 1 and 2 and 3 data|Formatter -->OUT`} />
 
	<p>A parallel team passes the question to all the experts at the same time and collates and returns the results from each team member's response to the message.</p>
    <MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 3} chart={`flowchart LR
 IN --> A[Member 1]
 A --> Formatter 
 IN -->  B[Member 2] 
 B  --> Formatter
 IN -->  C[Member 3]
 C --> Formatter
 Formatter --> OUT`} />
 
	<p>A mixture of experts (MOE) team starts by running a chooser persona to choose one or many expert personas to run in parallel. The default chooser uses the skill field of a persona to find the best responder to the message. It is also possible to use an arbitrary persona as the MOE chooser.</p>
    <MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 4} chart={`flowchart LR
 IN --> Chooser[Expert Selector] --> A[Member 1] --> Formatter --> OUT 
 IN --> Chooser -->  C[Member 3] --> Formatter --> OUT`}/>
    
    
    <p>In a role-based team, a fixed (but largely optional) cast of personas is used to implement a looping structure. First, a Blocker Persona is run and if it responds with FAIL, everything stops and the team responds with empty text. Then a Feeder Persona is run to populate the message context with data from an external source. Next, a Chain Of Thought Planner Persona is given the message and external context data and asked for a plan to respond to the message. Now we start looping around refining the response. The Planner (or Feeder if no planner) response and the original message are passed in turn to a Generator for an initial response. A generator is a required member of the team. The Generator response is fed to the Reducer to compress/summarize the response and finally to the Scorer. If the scorer does not respond with FAIL, the compressed response is fed to a final Formatter and returned. If the scorer does respond with FAIL, the responses from the Feeder, Planner, Generator, and Reducer are fed to a Rewriter and then back to the start of the loop to the Generator.</p>
    <MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 6} chart={`flowchart LR
 IN --> Blocker
 Blocker --> Feeder
 Blocker --> OUT
 Feeder --> ct[Chain Of Thought Planner]
 ct  --> Generator 
 Generator --> tr[Text Reducer ]
 tr --> Scorer 
 Scorer --> Formatter 
 Formatter --> OUT 
 Scorer --> Rewriter 
 Rewriter -->  Generator
 `} />
  
    
    <p>A generator team starts by running a generator persona to expand the initial message. An example might be a generator that generates questions related to the original message. For each of the generated options, each team member is called in parallel. Being multiplicative this can lead to high token use or even rate limit restrictions. Be sure to keep the value for maximum iterations and the number of team members reasonable or your query will fail.</p>
<MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 5} chart={`flowchart LR
 IN --> Generator[Question Generator] -->|Generated Question 1| A[Member 1] --> tr[Text Reducer] --> Formatter --> OUT 
 Generator -->|Generated Question 1| B[Member 2] --> tr --> Formatter
 Generator -->|Generated Question 2| A[Member 1] --> tr --> Formatter
 Generator -->|Generated Question 2| B[Member 2] --> tr --> Formatter`} />
    <h4>Formatter Role</h4>
    <p>Many of the team types also support a Formatter Persona which is given all the team results for manipulation before returning a response to the user.</p>

    <h4>Nested Team Execution</h4>
    <p>Team members and many of the role-based associations allow for the selection of a team instead of a persona. This opens the possibility for complex flows of information between highly capable and reusable teams.</p>

    <h4>Team Compression</h4>
    <p>A team can be compressed into a single query to a language model to save tokens and time. The user message is extended to ask the model to respond as each of the Personas and a list of Personas is provided with the prompt. This only applies to linear, parallel, and mixture of expert types.</p>

	
	
     
 `
     
    
 
    
   
    <h2>Renderers</h2>
    <p>The software supports special rendering for various formats of information including music notation, graphs, and markdown content. Renderers are triggered by ensuring the response content is wrapped in <code>```formattype stuff here ```</code></p>
    <p>Valid format types include:</p>
    <ul>
        <li>abc (music notation)</li>
        <li>mermaid (graph)</li>
        <li>markdown</li>
        <li>code - javascript, python</li>
    </ul>
    <p>Any text inside <code>```</code> that does not match a valid format will be rendered in a preformatted box.</p>

    <h2>Tool Use</h2>
    <p>Tool use is triggered by ensuring the response content is wrapped in <code>```tool and ```</code>. For example:</p>
    <pre><code>```tool   
google_search(they might be giants)  
```</code></pre>
    <p>The output wrap settings can be useful here to ensure the correct wrapping before the tool is called. Alternatively, you can ask the model to intersperse wrapped tool calls with other text; however, it may take some reinforcement in the instructions field to ensure the formatting.</p>
    <p>Tool calls are executed on every call to a language model, and the tool call is appended to the document immediately after the tool call trigger text.</p>

    <h2>RAG Document Store</h2>
    <p>Documents can be ...</p>

    <h2>Configuration</h2>
    <p>The application supports any LLM host provider compatible with OpenAI.</p>

    <h3>Language Model</h3>
    <h3>Speech To Text</h3>
    <h3>Text To Speech</h3>
    <h3>Tools</h3>

							
							
							
							
			</div>
			
			<div style={{position: 'fixed', bottom: 0, right:0, backgroundColor: 'white', height: '3em', width:'3em'}} >
				<a target='new' href="https://github.com/syntithenai/syntithenai_agents" style={{color:'black'}}  >{icons["github"]}</a>
			</div> 
	</div>)
}

	

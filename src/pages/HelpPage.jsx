import {React, useEffect, useState} from 'react'
import {Button, Tabs, Tab} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import MarkdownViewer from '../components/MarkdownViewer'
import MermaidViewer from '../components/MermaidViewer'
import {split} from 'sentence-splitter'
import Menu from '../components/Menu'
import Footer from '../components/Footer';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
    

function onLoggedIn(d) {
    console.log("logged ",d)

}

// import useEmbeddingsWorker from '../useEmbeddingsWorker'
export default function HelpPage({isOnlineRef, allowRestart, onCancel, onTranscript, onPartialTranscript, bodyStyle, exchangeRate, setExchangeRate,updateExchangeRate, modelSelector, creditBalance, updateCreditBalance, teamLlm, chatHistoryRoles, setChatHistoryRoles,chatHistoryTeams, setChatHistoryTeams,  user, token, login, logout, refresh, doSave, aiUsage, submitForm, stopAllPlaying, stopLanguageModels, aiLlm, usingOpenAiTts, usingSelfHostedTts, usingWebSpeechTts, usingMeSpeakTts, usingTts, usingStt, usingOpenAiStt, usingSelfHostedStt, usingLocalStt, queueSpeech, getUrl, playDataUri, stopPlaying,isPlaying,setIsPlaying, isMuted, isMutedRef, mute, unmute, deleteRole, exportRoles,importRoles,init, roles, setRoles, currentRole, setCurrentRole, newRole, utteranceQueue, setUtteranceQueue, mergeData, setMergeData, lastLlmTrigger, autoStartMicrophone, setAutoStartMicrophone, autoStopMicrophone, setAutoStopMicrophone, refreshHash, setRefreshHash, forceRefresh, hasRequiredConfig, isSpeaking, setIsSpeaking, isWaiting, startWaiting, stopWaiting, userMessage, userMessageRef, setUserMessage, isReady, setIsReady, config, setConfig, llmEnabled, setLlmEnabled, icons, configRef, utils, newChat, addUserMessage, addAssistantMessage, setLastAssistantMessage, setLastUserMessage, getLastUserMessage, chatHistoryId,chatHistoryIdRef, setChatHistoryId, chatHistories, setChatHistories, currentChatHistory, revertChatHistory, deleteChatHistory, playSpeech, duplicateChatHistory, configIn, chatHistoriesRef, getLastAssistantChatIndex, getLastAssistantMessage, categories, setCategories, teams, setTeams, currentTeam, setCurrentTeam, currentTeamRef, deleteTeam, configManager, runtimes, duplicateRole, accordionSelectedKey, setAccordionSelectedKey, categoryFilter, setCategoryFilter, fileManager, files, exportDocument, availableModels}) {
	const {openAiBillable} = utils.summariseConfig(config)
	let paraStyle={marginTop:'0.5em'}
    let params = useParams()
    let [activeTab , setActiveTab] = useState(params.section)
    
    useEffect(function() {
        setActiveTab(params.section)
    },[params.section])
    
    

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
			
            <Menu {...{isOnlineRef,bodyStyle, creditBalance, refreshHash, token, logout, user,login, utils, usingStt, usingTts, isSpeaking, isMuted, mute, stopAllPlaying, icons, unmute, stopPlaying, lastLlmTrigger, config, aiUsage, forceRefresh, autoStartMicrophone, setAutoStartMicrophone, isPlaying, allowRestart, isWaiting, startWaiting, stopWaiting, onCancel, isReady, setIsReady, onTranscript, onPartialTranscript, setUserMessage}} />
			
			<div id="body" style={bodyStyle}  >
							<h3>Help</h3>
                      
    <Tabs
		  activeKey={activeTab}
          onSelect={function(e) {setActiveTab(e)}}
		  id="uncontrolled-tab-example"
		  className="mb-3"
		>
		<Tab eventKey="overview" title="Overview">
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

            <p>The software supports tool use and comes with tools for web search and code execution. The injection of recent hard data into the messages we send to language models significantly improves their truthfulness.</p>


            <p>The software includes a File Manager that generates vector embeddings to be used with an integrated Retrieval Augmented Generation(RAG) system.</p>

        </Tab>
       
        <Tab eventKey="personas" title="Personas">
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
            <p>It is possible to select a preferred model size. This allows the use of the fastest most cost-effective model for the task. This field is used to determine the best model to call when using this persona. The configuration will determine the actual available models.</p>

        </Tab>
        <Tab eventKey="teams" title="Teams">
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
    <img src="/teams/linear.png" style={{width:'100%'}} />
    
	<p>A linear collated team passes the results of all previous member personas to the next team member.</p>
    <img src="/teams/linearcollated.png" style={{width:'100%'}} />
   
	<p>A parallel team passes the question to all the experts at the same time and collates and returns the results from each team member's response to the message.</p>
    <img src="/teams/parallel.png" style={{width:'40%'}} />
   
 
	<p>A mixture of experts (MOE) team starts by running a chooser persona to choose one or many expert personas to run in parallel. The default chooser uses the skill field of a persona to find the best responder to the message. It is also possible to use an arbitrary persona as the MOE chooser.</p>
    <img src="/teams/experts.png" style={{width:'60%'}} />
   
    
    <p>In a role-based team, a fixed (but largely optional) cast of personas is used to implement a looping structure. First, a Blocker Persona is run and if it responds with FAIL, everything stops and the team responds with empty text. Then a Feeder Persona is run to populate the message context with data from an external source. Next, a Chain Of Thought Planner Persona is given the message and external context data and asked for a plan to respond to the message. Now we start looping around refining the response. The Planner (or Feeder if no planner) response and the original message are passed in turn to a Generator for an initial response. A generator is a required member of the team. The Generator response is fed to the Reducer to compress/summarize the response and finally to the Scorer. If the scorer does not respond with FAIL, the compressed response is fed to a final Formatter and returned. If the scorer does respond with FAIL, the responses from the Feeder, Planner, Generator, and Reducer are fed to a Rewriter and then back to the start of the loop to the Generator.</p>
    <img src="/teams/roles_based.png" style={{width:'100%'}} />
    
  
    
    <p>A generator team starts by running a generator persona to expand the initial message. An example might be a generator that generates questions related to the original message. For each of the generated options, each team member is called in parallel. Being multiplicative this can lead to high token use or even rate limit restrictions. Be sure to keep the value for maximum iterations and the number of team members reasonable or your query will fail.</p>
    <img src="/teams/generator.png" style={{width:'100%'}} />

    <h4>Formatter Role</h4>
    <p>Many of the team types also support a Formatter Persona which is given all the team results for manipulation before returning a response to the user.</p>

    <h4>Nested Team Execution</h4>
    <p>Team members and many of the role-based associations allow for the selection of a team instead of a persona. This opens the possibility for complex flows of information between highly capable and reusable teams.</p>

    <h4>Team Compression</h4>
    <p>A team can be compressed into a single query to a language model to save tokens and time. The user message is extended to ask the model to respond as each of the Personas and a list of Personas is provided with the prompt. This only applies to linear, parallel, and mixture of expert types.</p>

	
	
        </Tab>
        <Tab eventKey="renderers" title="Renderers">
            <p>The software supports special rendering for various formats of information including music notation, graphs, and markdown content. Renderers are triggered by ensuring the response content is wrapped in <code>```formattype stuff here ```</code></p>
            <p>Valid format types include:</p>
            <ul>
                <li>abc (music notation)</li>
                <li>mermaid (graph)</li>
                <li>markdown</li>
                <li>code - javascript, python</li>
            </ul>
            <p>Any text inside <code>```</code> that does not match a valid format will be rendered in a preformatted box.</p>
        </Tab>
        <Tab eventKey="tools" title="Tools">
         <p>Tool use is triggered by ensuring the response content is wrapped in <code>```tool and ```</code>. For example:</p>
            <pre><code>```tool   
        tavily_search(they might be giants)  
        ```</code></pre>
            <p>The output wrap settings can be useful here to ensure the correct wrapping before the tool is called. Alternatively, you can ask the model to intersperse wrapped tool calls with other text; however, it may take some reinforcement in the instructions field to ensure the formatting.</p>
            <p>Tool calls are executed on every call to a language model, and the tool call is appended to the document immediately after the tool call trigger text.</p>

        </Tab>
        <Tab eventKey="filemanager" title="File Manager">
        <p>The file manager helps you embed information from your documents into your chat prompts.</p>
        <p>Files can be uploaded directly or selected from Google Drive. Only text based formats allowed at this stage.</p>
        <p>It is also possible to paste files and links. Links are downloaded and saved.</p>
        <p>Documents are stored in your web browser with vector embeddings to enable semantic search.</p>
        <p>The file manager provides a search interface that shows the document fragments that would be injected into your prompt for a given message.</p>
        <br/>
        <p>To generate embeddings, files must be fragmented into chunks small enough for the embedding model. The style of fragmentation is critical to the effectiveness of your documents as an information source.</p>
        <p>A number of fragmentation styles are available including sentences, lines, paragraphs, HTML (with CSS selector) and more. Click the name of a file in the list to change the fragmentation method, and preview the resulting fragments.</p>
        <p>A default strategy will be chosen based on the content of the file.</p>
        <br/>
        <p>Files can be associated with a Persona. When chatting to a Persona with files, the latest message is used for a semantic search query of any associated files and the matching fragments are injected into the system prompt.</p>
        </Tab>

        <Tab eventKey="configuration" title="Configuration">



<h5>Provider Keys</h5>
<p>The application supports any LLM host provider compatible with OpenAI.</p>
<p>You can enter your own LLM endpoint and key. If you are using OpenAI or Groqcloud, you can enter your API key into the browser and the application will connect directly to their endpoints.</p>
<p>Last but not least you can buy credit which will give you access to our LLM proxy endpoint supporting a range of model providers.</p>
<p>Out of the box we provide a free tier service supported by Groqcloud.</p>

<h5>Preferred Models</h5>

<p>Personas can choose a preferred model type. For example basic, small, large, code, ..</p>
<p>In the settings, each of the model types can be assigned to a specific provider model.</p>
<p>When using a Persona where a model type is set, the query is run against the specific provider model.</p>
<br/>
<p>Model types are mapped automatically to available model types by default.</p>

<h5>Embeddings</h5>
<p>Machine learning models are used to generate the embedding vectors required for similarity search.</p>
<p>You can </p>
<ul>
    <li>provide an OpenAI key and choose a model to use their API endpoint to generate embeddings</li>
    <li>provide your own endpoint url and key</li>
    <li>generate embeddings in your browser</li>
</ul>

<p>The embedding model that was used, is saved with the file. The file search is able to find results in files with multiple different embeddings.</p>


<h5>Tools</h5>
<p>Combining code generation from a language model with the ability to run that code opens many possibilities.</p>
<p>While it is possible to run generated code in your browser, it may make sense to use a code server if for example</p>
<ul>
    <li>you are using another language that Javascript</li>
    <li>you are running network heavy code that runs much faster from a data center</li>
    <li>you want to access a website that does not support CORS</li>
</ul>
<p>The last example is arguably the most critical in being necessary to provide web search, even when using a search service like Tavily.</p>
<br/>
<p>The tools configuration allows the user to provide their own API endpoints for web search, web proxy and code execution.</p>
<p>Credit with our service provides access to our version of these endpoints so you don't need to sign up for keys or configure anything.</p>



<h5>Speech To Text</h5>
<p>To enable speech recognition, provide an OpenAI key or your own websocket API endpoint.</p>
<p>A python implementation of <a href='https://github.com/syntithenai/whisper-websocket-streaming' target="_new" >whisper websocket streaming</a> is available on Github.</p>
<br/>
<p>When speech recognition is enabled a microphone button will appear on the top right on the chat page.</p>


<h5>Text To Speech</h5>
<p>To enable spoken responses, choose between</p>
<ul>
    <li>providing an OpenAI key</li>
    <li>providing your own endpoint url (compatible with <a href='https://github.com/coqui-ai/TTS' target="_new" >CoquiTTS</a>)</li>
    <li>generate embeddings in your browser</li>
</ul>



        </Tab>
    </Tabs>
    
    <br/><br/><br/><br/><br/><br/>
							
							
			</div>
			
		<Footer icons={icons} />
	</div>)
}
{/* <MermaidViewer forceRefresh={forceRefresh} elementId={"mermaidrenderer_" + 1} chart={`flowchart LR
 IN --> A[Member 1] -->|member 1 data|B[Member 2] -->|member 2 data| C[Member 3] -->|member 3 data| Formatter -->OUT`} />
	
<MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 2} chart={`flowchart LR
    IN --> A[Member 1] -->|member 2 data| B[Member 2] --> |member 1 and 2 data|C[Member 3] --> |member 1 and 2 and 3 data|Formatter -->OUT`} />
    
<MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 3} chart={`flowchart LR
    IN --> A[Member 1]
    A --> Formatter 
    IN -->  B[Member 2] 
    B  --> Formatter
    IN -->  C[Member 3]
    C --> Formatter
    Formatter --> OUT`} />
<MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 4} chart={`flowchart LR

IN --> Chooser[Expert Selector] --> A[Member 1] --> Formatter --> OUT 
    IN --> Chooser -->  C[Member 3] --> Formatter --> OUT`}/>
       
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

 <MermaidViewer forceRefresh={forceRefresh}  elementId={"mermaidrenderer_" + 5} chart={`flowchart LR
    IN --> Generator[Question Generator] -->|Generated Question 1| A[Member 1] --> tr[Text Reducer] --> Formatter --> OUT 
    Generator -->|Generated Question 1| B[Member 2] --> tr --> Formatter
    Generator -->|Generated Question 2| A[Member 1] --> tr --> Formatter
    Generator -->|Generated Question 2| B[Member 2] --> tr --> Formatter`} /> */}
import wikipedia from './wikipedia'
import thesession from './thesession'
import coderunner from './coderunner'
import websearch from './websearch'
export default function({runtimes, config, token, creditBalance, abortController, files, fileManager, onError}) { 
 //   console.log("TOOOOLS",config)
    return {...wikipedia({config,abortController, files, fileManager, onError}), ...thesession({config,abortController, files, fileManager, onError}), ...coderunner({runtimes, config, token, creditBalance, abortController, files, fileManager, onError}), ...websearch({config, token, creditBalance, abortController, files, fileManager, onError})}
}


import wikipedia from './wikipedia'
import thesession from './thesession'
import coderunner from './coderunner'
import websearch from './websearch'
export default function({runtimes, config, token, creditBalance, abortController}) { 
 //   console.log("TOOOOLS",config)
    return {...wikipedia({config,abortController}), ...thesession({config,abortController}), ...coderunner({runtimes, config, token, creditBalance, abortController}), ...websearch({config, token, creditBalance, abortController})}
}


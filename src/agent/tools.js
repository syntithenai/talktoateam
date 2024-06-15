import wikipedia from './wikipedia'
import thesession from './thesession'
import coderunner from './coderunner'
import websearch from './websearch'
export default function({runtimes, config}) { return {...wikipedia(), ...thesession(), ...coderunner({runtimes, config}), ...websearch(config)}}


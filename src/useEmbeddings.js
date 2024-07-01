import { useEffect, useRef, useState } from 'react'

import useEmbeddingsWorker from './useEmbeddingsWorker'


export default function useEmbeddings({config, onError}) {


  function canUseLocalEmbeddings(config) {
    return config && config.embeddings && config.embeddings.use === 'local' ? true : false
  }

  function canUseSelfHostedEmbeddings(config) {
    return config && config.embeddings && config.embeddings.use === 'self_hosted' && config.embeddings.self_hosted_url && config.embeddings.self_hosted_model ? true : false
  }

  function canUseOpenAIEmbeddings(config) {
    return config && config.embeddings && config.embeddings.use === 'openai' && config.embeddings.openai_model && config.embeddings.openai_key ? true : false
  }

  let [isReady, setIsReady] = useState(canUseLocalEmbeddings(config))
  let [readyProgress, setReadyProgress] = useState(0)

  let embedWorker = useEmbeddingsWorker({
    onReady: function() {
      setIsReady(true)
      setReadyProgress(0)
    },
    onProgress: function(e) {
      // console.log("P",e)
      setReadyProgress(e)
    },
    onError: function(e) {
      console.log("ERROR",e)
      onError(e)
    }
  })

  function loadEmbeddingEndpoint (input, key, url, model) {
    return new Promise(function(resolve,reject) {
        let found = false
        if (Array.isArray(input)) {
          input.forEach(function(i) {
            if (i) found = true
          })
        }
        // no input
        if (!found || !input || !key) resolve()
        fetch(url, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer '+key
          },
          body: JSON.stringify({
            input: input,
            model: model
          })
        }).then(function(response) {
          // console.log(response)
          if (!response.ok) {
            onError('Failed to load embeddings');
          }
          response.json().then(function(embedding) {
            // console.log(embedding)
            resolve(embedding.data)
          })
        }).catch(function(e) {
          onError("Failed to load embeddings " + e)
        })
    })

   
  }
//="https://api.openai.com/v1/embeddings"
// ="text-embedding-3-small" 
  const run = (input, forceProvider) => {
    // console.log("RUN EMB",config,input)
    return new Promise(function(resolve,reject) {
      if (canUseOpenAIEmbeddings(config)) { 
        loadEmbeddingEndpoint (input, (config && config.embeddings && config.embeddings.openai_key ? config.embeddings.openai_key : ''), "https://api.openai.com/v1/embeddings", (config && config.embeddings && config.embeddings.openai_model ? config.embeddings.openai_model : '')).then(function(a) {resolve({provider: 'openai',model:config.embeddings.openai_model , embeddings: a})})
      } else if (canUseSelfHostedEmbeddings(config)) {
        loadEmbeddingEndpoint (input, (config && config.embeddings && config.embeddings.self_hosted_key ? config.embeddings.self_hosted_key : ''), (config && config.embeddings && config.embeddings.self_hosted_url ? config.embeddings.self_hosted_url : ''), (config && config.embeddings && config.embeddings.self_hosted_model ? config.embeddings.self_hosted_model : '')).then(function(a) {resolve({provider: 'self_hosted', model:config.embeddings.self_hosted_model , embeddings: a})})
      } else if (canUseLocalEmbeddings(config)) {
        embedWorker.run(input).then(function(a) {
          // console.log("final EMBEDS",a)
          resolve({provider: 'local', model:'TaylorAI/gte-tiny' , embeddings: a})
        })
      } else {
        onError("Invalid embed configuration. Check your settings.")
		
      }
    })
  }

  const runModel = (input, provider) => {
    // console.log("RUN runModel",provider,input)
    return new Promise(function(resolve,reject) {
      if (provider && provider.startsWith("openai ") && config.embeddings.openai_model && config.embeddings.openai_key ) { 
        let model = provider.slice(7)
        loadEmbeddingEndpoint (input, (config && config.embeddings && config.embeddings.openai_key ? config.embeddings.openai_key : ''), "https://api.openai.com/v1/embeddings", model).then(function(a) {resolve(a)})
      } else if (provider && provider.startsWith("self_hosted ") && config.embeddings.self_hosted_url && config.embeddings.self_hosted_url && config.embeddings.self_hosted_url && config.embeddings.self_hosted_model) {
        let model = provider.slice(12)
        loadEmbeddingEndpoint (input, (config && config.embeddings && config.embeddings.self_hosted_key ? config.embeddings.self_hosted_key : ''), (config && config.embeddings && config.embeddings.self_hosted_url ? config.embeddings.self_hosted_url : ''), model).then(function(a) {resolve(a)})
      } else if (provider && provider.startsWith("local ") ) {
        embedWorker.run(input).then(function(a) {
          // console.log("final EMBEDS",a)
          resolve(a)
        })
      } else {
        onError("Invalid embed configuration. Check your settings.")
		
      }
    })
  }

  return {run, runModel, isReady, readyProgress}

}

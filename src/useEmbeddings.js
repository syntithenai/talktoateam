import { useEffect, useRef, useState } from 'react'


export default function useEmbeddings() {

  const run = (input, key, url="https://api.openai.com/v1/embeddings", model="text-embedding-3-small" ) => {
    return new Promise(function(resolve,reject) {
        let found = false
        if (Array.isArray(input)) {
          input.forEach(function(i) {
            if (i) found = true
          })
        }
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
          console.log(response)
          if (!response.ok) {
            throw new Error('Failed to load embeddings');
          }
          response.json().then(function(embedding) {
            console.log(embedding)
            resolve(embedding.data)
          })
        }).catch(function(e) {
          reject("Failed to load embeddings " + e)
        })
    })

   
  }

  return {run}

}

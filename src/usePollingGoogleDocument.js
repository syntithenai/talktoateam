import axios from 'axios'
import {useState, useRef, useEffect} from 'react';
//import jwt_decode from "jwt-decode";
//import useAbcTools from "./useAbcTools"
//import useUtils from './useUtils'

//import useCheckOnlineStatus from './useCheckOnlineStatus'

import useGoogleDocument from './useGoogleDocument'
    
export default function usePollingGoogleDocument(props) {
  const {token, logout, refresh, pollingInterval, onMerge, pausePolling, setGoogleDocumentId, googleDocumentId, googleFileName} = props
  
  var docs = useGoogleDocument(googleFileName ? googleFileName : 'App Storage' ,token, logout, refresh,function(changes) {
      //console.log('use google doc', googleFileName)
      return new Promise(function(resolve,reject) {
          var matchingChanges = changes.filter(function(change) {
            if (change.fileId === googleSheetId.current) {
              return true
            } else {
              return false
            }
          },pausePolling,pollingInterval)
          if (matchingChanges && matchingChanges.length === 1) {
            docs.exportDocument(googleSheetId.current).then(function(fullSheet) {
              onMerge(fullSheet)
              resolve()
            })
          } else {
              resolve()
          }
      })
  }, true, pollingInterval)
  		
  useEffect(function() {
	  //console.log('use google doc token change', token)
      if (token && token.access_token) {
        findGoogleDocumentInDrive()
      } else {
        googleSheetId.current = null
      }
    },[token])
    
  
  var googleSheetId = useRef(null)
  var accessToken = token ? token.access_token : null
  var updateSheetTimer = useRef(null)
  
  function save(data, delay=3000) {
    return new Promise(function(resolve,reject) {
      //console.log('trigger save',delay, googleSheetId.current )
      pausePolling.current = true
      if (googleSheetId.current) { 
        clearTimeout(updateSheetTimer.current)
        updateSheetTimer.current = setTimeout(function() {
			docs.updateDocumentData(googleSheetId.current , data).then(function() {
                  pausePolling.current = false
                  //console.log('done save')
            })
            resolve()
        },delay)
      } else {
          resolve()
      }
    })
  }


	function findGoogleDocumentInDrive() {
		//console.log('find book in drive')
		var xhr = new XMLHttpRequest();
		xhr.onload = function (res) {
			if (res.target.responseText) {
				var response = JSON.parse(res.target.responseText)
				//console.log('find tunebook',response)
				var found = false
				if (response && response.files && Array.isArray(response.files) && response.files.length > 0)  {
					// load whole file
					if (Array.isArray(response.files)) {
						response.files.forEach(function(file) {
							if (file && file.name === googleFileName) {
								found = file.id
							}
						})
					}
				}
				//console.log('found tunebook',found)
				if (found) {
					googleSheetId.current = found
					setGoogleDocumentId(found)
					docs.exportDocument(found).then(function(fullSheet) {
						onMerge(fullSheet)
					})
				} else {
					docs.findGoogleFolderInDrive().then(function(folderId) {
						if (folderId) {
							//console.log('found folder creating doc',folderId)
							docs.createDocument(googleFileName,'', 'application/vnd.google-apps.document','Document for '+googleFileName+' data', folderId).then(function(newId) {
								googleSheetId.current = newId
								setGoogleDocumentId(newId)
								docs.exportDocument(newId).then(function(fullSheet) {
									onMerge(fullSheet)
								})
							})
						}
					})
				}
			}
		};
		var filter = "?q="+ encodeURIComponent("name='"+googleFileName+"' and mimeType != 'application/vnd.google-apps.folder' and trashed = false") //" //+urlencode()   //'"+decoded.name+"\'s Tune Book'" 
		xhr.open('GET', 'https://www.googleapis.com/drive/v3/files' + filter+'&nocache='+String(parseInt(Math.random()*1000000000)));
		xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		xhr.send();
	}
    
    
    
    return {  save, exportDocument: docs.exportDocument }
        
}

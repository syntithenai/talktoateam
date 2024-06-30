import * as localForage from "localforage";
import {useState, useEffect, useRef} from 'react'
//import useGoogleDocument from './useGoogleDocument'
import useUtils from './useUtils'
//import { TextModel } from "@visheratin/web-ai";
import localforage from 'localforage';
//const { Voy } = await import("voy-search");
// import useEmbeddingsWorker from './useEmbeddingsWorker'
import useEmbeddings from './useEmbeddings'
import useFileSplitter from './useFileSplitter'
import nlp from 'compromise'
import {split} from 'sentence-splitter'
		
export default function useFileManager({creditBalance, config, storeName, token, logout, allowMimeTypes, loadData, onError, googleFolderName, forceRefresh}) {
	if (!storeName) storeName = 'files'
  //console.log(storeName, allowMimeTypes)
	var [files, setFiles] = useState([])
	var store = localforage.createInstance({
		name: storeName
	});
	//var docs = useGoogleDocument(token, logout)
	var utils = useUtils()
	var [warning, setWarning] = useState('')
	const model = useRef()
    const [index, setIndex] = useState(null);
    const [fragments, setFragments] = useState([]);
    const [isBusy, setIsBusy] = useState(false)

	useEffect(function() {
		refresh()
	},[])

	const embedder = useEmbeddings() //Worker({workerUrl: './embeddings_worker.js'})
	const fileSplitter = useFileSplitter()
	
	function maxFragmentSizeFromEmbedder() {
		if (config && config.embedder && config.embedder.max_length > 0) {
			return parseInt(config.embedder.max_length)
		} else {
			return '8191'
		}
	}

    function generateFragments(file) {
		let frags = null
		if (config && config.embeddings && config.embeddings.max_length > 0) {
			frags = fileSplitter.generateFragments(file,config.embeddings.max_length );
		} else {
			frags = fileSplitter.generateFragments(file);
		}
		console.log(frags)
		return frags
	}
	
	async function generateEmbeddings(fragments) {
		// console.log('gen embed')
		if (!(config && config.embeddings && config.embeddings.openai_key)) throw new Exception("Invalid embed configuration. Login and buy credit or provide your own keys for embeddings in settings.")
		return await embedder.run(fragments, config.embeddings.openai_key)
		//Promise.all(fragments.map((q) => embedder.run(q)));
	}
	//embedder.run(fragments) //

    async function searchVectorFiles(text, files, topK=5, minSimilarity = 0.37) {
		// console.log("SEARCH VEC", text, files)
		if (!(config && config.embeddings && config.embeddings.openai_key)) throw new Error("Invalid embed configuration. Login and buy credit or provide your own keys for embeddings in settings.")
		let embedderResponse = await embedder.run([text], config.embeddings.openai_key)
		// console.log(embedderResponse)
		let comparisons = []
		// generate comparisons between the embedded query text and every file
		if (embedderResponse  && embedderResponse[0] && embedderResponse[0].embedding) {
			// console.log('HAVE QUERY EMBEDD', embedderResponse[0].embedding)
			let queryEmbedding = embedderResponse[0].embedding
			if (Array.isArray(files)) {
				files.forEach(function(file, fileKey) {
					// console.log("file" ,file)
					if (file && Array.isArray(file.embeddings)) {
						// console.log(file.embeddings, file.fragments)
						file.embeddings.forEach(function(embedding, embeddingKey) {
							// console.log(file.fragments[embeddingKey])
							if (file.fragments && file.fragments[embeddingKey]) {
								// console.log("sims",queryEmbedding, embedding)
								let sim = utils.cosineSimilarity(queryEmbedding, embedding)
								if (sim > minSimilarity) {
									comparisons.push({
										similarity: sim,
										file: file.id,
										fragment: file.fragments[embeddingKey],
									})
								}
							}
						})
					}
				})
			}
			// console.log("COMPS",comparisons)
		}
		
		function findFile(id) {
			let found = null
			files.forEach(function(f) {
				if (f.id === id) found = f
			})
			return found
		}

		// Sort comparisons by similarity and return topK results
		let sample = comparisons
		.sort((a, b) => b.similarity - a.similarity)
		.slice(0, topK);

		let collatedFiles = {}
		sample.forEach(function(s) {
			if (collatedFiles.hasOwnProperty(s.file)) {
				collatedFiles[s.file].matches.push(s)
			} else {
				collatedFiles[s.file] = findFile(s.file)
				collatedFiles[s.file].matches = [s]
			}
		})
		// sort files by combined sum of similarities 
		collatedFiles = Object.values(collatedFiles).sort(function(a,b) {
			let tallyA = 0
			let tallyB = 0
			if (a && Array.isArray(a.matches)) {
				a.matches.forEach(function(m) {tallyA += m.similarity})
			}
			if (b && Array.isArray(b.matches)) {
				b.matches.forEach(function(m) {tallyB += m.similarity})
			}
			let avgA = (a && Array.isArray(a.matches) && a.matches.length > 0) ? tallyA/a.matches.length : 0
			let avgB = (a && Array.isArray(b.matches) && b.matches.length > 0) ? tallyB/b.matches.length : 0 
			return avgA - avgB
		})
		
		return collatedFiles
	}
    
    

	
	async function refresh() {
		// console.log('refresh')
		return search(null).then(function(res) {
				setFiles(res)
				return 
		})
	}
	
	
	
	// function addFiles(filesToAdd, resetFilter = true) {
	// 	console.log('add', filesToAdd, resetFilter)
	// 	if (Array.isArray(filesToAdd)) {
	// 		var newFiles = files
	// 		filesToAdd.forEach(function(file) {
	// 			if (file) newFiles.push(file)
	// 		})
	// 		setFiles(newFiles)
	// 		refresh().then(function() {
	// 			forceRefresh()
	// 		})
			
	// 	}
	// 	return files
	// }
	function addFiles(documents, onChange, value) {
		// console.log('addf',documents)
		let promises = []
		if (Array.isArray(documents)) {
			documents.forEach(function(doc) {
				promises.push(save(doc))
			})
		}
		// console.log('addf',promises)
		Promise.all(promises).then(function(files) {
			// console.log("saved", files)
			let ids = Array.isArray(value) ? value : []
			files.forEach(function(f) {
				files.push(f)
				ids.push(f.id)
			})
			// console.log('addf DONE',files)
			setFiles(files)
			if (onChange) onChange(utils.uniquifyArray(ids))
			refresh().then(function() {
				forceRefresh()
			})
		})
		
	}
	
	
	
	function updateFiles(files, resetFilter = true) {
		// console.log('updatefiles',files,resetFilter)
		setFiles(files)
		refresh().then(function() {
			forceRefresh()
		})
		return files
	}
	
	async function doDeleteFile(file) {
		// console.log("DOdelete", file)
		if (file && file.id) {
			file.deleted = true
			file.data  = null
			await store.setItem(file.id, file)
			setFiles(files.filter(function(f) {
				if (f & f.id & file.id && file.id == f.id)  {
					return false
				} else {
					return true
				}
			}))
			refresh().then(function() {
				forceRefresh()
			})
			//search(null, tuneId).then(function(res) {
				//setFiles(res)
				//return null;
			//})
			return null;
		} else {
			return null;
		}
	}
	
	async function deleteFile(file){
		// console.log("delete", file,JSON.parse(JSON.stringify(files)))
		var m = file.name ? "Really delete the file " + file.name : 'Really delete this file?'
		if (window.confirm(m)) {
			doDeleteFile(file).then(function() {})
		}
	}
	
	
  async function load(fileId) {
    return new Promise(function(resolve,reject) {
      store.getItem(fileId).then(function (value) {
        resolve(value)
      }).catch(function (err) {
        console.log('err',err)
        resolve({error:err})
      })
    })
  }


	function search(titleFilter = null, noData = true) {
		// console.log('search', titleFilter)
		return new Promise(function(resolve,reject) {
			var final = []
			store.iterate(function(value, key, iterationNumber) {
				// console.log("SEARCH ITER",value,key,iterationNumber)
				var passedFilters = value.deleted ? false : true
				if (titleFilter && titleFilter.trim().length > 0 && value.name.toLowerCase().indexOf(titleFilter.trim()) === -1) {
				  passedFilters = false
				}
				// console.log('searchFF', passedFilters, value, key, iterationNumber)
				if (passedFilters && value) {
					//value.bitLength = value.data ? value.data.size : 0
					if (noData && !loadData) delete value.data  // don't return data with list
					final.push(value)
					
				}
			}).catch(function(err) {
				console.log(err);
				resolve([])
			}).finally(function() {
				// console.log('finaly', final)
				resolve(final)
			})
		})
	}
  
  function updateFileName(file) {
    return new Promise(function(resolve,reject) {
      if (file && file.id && file.name) {
        file.updatedTimestamp = new Date()
        store.setItem(file.id, file).then(function (item) {
          if (false && file.googleId && token) {
            //docs.updateDocument(file.googleId,{name: file.name}).then(function(newId) {
				//// update filemanager base files
				//setFiles(files.map(function(f) {
					//if (f & f.id & file.id && file.id == f.id)  {
						//return file
					//} else {
						//return f
					//}
				//}))
				//resolve()
						
            //})
          } else {
			 // update filemanager base files
			setFiles(files.map(function(f) {
				if (f & f.id & file.id && file.id == f.id)  {
					return file
				} else {
					return f
				}
			}))
			refresh().then(function() {
				forceRefresh()
			})
			resolve()
          }
        }).catch(function (err) {
          console.log('serr',err)
          resolve({error:err})
        });
      } else {
        resolve({error:'Missing id or name'})
      }
    })
  }
  
  
  
function save(file) {
	setIsBusy(true)
	// console.log("save",file, token)
	return new Promise(function(resolve,reject) {
		
		function finishSave(file) {
			file.updatedTimestamp = new Date()
			store.setItem(file.id, file).then(function (item) {
				// console.log("save set item",item)
				setFiles(files.map(function(f) {
					if (f & f.id & file.id && file.id == f.id)  {
						return file
					} else {
						return f
					}
				}))
				setIsBusy(false)
				resolve(file)
			})
		}
		
		
		if (file) {
			if (!file.id)  {
				file.id = utils.generateRandomId() 
				file.createdTimestamp = new Date()
			}
			file.updatedTimestamp = new Date()
			if (file.data) {
				// console.log("have file data, gen embds")
				file.fragments = generateFragments(file)
				file.chunking_strategy = fileSplitter.determineTextType(file.data)
				let categories = Array.isArray(file.category) ? file.category.join(' ') : ''
				if (Array.isArray(file.fragments)) generateEmbeddings(file.fragments.map(function(fragment) {
					// include file name and categories in embedding
					return file.name + ' ' + categories + ' ' + fragment
				} )).then(function(embeddings) {
					// console.log("got emb",embeddings)
					file.embeddings = Array.isArray(embeddings) ? embeddings.map(function(e) {
						return e.embedding
					}) : []
					finishSave(file)
				})
			} else {
				// console.log("have NO file data, skip embds")
				finishSave(file)
			}
			
			
		} else {
			reject('missing file')
		}
	})
}



	// function search(titleFilter = null, noData = true) {
	// 	console.log('search', titleFilter)
	// 	return new Promise(function(resolve,reject) {
	// 		var final = []
	// 		store.iterate(function(value, key, iterationNumber) {
	// 			// console.log("SEARCH ITER",value,key,iterationNumber)
	// 			var passedFilters = value.deleted ? false : true
	// 			if (titleFilter && titleFilter.trim().length > 0 && value.name.toLowerCase().indexOf(titleFilter.trim()) === -1) {
	// 			  passedFilters = false
	// 			}
	// 			// console.log('searchFF', passedFilters, value, key, iterationNumber)
	// 			if (passedFilters && value) {
	// 				//value.bitLength = value.data ? value.data.size : 0
	// 				if (noData && !loadData) delete value.data  // don't return data with list
	// 				final.push(value)
	// 			}
	// 		}).catch(function(err) {
	// 			console.log(err);
	// 			resolve([])
	// 		}).finally(function() {
	// 			// console.log('finaly', final)
	// 			resolve(final)
	// 		})
	// 	})
	// }


	function allowMime(mimeFragment) {
		//console.log('allowMime',mimeFragment)
		const mimeFragmentParts = mimeFragment.trim().split("/")
		var found = false;
		if (Array.isArray(allowMimeTypes)) {
			if (mimeFragment && mimeFragment.trim().length > 0 ) {
				allowMimeTypes.forEach(function(allowedMime) {
					const allowedMimeParts = allowedMime.trim().split("/")
					if (allowedMimeParts.length == 2) {
						if (allowedMimeParts[1] === '*') {
							if (mimeFragmentParts[0] == allowedMimeParts[0]) {
								found = true
							}
						} else {
							if (mimeFragment.trim() === allowedMime.trim()) {
								found = true
							}
						}
					}
				})
				return found
			} else {
				return false
			}
		}
		return true
	}
	
	
	function scrapeUrl(url) {
		return new Promise(function (resolve, reject) {
			console.log('scrape', url);
			if (url) {
				// Use self provided proxy
				if (config && config.tools && config.tools.proxy_url) {
					url = config.tools.proxy_url + url;
				// Use proxy via credit
				} else if (creditBalance && token && token.access_token) {
					url = import.meta.env.VITE_API_URL + '/proxy/' + url;
				}
				// console.log('scrape2', url);
				var xhr = new XMLHttpRequest();
				
				xhr.onload = function (res) {
					// console.log("SCRAPED", res);
					if (xhr.response) {
						const reader = new FileReader();
						reader.onload = function () {
							resolve(reader.result);
						};
						reader.onerror = function (err) {
							console.log("Failed to read the response as text", err);
							resolve(null);
						};
	
						reader.readAsText(xhr.response);
					} else {
						resolve(null);
					}
				};
	
				xhr.onerror = function (err) {
					console.log(err);
					alert("Failed to load URL " + url);
					resolve(null);
				};
	
				xhr.open('GET', url);
				xhr.responseType = 'blob';
				xhr.send();
			} else {
				resolve(null);
			}
		});
	}
	
  
	function pasteFiles(onChange = null, value = null) {
		// console.log('paste',token)
		return new Promise(function(resolve,reject) {
			var files = []
			var promises = []
			setWarning('')
			navigator.clipboard
			  .read()
			  .then(
				(clipItems) => {
					if (clipItems) {
						clipItems.forEach(function(item, i) {
							promises.push(new Promise(function(resolve2,reject2) {
								item.types.forEach(function(type) {
									item.getType(type).then(function(t) {
										// TODO currently ignored  || type === 'text/html'
										if (type === 'text/plain' ) {
											// console.log("TEXT SEEK LINKS")
											utils.blobToText(t).then(function(a) {
												// console.log("TEXT SEEK LINKS tt",a, a.split('\n'))
												var foundLink = false
												a.split("\n").forEach(function(line) {
													// console.log("handle linke opot",line)
													if (line.trim().startsWith('http://') || line.trim().startsWith('https://')) {
														foundLink = true
														// console.log("SCRAPE",line)
														scrapeUrl(line.trim()).then(function(f) {
															// console.log("SCRAPED",f)
															if (f) {
																resolve2({id: utils.generateRandomId(), name: line, type: f.type, data: f})
															} else {
																setWarning("Failed to load")
																resolve(null)
															}
														})
													
													}
												})
												// console.log("TEXshawnT SEEK LINKS done",foundLink, allowMime('text/plain'))
												if (!foundLink && allowMime('text/plain')) {
													// console.log("TEXT SEEK LINKS fail, just  paste text")
													const id = utils.generateRandomId()
													resolve2({id: id, name: 'pasted text ' + id , type: type, data: a})
												}
											})
													
										} else if (type.indexOf('image/') === 0 && allowMime('image/')) {
											// console.log("IMAGE")
											utils.blobToBase64(t).then(function(a) {
												const id = utils.generateRandomId()
												resolve2({id: id, name: 'pasted image ' + id , type: type, data: a})
											})
										
										} else if (type !== 'text/html' && allowMime(type)) {
											// console.log("html")
											
											utils.blobToText(t).then(function(a) {
												// console.log("TEXT SEEK LINKS tt",a)
												var foundLink = false
												a.split("/n").forEach(function(line) {
													if (line.trim().startsWith('http://') || line.trim().startsWith('https://')) {
														foundLink = true
														// console.log("SCRAPE",line)
														scrapeUrl(line.trim()).then(function(f) {
															// console.log("SCRAPED",f)
															if (f) {
																resolve2({id: utils.generateRandomId(), name: line, type: f.type, data: f})
															} else {
																setWarning("Failed to load")
																resolve(null)
															}
														})
													
													}
												})
												// console.log("TEXshawnT SEEK LINKS done",foundLink, allowMime('text/plain'))
												if (!foundLink && allowMime('text/plain')) {
													// console.log("TEXT SEEK LINKS fail, just  paste text")
													const id = utils.generateRandomId()
													resolve2({id: id, name: 'pasted text ' + id , type: type, data: a})
												}


												const id = utils.generateRandomId()
												resolve2({id: id, name: 'pasted file ' + id , type: type, data: a})
											})
										}
										console.log(t, type, item)
									})
								})
							}))
						})
						// console.log("PROM",promises)
						Promise.all(promises).then(function(newFiles) {
							// console.log("PPP",newFiles)
							if (Array.isArray(newFiles)) {
								var savePromises = []
								newFiles.forEach(function(file) {
									savePromises.push(new Promise(function(resolve,reject) {
										save(file).then(function(newFile) {
											resolve(newFile)
										})
									}))
								})
								Promise.all(savePromises).then(function(newFiles) {
									// console.log("NdF", newFiles)
									resolve(addFiles(newFiles, onChange, value))
								})
							}
						}) 
					}
				},
			);
		})
		
	}

	
	function filesSelected(e, onChange = null, value = null) {
		// console.log('ssss files selected', e.target.files)
		if (e.target.files) {
			var files = []
			var promises = []
			Array.from(e.target.files).forEach(function(file) {
				console.log(file)
				// UNZIP MUSIC XML FILE
				//if (file && file.type && file.type === "text/plain") {
					//if (allowMime(file.type) ) {
						// console.log('file selected read b64')
						promises.push(new Promise(function(resolve,reject) {
							utils.readFileAsText(file).then(function (res) {
								resolve({id: utils.generateRandomId(), name: file.name, type: file.type, data: res})
							})
						}))
					//} else {
						//setWarning("File type text/plain is not allowed")
					//}
				// READ FILE AS BASE64
				//} else {
					//console.log('file selected read b64')
					//if (file && allowMime(file.type)) {
						//promises.push(new Promise(function(resolve,reject) {
							//utils.readFileAsBase64(file).then(function (res) {
								////var file = res[0]
								////var data = res //[1]
								//resolve({id: utils.generateRandomId(), name: file.name, type: file.type, data: res})
							//})
						//}))
					//} else {
						//setWarning("File type "+file.type+" is not allowed")
					//}
				//}
			})
			Promise.all(promises).then(function(data) {
				// console.log('read files',data)
				var savePromises = []
				data.forEach(function(newFile) { 
					savePromises.push(new Promise(function(resolve,reject) {
						save(newFile).then(function(f) {
							resolve(f)
						})
					}))
				})
				Promise.all(savePromises).then(function(finalFiles) {
					// console.log("add selected files", finalFiles)
					return addFiles(finalFiles, onChange, value)
				})
			})
		}
	}

	  
	return {files,  fileManager: {maxFragmentSizeFromEmbedder, searchVectorFiles,generateEmbeddings,generateFragments, setFiles, load, updateFileName, deleteFile, save,  scrapeUrl, pasteFiles, filesSelected,  allowMime, addFiles, refresh, allowMimeTypes, warning, setWarning, allowMimeTypes, isBusy, setIsBusy}}
  
}



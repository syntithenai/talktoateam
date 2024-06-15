import * as localForage from "localforage";
import {useState, useEffect, useRef} from 'react'
//import useGoogleDocument from './useGoogleDocument'
import useUtils from './useUtils'
//import { TextModel } from "@visheratin/web-ai";
import localforage from 'localforage';
//const { Voy } = await import("voy-search");
import useEmbeddingsWorker from './useEmbeddingsWorker'
import nlp from 'compromise'
import {split} from 'sentence-splitter'
		
export default function useFileManager({storeName, token, logout, allowMimeTypes, loadData, onError, googleFolderName, forceRefresh}) {
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

	const embedder = useEmbeddingsWorker({workerUrl: './embeddings_worker.js'})
   
    function generateFragments(inputString, chunkSize = 20, overlapSize = 3) {
		const words = inputString.split(/\s+/);
		const result = [];
		
		for (let i = 0; i < words.length; i += (chunkSize - overlapSize)) {
			const chunk = words.slice(i, i + chunkSize);
			result.push(chunk.join(' '));
			if (i + chunkSize >= words.length) {
				break;
			}
		}
		return result;
		
		// return split(inputString).filter(function(a) { return (a.type === 'Sentence') }).map(function(a) {return a.raw})
	}
	
	async function generateEmbeddings(text) {
		return await embedder.run(text)
		//Promise.all(fragments.map((q) => embedder.run(q)));
	}
	//embedder.run(fragments) //

    async function searchVectorFiles(text, files, topK=5) {
		console.log("SEARCH VEC", text, files)
		let queryEmbedding = await embedder.run(text)
		let comparisons = []
		if (Array.isArray(files)) {
			files.forEach(function(file, fileKey) {
				if (file && Array.isArray(file.embeddings)) {
					file.embeddings.forEach(function(embedding, embeddingKey) {
						if (file.fragments && file.fragments[embeddingKey]) {
							console.log("sims",queryEmbedding, embedding)
							comparisons.push({
								similarity: utils.cosineSimilarity(queryEmbedding, embedding),
								file: file.id,
								fragment: file.fragments[embeddingKey],
							})
						}
					})
				}
			})
		}
		console.log("COMPS",comparisons)
		// .filter((object) =>
		// 	Object.keys(filter).every((key) => object[key] === filter[key]),
		// )
		// const similarities = comparisons.map((obj) => ({
		// 	similarity: cosineSimilarity(queryEmbedding, obj.embedding),
		// 	object: obj,
		// }));
		
		// Sort by similarity and return topK results
		return comparisons
		.sort((a, b) => b.similarity - a.similarity)
		.slice(0, topK);
		
	}
    
    

	
	async function refresh() {
		console.log('refresh')
		return search(null).then(function(res) {
				setFiles(res)
				return 
		})
	}
	
	
	
	function addFiles(filesToAdd, resetFilter = true) {
		console.log('add', filesToAdd, resetFilter)
		if (Array.isArray(filesToAdd)) {
			var newFiles = files
			filesToAdd.forEach(function(file) {
				if (file) newFiles.push(file)
			})
			setFiles(newFiles)
			forceRefresh()
		}
		return files
	}
	
	function updateFiles(files, resetFilter = true) {
		console.log('updatefiles',files,resetFilter)
		setFiles(files)
		forceRefresh()
		return files
	}
	
	async function doDeleteFile(file) {
		//console.log("DOdelete", file)
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
			forceRefresh()
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
		//console.log("delete", file,fileKey,JSON.parse(JSON.stringify(files)))
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
			forceRefresh()
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
	console.log("save",file, token)
	return new Promise(function(resolve,reject) {
		
		function finishSave(file) {
			file.updatedTimestamp = new Date()
			store.setItem(file.id, file).then(function (item) {
				console.log("save set item",item)
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
			if (file.data) {
				file.fragments = generateFragments(file.data)
				generateEmbeddings(file.fragments).then(function(embeddings) {
					console.log("got emb",embeddings)
					file.embeddings = embeddings
					finishSave(file)
				})
			} else {
				finishSave(file)
			}
			
			
		} else {
			reject('missing file')
		}
	})
}



	function search(titleFilter = null, noData = true) {
		console.log('search', titleFilter)
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
		return new Promise(function(resolve,reject) {
			console.log('scrape',url)
			if (url) {
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';

				xhr.onload = function (res) {
					
					console.log("SCRAPED",res)
					const type = res && res.target && res.target.response ? res.target.response.type : ''
					console.log("SCRAPED TYPE",type)
					if (xhr.response && type)  {
						utils.blobToBase64(xhr.response).then(function(b64) {
							resolve({b64,type})
						})
					} else {
						resolve(null)
					}
					//setWaiting(null)
				};
				xhr.onerror = function(err) {
					console.log(err)
					resolve(null)
				}
				//setWaiting(true)
				xhr.open('GET', url);
				xhr.send();
			}
		})
  }  
  
	function pasteFiles() {
		console.log('paste',token)
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
											utils.blobToText(t).then(function(a) {
												var foundLink = false
												a.split("/n").forEach(function(line) {
													if (line.trim().startsWith('http://') || line.trim().startsWith('https://')) {
														foundLink = true
														console.log("FFFFFFFFFFFFF PRE",line)
														scrapeUrl(line.trim()).then(function(f) {
															console.log("FFFFFFFFFFFFF",f)
															if (f) {
																resolve2({id: utils.generateRandomId(), name: line, type: f.type, data: f.b64})
															} else {
																setWarning("Failed to load")
																resolve(null)
															}
														})
													
													}
												})
												if (!foundLink && allowMime('text/plain')) {
													const id = utils.generateRandomId()
													resolve2({id: id, name: 'pasted text ' + id , type: type, data: a})
												}
											})
													
										} else if (type.indexOf('image/') === 0 && allowMime('image/')) {
											utils.blobToBase64(t).then(function(a) {
												const id = utils.generateRandomId()
												resolve2({id: id, name: 'pasted image ' + id , type: type, data: a})
											})
										
										} else if (type !== 'text/html' && allowMime(type)) {
											utils.blobToBase64(t).then(function(a) {
												const id = utils.generateRandomId()
												resolve2({id: id, name: 'pasted file ' + id , type: type, data: a})
											})
										}
										console.log(t, type, item)
									})
								})
							}))
						})
						
						Promise.all(promises).then(function(newFiles) {
							console.log("PPP",newFiles)
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
									console.log("NdF", newFiles)
									resolve(addFiles(newFiles))
								})
							}
						}) 
					}
				},
			);
		})
		
	}

	
	function filesSelected(e) {
		console.log('ssss files selected', e.target.files)
		if (e.target.files) {
			var files = []
			var promises = []
			Array.from(e.target.files).forEach(function(file) {
				console.log(file)
				// UNZIP MUSIC XML FILE
				//if (file && file.type && file.type === "text/plain") {
					//if (allowMime(file.type) ) {
						console.log('file selected read b64')
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
				console.log('read files',data)
				var savePromises = []
				data.forEach(function(newFile) { 
					// TODO SAVE AND CLEAR DATA FIELD
					// two element array 	
					//if (Array.isArray(dataPair) && dataPair.length === 2) {
						//files.push({id: utils.generateRandomId(), tuneId: tune && tune.id ? tune.id : null, name: dataPair[0].name, type: dataPair[0].type, data: dataPair[1]})
					//// full file record from mxl
					//} else if (typeof dataPair === 'object' ) {
					//files.push(newFile)
					//}
					savePromises.push(new Promise(function(resolve,reject) {
						save(newFile).then(function(f) {
							resolve(f)
						})
					}))
				})
				Promise.all(savePromises).then(function(finalFiles) {
					console.log("add selected files", finalFiles)
					addFiles(finalFiles)
					forceRefresh()
				})
			})
		}
	}
	  
	return {files,  fileManager: {searchVectorFiles,generateEmbeddings,generateFragments, setFiles, load, updateFileName, deleteFile, save, search, scrapeUrl, pasteFiles, filesSelected,  allowMime, addFiles, refresh, allowMimeTypes, warning, setWarning, allowMimeTypes, isBusy, setIsBusy}}
  
}




// async function createSearcher(fragments, embeddings) {
// 	// Index embeddings with voy
// 	//const resource = { embeddings: embeddings.map(({ result }, i) => ({
// 	  //id: String(i),
// 	  //title: fragments[i],
// 	  //url: `/path/${i}`,
// 	  //embeddings: result,
// 	//})) };
// 	//const index = new Voy(resource);
// 	//return index
// }
// async function searchVoy(text, index) {
// 	//const q = await model.current.process(text);
// 	//const result = index.search(q.result, 1);

// 	//// Display search result
// 	//result.neighbors.forEach((result) =>
// 	  //console.log(`✨ voy similarity search result: "${result.title}"`)
// 	//);
// 	//return result
// }

    // async function createSearcherFromFiles(files) {
		//let embeddings = []
		//let fragments = []
		//if (Array.isArray(files)) {
			//files.forEach(function(file) {
				//if (file && Array.isArray(file.embeddings)) {
					//embeddings = [...embeddings,...file.embeddings]
					//if (file && Array.isArray(file.fragments)) {
						//fragments = [...fragments,...file.fragments]
					//}
				//}
			//})
		//}
		//// Index embeddings with voy
		//const resource = { embeddings: embeddings.map(({ result }, i) => ({
		  //id: String(i),
		  //title: fragments[i],
		  //url: `/path/${i}`,
		  //embeddings: result,
		//})) };
		//console.log("CREATE VOY from files", resource)
		//const index = new Voy(resource);
		//return index
    // }
    
	// function search(text, files) {}
	//   const similarities = this.objects
	//   .filter((object) =>
	//     Object.keys(filter).every((key) => object[key] === filter[key]),
	//   )
	//   .map((obj) => ({
	//     similarity: cosineSimilarity(queryEmbedding, obj.embedding),
	//     object: obj,
	//   }));
	
	// // Sort by similarity and return topK results
	// return similarities
	//   .sort((a, b) => b.similarity - a.similarity)
	//   .slice(0, topK);
	// }

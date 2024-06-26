import {React, useState, useRef, useEffect} from 'react'
import {Button, ButtonGroup, Modal, ListGroup, Form, Tabs, Badge} from 'react-bootstrap'
import CategoriesSelectorModal from './CategoriesSelectorModal'
import FileEditorDialog from './FileEditorDialog'
import useIcons from '../useIcons'
import {Link  } from 'react-router-dom'
import GoogleDriverPickerButton from './GoogleDriverPickerButton'

export default function FileList({files, fileManager, categoryFilter, setCategoryFilter, mini, categories, onChange, handleClose, forceRefresh, exportDocument, utils}) {
//{onChange, chatHistoryId, roles,deleteRole, setRoles, loadRole, importRoles, exportRoles, newRole, mini, handleClose, setCurrentRole, setCurrentTeam,  categories, duplicateRole, forceRefresh, categoryFilter, setCategoryFilter}) {
	const icons = useIcons()
	const [search, setSearch] = useState('')
	const [searchType, setSearchType] = useState('vector')
	const [filtered, setFilteredI] = useState([])
	function setFiltered(i) {
		setFilteredI(i)
		console.log("SETFILTERED",i)
	}
	// const [vectorFiltered, setVectorFiltered] = useState([])
	const filterChangeTimeout = useRef()
	const hiddenInput = useRef()
	const [previewFile, setPreviewFile] = useState('')
	
	function onFilterChange() {
		clearTimeout(filterChangeTimeout.current)
		filterChangeTimeout.current = setTimeout(function() {
			updateFiltered()
		},1000)
	}
	// console.log("FM",fileManager)
	useEffect(function() {
		onFilterChange()
	},[search, searchType])
	
	function updateFiltered() {
		console.log("update filtered",searchType, files)
		if (searchType === 'vector') {
			if (files && search && search.trim()) {
				fileManager.searchVectorFiles(search, files).then(function(results)  {
					console.log("VEERCTOR RES",results)
					setFiltered(Object.values(results))
					// forceRefresh()
				})
			} else {
				setFiltered(files)
			}
		}
		// else { 
		// 	if (files) {
		// 		setFiltered(files.filter(searchFilterFunction).sort(sortFunction))
		// 	}
		// }
	}
	
	function preview(file) {
		fileManager.load(file.id).then(function(loadedFile) {
				setPreviewFile(loadedFile)
		})
	}
			
	function addFiles(documents) {
		console.log('addf',documents)
		let promises = []
		if (Array.isArray(documents)) {
			documents.forEach(function(doc) {
				promises.push(fileManager.save(doc))
			})
		}
		console.log('addf',promises)
		Promises.all(promises).then(function(files) {
			console.log("saved", files)
			files.forEach(function(f) {
				files.push(f)
			})
			console.log('addf DONE',files)
			fileManager.setFiles(files)
			forceRefresh()
		})
		
	}
	
	
	function searchFilterFunction(file) {
		if (!file) return false 
		if (file.deleted) {
			return false 
		}
		//console.log("S",file, search, categoryFilter)
		if (search.trim().length === 0) {
			let allowCategory = true
			if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
				categoryFilter.forEach(function(f) {
					if (!(Array.isArray(file.category) && file.category.indexOf(f) !== -1)) {
						allowCategory = false
					} 
				})
				return allowCategory
			} else {
				return true
			}
		} else {
			if (file && file.name && file.name.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1) {
				let allowCategory = true
				if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
					categoryFilter.forEach(function(f) {
						if (!(Array.isArray(file.category) && file.category.indexOf(f) !== -1)) {
							allowCategory = false
						} 
					})
					return allowCategory
				} else {
					return true
				}
				return true
			} else {
				return false
			}
		}
	}
	
	function sortFunction(a,b) {
		//console.log('s',roles[a].category, roles[b].category)
		if (!a.name) {
			return -1
		} else if (!b.name) {
			return 1
		} else if (a.name.trim() < b.name.trim()) {
			//console.log("neg")
			return -1
		} else if (a.name.trim() > b.name.trim()) {
			//console.log("pos")
			return 1
		} else if (a.name.trim() === b.name.trim()) {
			return 0
		}
		//else {
			//if (a.name < b.name) {
				//return -1
			//} else if (a.name > b.name) {
				//return 1
			//}
		//}
	}
	
	function handleClose() {
		setPreviewFile('')
	}
	
	if (previewFile) {
		return <Modal dialogClassName="fullwidthmodal"
			show={true}
			onHide={handleClose}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>Preview - {previewFile.name}</Modal.Title>
			  
			</Modal.Header>
			<Modal.Body style={{minHeight:'50em'}}>
			<pre>
			{previewFile.data}
			</pre>
			</Modal.Body>
			
		  </Modal>
	} else {
		
		return (
			<>
				{!fileManager.isBusy && <span style={{marginLeft:'1em', border:'1px solid green', float:'right', width: '18em', height:'3em', padding:'0.5em', borderRadius:'5px', marginBottom:'0.5em'}} >
					<b style={{marginRight:'1.5em'}} >Add Files</b>
					{!mini && <ButtonGroup>
						<span style={{marginRight:'1em', width:'4em', overflow:'hidden', float:'right'}} ><input multiple={true} type='file'  className='custom-file-input-button' accept={(fileManager && Array.isArray(fileManager.allowMimeTypes)) ? fileManager.allowMimeTypes.join(",") : '*'}  onChange={fileManager.filesSelected} /></span>
						<Button variant="outline-success" size="sm"  onClick={fileManager.pasteFiles} >{icons.filecopy}</Button>
						<GoogleDriverPickerButton exportDocument={exportDocument} icons={icons} onSelect={function(documents) {
							addFiles(documents)
						}} />
					</ButtonGroup>}
				</span>}
				{fileManager.isBusy && <span style={{marginLeft:'1em', border:'1px solid green', float:'right', width: '18em', height:'3em', padding:'0.5em', borderRadius:'5px', marginBottom:'0.5em'}} >
					<b><img style={{height:'2em'}} src="/spinner.svg" /></b>
				</span>}
				
				
				
				
				<Form.Control style={{width:'40%', float:'left', marginLeft:'1em'}} placeholder="Search" type="search" value={search} onChange={function(e) {setSearch(e.target.value)}} />
				
				{<span style={{float:'left', marginLeft:'1em'}} ><CategoriesSelectorModal  allowNew={false} value={categoryFilter} onChange={function(e) {setCategoryFilter(e)}}  defaultOptions={categories ? Object.keys(categories) : []} /></span>}
				  
				  <div style={{clear:'both', marginBottom:'0.4em'}} />
				  <ListGroup >
					  {filtered.map(function(file, fileKey) {
						return mini ? 
							<span>
								<ListGroup.Item key={fileKey} >
									<Button onClick={function() {onChange(fileKey)}} variant="outline-primary" style={{ textAlign:'left'}}  > {file.name} </Button>
									<div style={{clear:'both', marginTop:'0.5em'}}   >{Array.isArray(file.category) && file.category.map(function(c) {
											return <Badge variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{marginLeft:'0.2em'}} >{c}</Badge>
									})	
									}</div>
								</ListGroup.Item>
								
								
							</span>
							:
							<div key={fileKey} style={{borderTop:'1px solid black', marginTop:'0.5em'}} >
								<div style={{padding:'0.1em', marginTop:'0.3em'}} >
									<ButtonGroup style={{float:'left'}}>
										<FileEditorDialog fileManager={fileManager} name={file.name} id={file.id} onChangeName={function(e) {file.name = e; fileManager.save(file)}} onChangeData={function(e) {file.data = e; fileManager.save(file)}} />
										<CategoriesSelectorModal blockDeselectAll={true} allowNew={false} value={file.category} onChange={function(e) {file.category = e; fileManager.save(file)}}  defaultOptions={categories ? Object.keys(categories) : []} />
										<Button variant="outline-primary" style={{ textAlign:'left'}}  onClick={function() {preview(file)}} >{file && file.name} </Button>
									</ButtonGroup>
									<ButtonGroup style={{float:'right', marginLeft:'0.3em'}} >
										<Button  variant="danger" onClick={function() {fileManager.deleteFile(files[fileKey])}} >{icons.bin}</Button>
										
									</ButtonGroup>
									
									<span style={{clear:'both'}}  >{file && Array.isArray(file.category) && file.category.map(function(c) {
										return <Badge variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{ float:'right', marginLeft:'0.2em'}} >{c}</Badge>
									})	}</span>
									{Array.isArray(file.matches) && <div style={{clear:'both'}}>{file.matches.map(function(m) {
										return  <div>{m.fragment.slice(0,80)}{m.fragment.length > 80 ? '...' : ''}</div>
									})}</div>}
								</div>
								
							</div> 
					  })}
					  
					</ListGroup>
			</>
		)
	}	
}
{/* <Form.Select
				  style={{width:'12em', marginLeft:'0.3em', float:'left'}} 
						  value={searchType}
						  onChange={function(e) {setSearchType(e.target.value)}}
						>
							<option value="string" >Name Match</option>
							<option value="vector"  >Vector Similarity</option>
						</Form.Select> */}
import {React, useState, useRef, useEffect} from 'react'
import {Button, ButtonGroup, Modal, ListGroup, Form, Tabs, Badge, Row, Col, FormCheck} from 'react-bootstrap'
import CategoriesSelectorModal from './CategoriesSelectorModal'
import FileEditorDialog from './FileEditorDialog'
import useIcons from '../useIcons'
import {Link  } from 'react-router-dom'
import GoogleDriverPickerButton from './GoogleDriverPickerButton'
import FileSelectorModal from './FileSelectorModal'

export default function FileList(props) {
	const {isFileManagerWaiting, setIsFileManagerWaiting, config, files, fileManager, categoryFilter, setCategoryFilter, mini, categories,value, onChange, handleClose, forceRefresh, exportDocument, getDocument,utils} = props
//{onChange, chatHistoryId, roles,deleteRole, setRoles, loadRole, importRoles, exportRoles, newRole, mini, handleClose, setCurrentRole, setCurrentTeam,  categories, duplicateRole, forceRefresh, categoryFilter, setCategoryFilter}) {
// console.log("FL",isFileManagerWaiting)	
const icons = useIcons()
	const [search, setSearch] = useState('')
	const [filtered, setFilteredI] = useState([])
	
	function setFiltered(i) {
		setFilteredI(i)
		// console.log("SETFILTERED",i)
	}
	// console.log("FFaa",value)
	// const [vectorFiltered, setVectorFiltered] = useState([])
	const filterChangeTimeout = useRef()
	const hiddenInput = useRef()
	const [previewFile, setPreviewFile] = useState('')
	
	function onFilterChange() {
		clearTimeout(filterChangeTimeout.current)
		filterChangeTimeout.current = setTimeout(function() {
			updateFiltered()
		},500)
	}
	// console.log("FM",fileManager)
	useEffect(function() {
		onFilterChange()
	},[search, value, files])
	
	function updateFiltered() {
		// console.log("update filtered",files)
		if (files && search && search.trim().length > 2) {
			fileManager.searchVectorFiles(search, files).then(function(results)  {
				// console.log("VEERCTOR RES",results)
				setFiltered(Object.values(results).filter(filterFunction))
				// forceRefresh()
			})
		} else {
			let filtered = files.filter(filterFunction)
			// console.log("update filtered ff",filtered)
			setFiltered(filtered)
		}
	
	}
	

	function filterFunction(file) {
		if (!file) return false 
		if (file.deleted) {
			return false 
		}
		let allowCategory = true
		if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
			categoryFilter.forEach(function(f) {
				if (!(Array.isArray(file.category) && file.category.indexOf(f) !== -1)) {
					allowCategory = false
				} 
			})
			return allowCategory
		}
		let allowId = true
		// console.log("FF",value)
		if (Array.isArray(value)) {
			if (value.indexOf(file.id) === -1) {
				allowId = false
			}
		}
		return allowId && allowCategory
	}




	function preview(file) {
		fileManager.load(file.id).then(function(loadedFile) {
				setPreviewFile(loadedFile)
		})
	}
			
	function addFiles(documents) {
		return fileManager.addFiles(documents)
	}
	
	
	function saveFile(file) {
		return fileManager.save(file)
	}

	function pasteFiles() {
		return fileManager.pasteFiles(onChange, value)
	}

	function deleteFile(file) {
		// console.log('delete file', file, value)
		if (Array.isArray(value)) {
			let items = value.filter(function(v) {
				if (v === file.id) {
					return false
				} else {
					return true
				}
			})
			// console.log('delete link', value, items)
			onChange(items)
		} else {
			// console.log('REALLY delete link', file)
			fileManager.deleteFile(file)
		}	
	}

	function filesSelected(v) {
		return fileManager.filesSelected(v, onChange, value)
	}

	function handleClosePreview() {
		setPreviewFile('')
		if (handleClose) handleClose()
	}

	function setPreviewFileValue(file, field, value) {
		console.log('SPFV',file, field, value)
		setIsFileManagerWaiting(true)
		if (file && field) file[field] = value
		if (config && config.embeddings && config.embeddings.max_length > 0) {
			file.fragments = fileManager.generateFragments(file, config.embeddings.max_length)
		} else {
			file.fragments = fileManager.generateFragments(file)
		}
		saveFile(file)
		setPreviewFile(file)
		setIsFileManagerWaiting(false)
		forceRefresh()
		//preview(file)
	}

	// function savePreviewFile() {
		
	// }
//<Button variant="success" style={{float:'right'}} onClick={savePreviewFile} >Save</Button>
	
	
	if (previewFile) {
		return <Modal dialogClassName="fullwidthmodal"
			show={true}
			onHide={handleClosePreview}
		  >
			<Modal.Header closeButton>
			  <Modal.Title style={{marginRight:'2em'}}>Preview - {previewFile.name}</Modal.Title>
			</Modal.Header>		
			
			<Modal.Body style={{minHeight:'50em'}}>
			<div className="border p-3 mb-3">
			
				{isFileManagerWaiting && <img style={{float:'right', marginRight:'2em', height:'2.4em', width:'2.4em' }} src="/spinner.svg" onClick={function() {setIsFileManagerWaiting(false)}}/>}
				<h5>Chunking</h5>
				<Row className="mb-3">
				<Form.Group as={Col} controlId="openaiKeyee">
						<Form.Label>Embed Whole File</Form.Label>
						<FormCheck
							style={{display:'inline', marginLeft:'0.5em'}} 
							type="checkbox"
							checked={previewFile && previewFile.embed_whole_file==='yes' ? true : false}
							onChange={(e) => {console.log(e); setPreviewFileValue(previewFile, 'embed_whole_file',e.target.checked ? 'yes' : '')}}
						/>
					</Form.Group>
					
					<Form.Group as={Col} controlId="openaiKey">
					<Form.Label>Chunking Strategy{previewFile ? previewFile.chunking_strategy : 'NONE'}</Form.Label>
					<Form.Select  value={previewFile && previewFile.chunking_strategy ? previewFile.chunking_strategy : 'paragraphs'}
						onChange={(e) => {setPreviewFileValue(previewFile, 'chunking_strategy',e.target.value);}} >
							<option value="" ></option>
							<option value="paragraphs" >Paragraphs</option>
							<option value="sentences"  >Sentences</option>
							<option value="lines"  >Lines</option>
							<option value="html"  >HTML</option>
							<option value="xml"  >XML</option>
							<option value="json"  >JSON</option>
							<option value="markdown"  >Markdown</option>
							<option value="abc"  >ABC</option>
							<option value="wikimedia"  >WikiMedia</option>
						</Form.Select>
					</Form.Group>
					
					<Form.Group as={Col} controlId="openaiKey">
					<Form.Label>Max Chunk Size</Form.Label>
					<Form.Control  type='text' value={previewFile && previewFile.max_chunk_size ? previewFile.max_chunk_size : fileManager.maxFragmentSizeFromEmbedder()}
						onChange={(e) => {setPreviewFileValue(previewFile, 'max_chunk_size',e.target.value);}} />
					</Form.Group>
					
					{(previewFile && previewFile.chunking_strategy === 'sentences') && <Form.Group as={Col} controlId="openaiKey">
					<Form.Label>Sentence Overlap</Form.Label>
					<Form.Control  type='text' value={previewFile && previewFile.sentence_overlap ? previewFile.sentence_overlap : ''}
						onChange={(e) => {setPreviewFileValue(previewFile, 'sentence_overlap',e.target.value);}} />
					</Form.Group>}

					{(previewFile && (previewFile.chunking_strategy === 'html' || previewFile.chunking_strategy === 'xml'|| previewFile.chunking_strategy === 'markdown')) && <Form.Group as={Col} controlId="openaiKey">
					<Form.Label>CSS Selector</Form.Label>
					<Form.Control  type='text' value={previewFile && previewFile.css_selector ? previewFile.css_selector : ''}
						onChange={(e) => {setPreviewFileValue(previewFile, 'css_selector',e.target.value);}} />
					</Form.Group>}

					{(previewFile && previewFile.chunking_strategy === 'json') && <Form.Group as={Col} controlId="openaiKey">
					<Form.Label>JSONPath Selector</Form.Label>
					<Form.Control  type='text' value={previewFile && previewFile.json_selector ? previewFile.json_selector : ''}
						onChange={(e) => {setPreviewFileValue(previewFile, 'json_selector',e.target.value);}} />
					</Form.Group>}

					
				</Row>
			</div>
			
			<h3>Fragments</h3>
				{Array.isArray(previewFile.fragments) && <div>{previewFile.fragments.map(function(f) {return <div style={{borderBottom:'1px solid black'}}>{f}</div>})}</div>}
			<br/><br/>
			<h3>Raw Data</h3>
			<pre>
			{previewFile.data}
			</pre>
			</Modal.Body>
			
		  </Modal>
	} else {
		
		return (
			<>
				{!(isFileManagerWaiting) && <span style={{marginLeft:'0.3em', border:'1px solid green', float:'right', width: '21em', height:'3em', padding:'0.5em', borderRadius:'5px', marginBottom:'0.5em'}} >
					<b style={{marginRight:'1.5em'}} >Add Files</b>
					{!mini && <ButtonGroup>
						<span style={{marginRight:'1em', width:'4em', overflow:'hidden', float:'right'}} ><input multiple={true} type='file'  className='custom-file-input-button' accept={(fileManager && Array.isArray(fileManager.allowMimeTypes)) ? fileManager.allowMimeTypes.join(",") : '*'}  onChange={filesSelected} /></span>
						{Array.isArray(value) && <FileSelectorModal {...props} />}
						<Button variant="outline-success" size="sm"  onClick={pasteFiles} >{icons.clipboard}</Button>
						<GoogleDriverPickerButton getDocument={getDocument} exportDocument={exportDocument} icons={icons} onSelect={function(documents) {
							addFiles(documents)
						}} />
					</ButtonGroup>}
				</span>}
				{(isFileManagerWaiting) && <span style={{marginLeft:'1em', border:'1px solid green', float:'right', width: '18em', height:'3em', padding:'0.5em', borderRadius:'5px', marginBottom:'0.5em'}} >
					<b><img style={{height:'2em'}} src="/spinner.svg"  onClick={function() {setIsFileManagerWaiting(false)}} /></b>
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
									<div style={{clear:'both', marginTop:'0.5em'}}   >{Array.isArray(file.category) && file.category.map(function(c, ck) {
											return <Badge key={ck} variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{marginLeft:'0.2em'}} >{c}</Badge>
									})	
									}</div>
								</ListGroup.Item>
							</span>
							:
							<div key={fileKey} style={{borderTop:'1px solid black', marginTop:'0.5em'}} >
								<div style={{padding:'0.1em', marginTop:'0.3em'}} >
									<ButtonGroup style={{float:'left'}}>
										<FileEditorDialog fileManager={fileManager} name={file.name} id={file.id} onChangeName={function(e) {file.name = e; saveFile(file)}} onChangeData={function(e) {file.data = e; fileManager.save(file)}} />
										<CategoriesSelectorModal blockDeselectAll={true} allowNew={false} value={file.category} onChange={function(e) {file.category = e; saveFile(file)}}  defaultOptions={categories ? Object.keys(categories) : []} />
										<Button variant="outline-primary" style={{ textAlign:'left'}}  onClick={function() {preview(file)}} >{file && file.name} </Button>
									</ButtonGroup>
									<ButtonGroup style={{float:'right', marginLeft:'0.3em'}} >
										<Button  variant="danger" onClick={function() {deleteFile(file)}} >{icons.bin}</Button>
										
									</ButtonGroup>
									
									<span style={{clear:'both'}}  >{file && Array.isArray(file.category) && file.category.map(function(c, ck) {
										return <Badge key={ck} variant="secondary" size="sm" onClick={function(e) {setCategoryFilter([c]); e.stopPropagation(); return false}} bg="secondary" style={{ float:'right', marginLeft:'0.2em'}} >{c}</Badge>
									})	}</span>
									{(search && search.trim().length > 2 && Array.isArray(file.matches)) && <div style={{clear:'both'}}>{file.matches.map(function(m) {
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
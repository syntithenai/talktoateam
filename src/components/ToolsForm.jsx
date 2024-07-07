import React, { useState, useEffect } from 'react';
import { Button, Form, Col, Row, InputGroup } from 'react-bootstrap';
import TextareaAutosize from 'react-textarea-autosize';

const ToolsForm = ({ tools, setTools , icons, filter}) => {
  // const [tools, setToolsInner] = useState(value || []);
  // function setTools(v) {
  //   setToolsInner(v)
  //   onChange(v)
  // }
  const [activeTool, setActiveTool] = useState(null)
  
  // useEffect(() => {
  //   onChange(tools);
  // }, [tools, onChange]);

  const handleToolChange = (index, field, value) => {
    const updatedTools = tools.map((tool, i) => 
      i === index ? { ...tool, [field]: value } : tool
    );
    setTools(updatedTools);
  };

  const handleArgumentChange = (toolIndex, argIndex, field, value) => {
    const updatedTools = tools.map((tool, i) => 
      i === toolIndex 
        ? { ...tool, arguments: tool.arguments.map((arg, j) => 
            j === argIndex ? { ...arg, [field]: value } : arg
          ) }
        : tool
    );
    setTools(updatedTools);
  };

  const addTool = () => {
    setTools([{ name: '', arguments: [] }, ...tools]);
  };

  const deleteTool = (index) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const addArgument = (toolIndex) => {
    const updatedTools = tools.map((tool, i) => 
      i === toolIndex 
        ? { ...tool, arguments: [...tool.arguments, { name: '', type: '' }] }
        : tool
    );
    setTools(updatedTools);
  };

  const deleteArgument = (toolIndex, argIndex) => {
    const updatedTools = tools.map((tool, i) => 
      i === toolIndex 
        ? { ...tool, arguments: tool.arguments.filter((_, j) => j !== argIndex) }
        : tool
    );
    setTools(updatedTools);
  };

  return (
    <Form>
       <Button variant="success" onClick={addTool} style={{float:'right', marginRight:'1em'}}>{icons.plus}</Button>
          
      {Array.isArray(tools) && tools.filter(function(a) {
        if (!filter) {
          return true
        } else {
          if (a.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
            return true
          } else {
            return false
          }
        }
      }).map((tool, toolIndex) => (
        <div key={toolIndex} className="mb-3" style={{border:'1px solid darkblue', padding:'1em', margin:'1em', borderRadius:'20px'}} >
          <Row   className="align-items-center" style={{backgroundColor:'#ffc9f2', padding:'0.5em'}}>
            {!tool.no_delete && <Col xs="auto">
              <Button variant="danger" onClick={() => {if (window.confirm('Really delete ?')) {deleteTool(toolIndex)}}}>{icons.bin}</Button>
            </Col>}
            <Col>
              <Form.Group controlId={`toolName-${toolIndex}`}>
                <Form.Label onClick={function() {if (activeTool === toolIndex) {setActiveTool(null);} else { setActiveTool(toolIndex);}}}  ><Button variant="outline-secondary" >{icons['arrow-down']}</Button> Tool Name</Form.Label>
                <Form.Control
                  type="text"
                  value={tool.name}
                  onChange={(e) => handleToolChange(toolIndex, 'name', e.target.value)}
                />
              </Form.Group>
            </Col>
            
          </Row>
          
          {(activeTool === toolIndex) &&<>
            <Form.Label style={{marginTop:'1em',clear:'both', fontWeight:'bold', display:'block', width:'100%',borderTop:'1px solid black', marginBottom:'1em', marginTop:'1em', paddingTop:'1em' }}><Button variant="success" style={{float:'left'}} onClick={() => addArgument(toolIndex)}>{icons.plus}</Button>&nbsp;&nbsp;&nbsp;Arguments</Form.Label>
              {tool.arguments.map((arg, argIndex) => (
                <Row key={argIndex} className="align-items-center mb-2" style={{backgroundColor:'#ebe4fa', padding:'0.5em'}}>
                  <Col>
                    <Form.Group controlId={`argName-${toolIndex}-${argIndex}`}>
                      <Form.Label>Argument Name </Form.Label>
                      <Form.Control
                        type="text"
                        value={arg.name}
                        onChange={(e) => handleArgumentChange(toolIndex, argIndex, 'name', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId={`argType-${toolIndex}-${argIndex}`}>
                      <Form.Label>Argument Type </Form.Label>
                      <Form.Control
                        type="text"
                        value={arg.type}
                        onChange={(e) => handleArgumentChange(toolIndex, argIndex, 'type', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col xs="auto">
                    <Button variant="danger" onClick={() => {if (window.confirm('Really delete ?')) {deleteArgument(toolIndex, argIndex)}}}>{icons.bin}</Button>
                  </Col>
                  <Col xs="12">
                    <Form.Group controlId={`argType-${toolIndex}-${argIndex}`}>
                      <Form.Label>Argument Description </Form.Label>
                      <TextareaAutosize 
                      minRows={'1'}
                      style={{width:'100%'}}
                      onChange={(e) => handleToolChange(toolIndex, 'description', e.target.value)}
                      value={tool.description}
                      ></TextareaAutosize>
                    </Form.Group>
                  </Col>
                </Row>
              ))}
              <Row style={{borderTop:'1px solid black', marginBottom:'1em', marginTop:'1em', paddingTop:'1em'}} className="align-items-center">
                <Col>
                  <Form.Group style={{float:'left'}} controlId={`toolName-${toolIndex}`}>
                    <Form.Label>Type </Form.Label>
                    <Form.Select
                      style={{width:'14em', display:'inline', marginLeft:'2em'}} 
                      value={tool.code_type}
                      onChange={(e) => handleToolChange(toolIndex, 'code_type', e.target.value)}
                    >
                      <option  value="local"  >Local Javascript</option>
                      <option value="remote" >Remote Code Server</option>
                    </Form.Select>
                  </Form.Group>
                  {tool.code_type === 'remote' && <Form.Group  style={{float:'left'}}  controlId={`toolName-${toolIndex}`}>
                    <Form.Label style={{marginLeft:'1em'}}>Language</Form.Label>
                    <Form.Select
                      style={{width:'10em', display:'inline', marginLeft:'2em'}} 
                      value={tool.code_language}
                      onChange={(e) => handleToolChange(toolIndex, 'code_language', e.target.value)}
                    >
                      <option value="remote" >Javascript</option>
                    </Form.Select>
                  </Form.Group>}
                </Col>
                
              </Row>
              <Row className="align-items-center">
                <Col>
                  <Form.Group controlId={`toolName-${toolIndex}`}>
                    <Form.Label >Code </Form.Label>
                    <Form.Label style={{display:'block', clear:'both',fontWeight:'bold'}}>function {tool.name}{"("}{tool.arguments.map(function(t) {return t.name}).join(',')}{") {"}</Form.Label>
                    <TextareaAutosize 
                      minRows={'5'}
                      style={{width:'100%'}}
                      onChange={(e) => handleToolChange(toolIndex, 'code', e.target.value)}
                      value={tool.code}
                      ></TextareaAutosize>
                      <b>{"}"}</b>
                  </Form.Group>
                </Col>
                
              </Row>
          </>}
          
        </div>
      ))}
     
    </Form>
  );
};

export default ToolsForm;

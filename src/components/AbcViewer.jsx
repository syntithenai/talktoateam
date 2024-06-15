import React, { useEffect, useState, useRef } from "react";
import abcjs from "abcjs";
import {Link, useNavigate} from 'react-router-dom'
import {Button , Modal} from 'react-bootstrap'

export default function AbcViewer(props) {
    const navigate = useNavigate()
	
	const gvisualObj = useRef(null)
    const inputEl = useRef()
    function setVisualObj(v) {
      gvisualObj.current = v
    }
    
    function updateOnChange() {
          renderTune()
    }


    // when abc changes, do a full update
    useEffect(() => {
          return updateOnChange()
    }, [props.abc])
   
    useEffect(() => {
        //if (props.mediaController && props.mediaController.checkAudioContext()) {
            return updateOnChange()
    }, [])
    
   

  
  function renderTune(abcTune) {
    if (inputEl) {
      //console.log('RENDER TUNE aa')
      try {
        var renderOptions = {
          add_classes: true,
          responsive: "resize",
          generateDownload: true,
          synth: {el: "#audio"},
        }
        
        var res = abcjs.renderAbc(inputEl.current, props.abc, renderOptions );
            
        var o = res && res.length > 0 ? res[0] : null
        setVisualObj(o)
      } catch (e) {
        console.log('RENDER EXC',e)
      }
   }
  }
 
     return (
      <>
              <span >
                {<div id="abc_music_viewer" ref={inputEl} ></div>}
              </span>
      </>);
    
}


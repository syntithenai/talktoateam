import React, { useEffect, useState, useRef } from "react";
import {marked} from "marked";

export default function MarkdownViewer(props) {
	
	let docRef = useRef()
	
	useEffect(function() {
		if (docRef.current) docRef.current.innerHTML = marked.parse(props.markdown)
	},[props.markdown])
	
     return (
      <div ref={docRef} ></div>
      )
}


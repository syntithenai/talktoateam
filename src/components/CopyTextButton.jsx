import { useState, useRef } from 'react';
import {Button, Overlay} from 'react-bootstrap'


export default function CopyTextButton({text, icons}) {
	const [show, setShow] = useState(false);
	const target = useRef(null);

	return <>
		<Button size="sm"   ref={target}   onClick={function() {
			if (text && text.length > 0) {
				navigator.clipboard.writeText(text); 
				setShow(true); 
				setTimeout(function() {
					setShow(false)
				},2000)
			}
		}} >{icons['filecopy']}</Button>
		<Overlay target={target.current} show={show} placement="left">
        {({
          placement: _placement,
          arrowProps: _arrowProps,
          show: _show,
          popper: _popper,
          hasDoneInitialMeasure: _hasDoneInitialMeasure,
          ...props
        }) => (
          <div
            {...props}
            style={{
              position: 'absolute',
              backgroundColor: 'rgba(255, 100, 100, 0.95)',
              padding: '2px 10px',
              marginRight:'0.5em',
              color: 'white',
              borderRadius: 3,
              ...props.style,
            }}
          >
            Copied {text && text.length} letters
          </div>
        )}
      </Overlay>
	</>
	
}

import React,{useEffect} from 'react'
import {Button} from 'react-bootstrap'

export default function BuyCredit() {
    
    useEffect(function() {
        paypal.HostedButtons({
            hostedButtonId: "2LDBDT4UETPEJ",
        }).render("#paypal-container-2LDBDT4UETPEJ")
        paypal.HostedButtons({
            hostedButtonId: "Y3U7B3HBV6ZTA",
          }).render("#paypal-container-Y3U7B3HBV6ZTA")
    },[])
    let buttonStyle = {border:'2px solid blue', maxWidth:'12em', padding:'0.2em'}
    return <div>
        <h3>Buy Credit</h3> 
        <div style={buttonStyle} >
            <div id="paypal-container-2LDBDT4UETPEJ"></div>
        </div>  
        <div style={buttonStyle} >
            <div id="paypal-container-Y3U7B3HBV6ZTA"></div>
        </div>
        
   

    </div>
}
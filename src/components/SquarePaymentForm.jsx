import * as React from 'react'
import {Link}  from 'react-router-dom'
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';
import {Button, Form, Row, Col } from 'react-bootstrap'
import countries from '../countries.json'; // Import the JSON array


let APPLICATION_ID = import.meta.env.VITE_SQUARE_LIVE_APPLICATION_ID
let LOCATION_ID = import.meta.env.VITE_SQUARE_LIVE_LOCATION_ID

if (import.meta.env.VITE_STAGE === 'dev') {
    APPLICATION_ID = import.meta.env.VITE_SQUARE_SANDBOX_APPLICATION_ID
    LOCATION_ID = import.meta.env.VITE_SQUARE_SANDBOX_LOCATION_ID    
}

export default function SquarePaymentForm ({user, token, exchangeRate, updateCreditBalance}) {
    const [amount, setAmount] = React.useState(0)
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [address, setAddress] = React.useState('')
    const [country, setCountry] = React.useState('')
    const [city, setCity] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [errors, setErrors] = React.useState(null)
    const [isComplete, setIsComplete] = React.useState(false)
    async function createPayment(ptoken, verificationToken) {

        if (ptoken) {
            const body = JSON.stringify({
            locationId: LOCATION_ID,
            sourceId: ptoken.token,
            verificationToken,
            amountMoney: {amount:parseFloat(amount) * 100 , currency:'AUD'},
            idempotencyKey: window.crypto.randomUUID()
            });
        //   
            const paymentResponse = await fetch(import.meta.env.VITE_API_URL + '/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer '+(token ? token.access_token : '')
            },
            body
            })

            if (paymentResponse.ok) {
            let data = await paymentResponse.json();
            console.log(data)
            if (data && data.success === true) {
                setIsComplete(true)
                setErrors(null)
                updateCreditBalance()
            } else {
                setErrors(data.errors.map(function(e) {return e.detail}))
            }
            }
        } else {
            setErrors(['Failed to create card token'])
        }        
        // const errorBody = await paymentResponse.text();
        // throw new Error(errorBody);
      }

    function calculateCredit(aud) {
        let sub_processing_fees =  parseFloat(aud) - (parseFloat(aud) * 0.022)
        return (parseFloat(sub_processing_fees)/exchangeRate).toFixed(2)
    }

    return  <div>
       
        <h3>Buy Credit</h3>
        <div style={{marginBottom:'1em'}}>Purchasing credit gives you quick and easy access to a wide range of language models from various providers as well as our online tools including websearch.</div>
        <div style={{marginBottom:'1em'}}>See the <Link to="/pricing" ><Button>Pricing</Button></Link> page to see what things cost.</div>
        <div style={{marginBottom:'2em'}}>We are currently only able to charge in Australian Dollars.</div>
        <div style={{marginBottom:'2em', fontSize:'1.1em', fontStyle:'italic'}}>How much do you want to spend?.</div>

        <div style={{marginBottom:'1em', paddingBottom:'2em', borderBottom:'2px solid black'}}>
            <Button style={{marginRight:'1em'}}  onClick={function() {setAmount(5); setIsComplete(false)}} >$5 Credit</Button>
            <Button style={{marginRight:'1em'}} onClick={function() {setAmount(10); setIsComplete(false)}} >$10 Credit</Button>
            <Button style={{marginRight:'1em'}} onClick={function() {setAmount(20); setIsComplete(false)}} >$20 Credit</Button>
            <Button style={{marginRight:'1em'}} onClick={function() {setAmount(50); setIsComplete(false)}} >$50 Credit</Button>
            
        </div>
        {amount >0 && <div style={{ padding:'1em',backgroundColor:'lightblue',marginBottom:'1em', paddingBottom:'1em'}}>
        <div>To simplify the pricing for international services, we convert your payment to American Dollars</div>
            <span>Pay for <b>$AUD{parseFloat(amount).toFixed(2)}</b> credit</span>
            <span>, get <b>$USD{calculateCredit(amount)}</b> credit</span>

        </div>}
        {(!isComplete && amount > 0) && <div>
           
            <Form style={{paddingTop:'1em',borderTop:'2px solid black'}}>
                
                <Form.Group>
                <Row>
                    <Col><Form.Label>First Name</Form.Label>
                    <Form.Control type='text' value={firstName} onChange={function(e) {
                        setFirstName(e.target.value)
                    }} /></Col>
                    <Col> <Form.Label>Last Name</Form.Label>
                    <Form.Control type='text' value={lastName} onChange={function(e) {
                        setLastName(e.target.value)
                    }} /></Col>
                </Row>
                
                   
                </Form.Group>
                
                <Form.Group>
                    <Row>
                        <Col>
                            <Form.Label>Address</Form.Label>
                            <Form.Control type='text' value={address} onChange={function(e) {
                                setAddress(e.target.value)
                            }} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Label>City/Town/Locality</Form.Label>
                            <Form.Control type='text' value={city} onChange={function(e) {
                                setCity(e.target.value)
                            }} />
                        </Col>
                        <Col>
                            <Form.Label>Country</Form.Label>
                            <Form.Control as="select" value={country}  onChange={function(e) {
                                setCountry (e.target.value)
                            }} >
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                {country.name}
                                </option>
                            ))}
                            </Form.Control>
                        </Col>
                    </Row>
                    
                            
                           
                            
                </Form.Group>

                <Form.Group>
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control type='text' value={phone} onChange={function(e) {
                        setPhone(e.target.value)
                    }} />
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control type='text' value={email} onChange={function(e) {
                        setEmail(e.target.value)
                    }} />
                </Form.Group>
                    
            
                <Form.Label>Payment Details</Form.Label>
            <PaymentForm
            /**
             * Identifies the calling form with a verified application ID generated from
             * the Square Application Dashboard.
             */
            applicationId = {APPLICATION_ID}
            /**
             * Invoked when payment form receives the result of a tokenize generation
             * request. The result will be a valid credit card or wallet token, or an error.
             */
            cardTokenizeResponseReceived={(token, buyer) => {
                console.info({ token, buyer });
                createPayment(token, buyer ? buyer.token : '')
            }}
            createVerificationDetails={() => ({
                amount: '0.01',
                /* collected from the buyer */
                billingContact: {
                    addressLines: [address],
                    familyName: lastName,
                    givenName: firstName,
                    email: email,
                    country: country,
                    phone: phone,
                    city: city
                },
                currencyCode: 'AUD',
                intent: 'CHARGE'
            })}
            
            locationId={LOCATION_ID}
        >
            <CreditCard />
            
        </PaymentForm>
        </Form>
        </div>}
        {isComplete && <div >
            <h3>Payment Successful</h3>
            <div>Thank you for you payment of ${parseFloat(amount).toFixed(2)}</div>

        </div>}
        <>{(Array.isArray(errors) && errors.length > 0) && <div style={{fontWeight:'bold', color:'red'}}>{errors.map(function(e) {return <div>{e}</div>})}</div>}</>
        
        <><br/><br/><br/><br/></>
    </div>

}


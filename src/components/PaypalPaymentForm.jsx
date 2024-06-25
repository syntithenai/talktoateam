// App.js
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PaypalPaymentForm() {
    function createOrder() {
        return fetch("/my-server/create-paypal-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product ids and quantities
            body: JSON.stringify({
                cart: [
                    {
                        id: "YOUR_PRODUCT_ID",
                        quantity: "YOUR_PRODUCT_QUANTITY",
                    },
                ],
            }),
        })
        .then((response) => response.json())
        .then((order) => order.id);
    }
    function onApprove(data) {
        return fetch("/my-server/capture-paypal-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            orderID: data.orderID
        })
        })
        .then((response) => response.json())
        .then((orderData) => {
            const name = orderData.payer.name.given_name;
            alert(`Transaction completed by ${name}`);
        });

    
    }
    let clientId = import.meta.env.VITE_PAYPAL_LIVE_CLIENT_ID 
    if (import.meta.env.DEV) {
        clientId = import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID 
    }
    return (
        <PayPalScriptProvider options={{ clientId: clientId}}>
            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </PayPalScriptProvider>
    );
}
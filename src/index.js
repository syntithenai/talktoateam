import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import nlp from 'compromise'
import plg from 'compromise-stats'
import dplg from 'compromise-dates'
import splg from 'compromise-speech'
nlp.plugin(plg)
nlp.plugin(splg)
nlp.plugin(dplg)

// for tools
window.compromise = nlp
window.nlp = nlp

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App nlp={nlp} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

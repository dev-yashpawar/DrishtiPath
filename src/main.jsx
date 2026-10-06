import React from 'react';import {createRoot} from 'react-dom/client';import {BrowserRouter} from 'react-router-dom';import App from './App';import {LanguageProvider} from './context';import './styles.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><LanguageProvider><App/></LanguageProvider></BrowserRouter></React.StrictMode>);
if(import.meta.env.PROD&&'serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(console.error));

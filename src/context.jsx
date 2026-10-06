import {createContext,useContext,useState,useEffect} from 'react';
const LanguageContext=createContext();
export function LanguageProvider({children}){const [language,setLanguage]=useState(localStorage.getItem('dp-language')||'en');useEffect(()=>{document.documentElement.lang=language;},[language]);const change=value=>{setLanguage(value);localStorage.setItem('dp-language',value);};const t=(en,hi)=>language==='hi'?hi:en;return <LanguageContext.Provider value={{language,setLanguage:change,t}}>{children}</LanguageContext.Provider>;}
export const useLanguage=()=>useContext(LanguageContext);

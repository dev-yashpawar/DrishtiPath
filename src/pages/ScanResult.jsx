import {useLocation} from 'react-router-dom';
import {Check,TriangleAlert,ArrowUpRight} from 'lucide-react';
import Button from '../components/Button';
import SectionLabel from '../components/SectionLabel';
import ConfidenceBadge from '../components/ConfidenceBadge';
import {useLanguage} from '../context';
export default function ScanResult(){
 const {t}=useLanguage();const {state}=useLocation();let saved;
 try{saved=JSON.parse(sessionStorage.getItem('dp-result'));}catch{}
 const result=state?.result||saved;
 if(!result)return <div className="container section"><h1>{t('Start with a photo.','फ़ोटो से शुरुआत करें।')}</h1><Button to="/scan">{t('Open scanner','स्कैनर खोलें')}</Button></div>;
 const low=!result.location||result.confidence<.65;
 return <div className="container section result-page">
  <SectionLabel>{low?t('LOCATION UNCERTAIN','स्थान अनिश्चित'):t('PROBABLE LOCATION','संभावित स्थान')}</SectionLabel>
  <div className={`result-card panel ${low?'uncertain':''}`}>
   <div><span className="mono">{low?t('ANOTHER PHOTO WILL HELP','एक और फ़ोटो मदद करेगी'):t('PROBABLE LOCATION','संभावित स्थान')}</span>
    <h1>{low?<>{t('Let’s get a','एक और')}<br/><em>{t('clearer picture.','साफ़ फ़ोटो लें।')}</em></>:<>{result.location.name}</>}</h1>
    <p>{low?t('We couldn’t confidently determine your location. Please photograph a clearer landmark.','आपका स्थान विश्वास के साथ नहीं पहचाना जा सका। कृपया स्पष्ट स्थल की फ़ोटो लें।'):t('This is a probable visual match. Confirm your position with official signs and on-site staff.','यह संभावित दृश्य मिलान है। आधिकारिक संकेतों और स्थानीय कर्मचारियों से पुष्टि करें।')}</p>
   </div><ConfidenceBadge confidence={result.confidence}/>
  </div>
  {low?<div className="panel result-details"><h3><TriangleAlert/>{t('Try photographing','इनकी फ़ोटो लें')}</h3>{result.possibleMatches?.length>0&&<div className="possible-matches"><span className="mono">POSSIBLE MATCHES — NOT CONFIRMED</span>{result.possibleMatches.map(item=><p key={item.id}>{item.name} · {Math.round(item.score*100)}%</p>)}</div>}<div className="grid three">{[['Gate number','गेट नंबर'],['Sector board','सेक्टर बोर्ड'],['Ghat name','घाट का नाम'],['Police booth','पुलिस सहायता केंद्र'],['Medical booth','चिकित्सा केंद्र'],['Large directional sign','बड़ा दिशा बोर्ड']].map(([en,hi])=><p key={en}>→ {t(en,hi)}</p>)}</div><Button to="/scan">{t('Take another photo','एक और फ़ोटो लें')}</Button></div>:<div className="panel result-details"><SectionLabel>{t('DETECTED CLUES','पहचाने गए संकेत')}</SectionLabel><div className="clue-list">{result.detectedClues?.length?result.detectedClues.map(x=><span key={x}><Check size={20}/>{x}</span>):<p>{t('No readable text was found.','कोई पढ़ने योग्य पाठ नहीं मिला।')}</p>}</div><div className="hero-buttons"><Button to={`/map?selected=${result.location.id}&source=scan`}>{t('View nearby on map','नक्शे पर आसपास देखें')}<ArrowUpRight size={20}/></Button><Button secondary to={`/navigate/${result.location.id}`}>{t('Explore destinations','गंतव्य देखें')}</Button><Button secondary to="/scan">{t('Scan again','फिर से स्कैन करें')}</Button></div></div>}
  <p className="fine-print">{result.source==='gemini'?'Gemini · online':result.source==='ollama'?'Gemma via Ollama · local':'Vision analysis'} · {t('Visual location is an estimate. Prototype facilities are unverified; confirm with on-site signage.','दृश्य स्थान एक अनुमान है। नमूना सुविधाएं अप्रमाणित हैं; स्थानीय संकेतों से पुष्टि करें।')}</p>
 </div>;
}

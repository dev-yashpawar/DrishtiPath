import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Camera, Upload, ScanLine, X, ArrowUpRight} from 'lucide-react';
import CameraCapture from './CameraCapture';
import Button from './Button';
import {analyzeImage} from '../services/api';
import {useLanguage} from '../context';

const steps = ['Reading visible text', 'Finding landmarks', 'Matching locations', 'Calculating confidence'];

export default function Scanner({compact=false}) {
  const {t}=useLanguage();
  const navigate=useNavigate();
  const input=useRef(null);
  const [cameraOpen,setCameraOpen]=useState(false);
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(0);
  const [provider,setProvider]=useState('auto');

  useEffect(()=>{
    if(!file){setPreview('');return;}
    const url=URL.createObjectURL(file);
    setPreview(url);
    return()=>URL.revokeObjectURL(url);
  },[file]);
  useEffect(()=>{
    if(!loading)return;
    const timer=setInterval(()=>setStep(value=>Math.min(3,value+1)),900);
    return()=>clearInterval(timer);
  },[loading]);

  function accept(nextFile) {
    setError('');
    if(!nextFile)return;
    if(!['image/jpeg','image/png','image/webp'].includes(nextFile.type)){
      setError(t('Please choose a JPG, PNG or WebP photo.','कृपया JPG, PNG या WebP फ़ोटो चुनें।'));
      return;
    }
    if(nextFile.size>10*1024*1024){
      setError(t('Choose a photo smaller than 10 MB.','10 MB से छोटी फ़ोटो चुनें।'));
      return;
    }
    setFile(nextFile);
  }

  async function analyze() {
    if(!file)return;
    setLoading(true);
    setStep(0);
    setError('');
    try {
      const result=await analyzeImage(file,provider);
      sessionStorage.setItem('dp-result',JSON.stringify(result));
      navigate('/scan/result',{state:{result}});
    } catch(error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className={`scanner panel ${compact?'compact':''}`}>
    <div className="scanner-heading mono"><span><ScanLine size={18}/> {t('VISUAL SCANNER','विज़ुअल स्कैनर')}</span><span className="live-dot">READY</span></div>
    {loading?<div className="scan-loading" role="status" aria-live="polite">
      <ScanLine size={56}/><h3>{t('READING THE SCENE...','दृश्य पढ़ रहे हैं...')}</h3>
      {steps.map((label,index)=><div key={label} className={index<=step?'progress-step done':'progress-step'}><span>0{index+1}</span>{label}<span>{index<step?'✓':index===step?'•••':'—'}</span></div>)}
      <small>{t('Analyzing your photo with a vision model','विज़न मॉडल से फ़ोटो का विश्लेषण हो रहा है')}</small>
    </div>:<>
      <div className={`upload-zone ${preview?'has-preview':''}`} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();accept(event.dataTransfer.files[0]);}}>
        {preview?<><img src={preview} alt="Your surroundings ready for analysis"/><button className="remove-image" aria-label="Remove image" onClick={()=>setFile(null)}><X/></button></>:<><div className="scan-corners"/><div className="camera-icon"><Camera size={44} strokeWidth={1.5}/></div><h3>{t('A little lost? Look around.','रास्ता भूल गए? आसपास देखें।')}</h3><p>{t('Take or upload a photo','फ़ोटो लें या अपलोड करें')}</p><span className="mono">JPG, PNG, WEBP · UP TO 10 MB</span></>}
      </div>
      <input hidden type="file" ref={input} accept="image/jpeg,image/png,image/webp" onChange={event=>{accept(event.target.files[0]);event.target.value='';}}/>
      <div className="scanner-actions"><Button onClick={()=>{setError('');setCameraOpen(true);}}><Camera size={20}/>{t('Open camera','कैमरा खोलें')}</Button><Button secondary onClick={()=>input.current?.click()}><Upload size={20}/>{t('Upload image','फ़ोटो अपलोड करें')}</Button></div>
      <p className="clues">Signboards · Gates · Ghats · Camps · Help booths</p>
      {file&&<div className="analyze-controls"><label className="mono">{t('VISION MODEL','विज़न मॉडल')}<select value={provider} onChange={event=>setProvider(event.target.value)}><option value="auto">{t('Automatic · Gemini / Ollama','स्वचालित · Gemini / Ollama')}</option><option value="gemini">Gemini · online</option><option value="ollama">Gemma via Ollama · local</option></select></label><Button onClick={analyze} className="full"><ScanLine size={20}/>{t('Identify my location','मेरा स्थान पहचानें')}<ArrowUpRight size={20}/></Button></div>}
    </>}
    {cameraOpen&&<CameraCapture onClose={()=>setCameraOpen(false)} onCapture={photo=>{accept(photo);setCameraOpen(false);}}/>}
    {error&&<p className="error" role="alert">{error}</p>}
    <div className="scanner-meta"><div><span className="mono">ONLINE AI</span><b>Gemini vision</b></div><div><span className="mono">LOCAL AI</span><b>Gemma via Ollama</b></div></div>
  </div>;
}

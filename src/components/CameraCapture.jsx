import {useEffect,useRef,useState} from 'react';
import {Camera,X} from 'lucide-react';
import Button from './Button';
import {useLanguage} from '../context';

export default function CameraCapture({onCapture,onClose}) {
 const {t}=useLanguage();
 const video=useRef(null),dialog=useRef(null);
 const [status,setStatus]=useState('requesting');
 const [error,setError]=useState('');
 const [capturing,setCapturing]=useState(false);
 const callbacks=useRef({onCapture,onClose,t});
 callbacks.current={onCapture,onClose,t};
 const active=useRef(false);

 useEffect(()=>{
  let cancelled=false,stream=null;
  active.current=true;
  const previousFocus=document.activeElement;
  dialog.current?.querySelector('button')?.focus();
  const stop=()=>stream?.getTracks().forEach(track=>track.stop());
  async function start(){
   try {
    if(!window.isSecureContext)throw Object.assign(new Error(),{name:'InsecureContext'});
    if(!navigator.mediaDevices?.getUserMedia)throw Object.assign(new Error(),{name:'UnsupportedCamera'});
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}}});
    if(cancelled){stop();return;}
    const element=video.current;
    element.srcObject=stream;
    await element.play();
    if(!cancelled)setStatus('live');
   } catch (e) {
    stop();
    if(cancelled)return;
    const translate=callbacks.current.t;
    const messages={
     NotAllowedError:translate('Camera access was blocked. Allow camera access in your browser’s site settings, then try again.','कैमरे की अनुमति नहीं मिली। ब्राउज़र की साइट सेटिंग में कैमरे की अनुमति दें और फिर कोशिश करें।'),
     NotFoundError:translate('No camera was found. Connect a camera or upload a photo instead.','कैमरा नहीं मिला। कैमरा जोड़ें या फ़ोटो अपलोड करें।'),
     NotReadableError:translate('The camera could not start. Close other apps using it and try again.','कैमरा शुरू नहीं हो सका। कैमरा इस्तेमाल करने वाले दूसरे ऐप बंद करें और फिर कोशिश करें।'),
     InsecureContext:translate('Camera access needs HTTPS or localhost. Open this app on localhost or a secure HTTPS address.','कैमरे के लिए HTTPS या localhost आवश्यक है। ऐप को सुरक्षित पते पर खोलें।'),
     UnsupportedCamera:translate('This browser does not support live camera access. Open DrishtiPath in Chrome, Edge, Firefox or Safari, or upload a photo.','यह ब्राउज़र लाइव कैमरा नहीं खोल सकता। Chrome, Edge, Firefox या Safari में खोलें, या फ़ोटो अपलोड करें।')
    };
    setError(messages[e.name]||translate('Unable to open the camera. Check your browser and device camera permissions, then try again.','कैमरा नहीं खुला। ब्राउज़र और डिवाइस की कैमरा अनुमति जाँचें।'));
    setStatus('error');
   }
  }
  const keydown=e=>{
   if(e.key==='Escape'){callbacks.current.onClose();return;}
   if(e.key!=='Tab')return;
   const controls=dialog.current?.querySelectorAll('button:not(:disabled),a[href]');
   if(!controls?.length)return;
   const first=controls[0],last=controls[controls.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',keydown);
  start();
  return ()=>{
   cancelled=true;active.current=false;stop();
   if(video.current)video.current.srcObject=null;
   document.removeEventListener('keydown',keydown);
   previousFocus?.focus();
  };
 },[]);

 const capture=()=>{
  const element=video.current;
  if(!element?.videoWidth||!element.videoHeight){setError(t('The camera is still warming up. Try again in a moment.','कैमरा तैयार हो रहा है। थोड़ी देर बाद कोशिश करें।'));return;}
  setCapturing(true);setError('');
  const canvas=document.createElement('canvas');
  const scale=Math.min(1,1600/Math.max(element.videoWidth,element.videoHeight));
  canvas.width=Math.round(element.videoWidth*scale);canvas.height=Math.round(element.videoHeight*scale);
  canvas.getContext('2d').drawImage(element,0,0,canvas.width,canvas.height);
  canvas.toBlob(blob=>{
   if(!active.current)return;
   setCapturing(false);
   if(!blob){setError(t('Could not take a photo. Please try again.','फ़ोटो नहीं ली जा सकी। फिर कोशिश करें।'));return;}
   callbacks.current.onCapture(new File([blob],`drishtipath-camera-${Date.now()}.jpg`,{type:'image/jpeg'}));
  },'image/jpeg',.9);
 };

 return <div className="modal-backdrop camera-backdrop">
  <section ref={dialog} className="camera-dialog panel" role="dialog" aria-modal="true" aria-labelledby="camera-title">
   <div className="modal-heading"><h3 id="camera-title">{t('Your surroundings, live.','आपके आसपास, लाइव।')}</h3><button aria-label={t('Close camera','कैमरा बंद करें')} onClick={onClose}><X/></button></div>
   <div className="camera-feed">
    <video ref={video} autoPlay muted playsInline aria-label={t('Live camera preview','लाइव कैमरा दृश्य')} hidden={status==='error'}/>
    {status==='requesting'&&<div className="camera-request" role="status"><Camera size={40}/><p>{t('Allow camera access in your browser to continue.','आगे बढ़ने के लिए ब्राउज़र में कैमरे की अनुमति दें।')}</p></div>}
   </div>
   {error&&<p className="error" role="alert">{error}</p>}
   <div className="camera-controls"><Button onClick={capture} disabled={status!=='live'||capturing}><Camera size={20}/>{capturing?t('Taking photo...','फ़ोटो ली जा रही है...'):t('Take photo','फ़ोटो लें')}</Button><Button secondary onClick={onClose}>{t('Cancel','रद्द करें')}</Button></div>
   <p className="camera-privacy">{t('Camera only · No microphone · Capture stays here until you analyze it.','केवल कैमरा · माइक्रोफ़ोन नहीं · विश्लेषण तक फ़ोटो यहीं रहती है।')}</p>
  </section>
 </div>;
}

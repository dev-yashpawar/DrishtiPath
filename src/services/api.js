import { mockLandmarks } from '../data/mockLandmarks';
export async function analyzeImage(image,provider='auto'){
 const data=new FormData();data.append('image',image);data.append('provider',provider);data.append('clientOffline',String(!navigator.onLine));
 let response;
 try{response=await fetch('/api/analyze-location',{method:'POST',body:data});}
 catch{throw new Error(import.meta.env.DEV?'Cannot reach the analysis server. Start the backend with npm run dev and try again.':'The analysis service is unavailable. Please try again shortly.');}
 let result;
 try{result=await response.json();}
 catch{throw new Error('The analysis server returned an unreadable response. Please try again.');}
 if(!response.ok)throw new Error(result.error||'Analysis unavailable. Try again.');
 return result;
}
export async function getLandmarks(){try{const r=await fetch('/api/landmarks');if(!r.ok)throw new Error();return await r.json();}catch{return mockLandmarks;}}
export async function saveLandmark(value){const r=await fetch('/api/landmarks'+(value.isNew?'':`/${value.id}`),{method:value.isNew?'POST':'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Could not save landmark.');return data;}

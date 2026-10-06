import {analyzeWithGemini} from './geminiService.js';
import {analyzeWithOllama} from './ollamaService.js';
import {matchLandmark} from './landmarkMatcher.js';
import {getLandmarkRecords} from '../controllers/landmarkController.js';

export async function analyzeLocation(image,{mimeType='image/jpeg',provider='auto',clientOffline=false,gps}={},dependencies={}) {
  if(!image?.length) throw new Error('An image is required.');
  if(!['auto','gemini','ollama'].includes(provider)) throw new Error('Unsupported analysis provider.');
  const gemini=dependencies.gemini || analyzeWithGemini;
  const ollama=dependencies.ollama || analyzeWithOllama;
  const landmarks=dependencies.landmarks || await getLandmarkRecords();
  let clues,source;

  if(provider==='ollama' || (provider==='auto' && (clientOffline || !process.env.GEMINI_API_KEY))) {
    clues=await ollama(image);source='ollama';
  } else if(provider==='gemini') {
    clues=await gemini(image,mimeType);source='gemini';
  } else {
    try { clues=await gemini(image,mimeType);source='gemini'; }
    catch (onlineError) {
      try { clues=await ollama(image);source='ollama'; }
      catch (localError) { throw new Error(`Online and local analysis are unavailable: ${onlineError.message} ${localError.message}`); }
    }
  }
  const {location,confidence,matchedEvidence,possibleMatches}=matchLandmark(clues,landmarks,{gps});
  const detectedClues=[...new Set([...clues.visibleTexts,...clues.normalizedClues,...(clues.visualLandmarkCandidates||[]).map(name=>`Visual hypothesis: ${name}`)])].slice(0,8);
  return {
    success:true,
    source,
    model:source==='gemini'?(process.env.GEMINI_MODEL||'gemini-3.5-flash'):(process.env.OLLAMA_MODEL||'gemma3:4b'),
    location:location?{id:location.id,name:location.name,sector:location.sector,gate:location.gate,latitude:location.latitude,longitude:location.longitude,isMock:location.isMock}:null,
    confidence,
    detectedClues,
    matchedEvidence,
    possibleMatches,
    notice:'Estimated match from visual clues. Confirm with official signs and staff.',
  };
}

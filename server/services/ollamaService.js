import {visionPrompt, visionSchema, parseVisionClues} from './visionClues.js';

export async function analyzeWithOllama(image, {fetchImpl=fetch, baseUrl=process.env.OLLAMA_URL || 'http://127.0.0.1:11434', model=process.env.OLLAMA_MODEL || 'gemma3:4b'}={}) {
  const response = await fetchImpl(`${baseUrl.replace(/\/+$/,'')}/api/chat`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model,stream:false,format:visionSchema,options:{temperature:0},messages:[{role:'user',content:visionPrompt,images:[image.toString('base64')]}]}),
    signal:AbortSignal.timeout(120000),
  });
  if(!response.ok){
    const detail=await response.json().catch(()=>({}));
    if(/out.of.memory|failed to allocate|cudaMalloc/i.test(detail.error||'')){
      throw new Error('Local Gemma could not start because this device has insufficient available memory. Free memory or choose Gemini online.');
    }
    if(response.status===404)throw new Error(`Local Gemma model ${model} is not installed. Install it with ollama pull ${model}.`);
    throw new Error(`Ollama request failed (${response.status}). Check that Ollama and ${model} are running.`);
  }
  const payload=await response.json();
  return parseVisionClues(payload.message?.content);
}

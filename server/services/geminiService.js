import {visionPrompt, visionSchema, parseVisionClues} from './visionClues.js';

export async function analyzeWithGemini(image, mimeType, {fetchImpl=fetch, key=process.env.GEMINI_API_KEY, model=process.env.GEMINI_MODEL || 'gemini-3.5-flash'}={}) {
  if (!key?.trim()) throw new Error('Gemini API key is missing. Add GEMINI_API_KEY to .env.');
  const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {'Content-Type':'application/json','x-goog-api-key':key},
    body: JSON.stringify({
      contents: [{role:'user',parts:[
        {text:visionPrompt},
        {inlineData:{mimeType,data:image.toString('base64')}},
      ]}],
      generationConfig:{responseMimeType:'application/json',responseSchema:visionSchema,temperature:0},
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    if(response.status===429)throw new Error('Gemini online is rate-limited. Wait briefly and try again.');
    if(response.status===401||response.status===403)throw new Error('Gemini online rejected the configured API key. Check GEMINI_API_KEY.');
    throw new Error(`Gemini online request failed (${response.status}).`);
  }
  const payload = await response.json();
  const raw = payload.candidates?.[0]?.content?.parts?.find(part => typeof part.text === 'string')?.text;
  return parseVisionClues(raw);
}

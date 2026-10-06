import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server/app.js';
import {matchLandmark} from '../server/services/landmarkMatcher.js';
import {analyzeLocation} from '../server/services/aiService.js';
import {analyzeWithGemini} from '../server/services/geminiService.js';
import {analyzeWithOllama} from '../server/services/ollamaService.js';
import {mockLandmarks} from '../src/data/mockLandmarks.js';
import {calculateDistance,calculateBearing,bearingToDirection} from '../server/utils/geo.js';

const server=app.listen(0,'127.0.0.1');
await new Promise(resolve=>server.once('listening',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
test.after(()=>server.close());
const image=Buffer.from([137,80,78,71,13,10,26,10,0]);
const clues={visibleTexts:['Ramkund'],normalizedClues:[],landmarkType:'ghat'};

test('API returns 15 Nashik landmarks with GeoJSON and mock flags',async()=>{
  const response=await fetch(base+'/api/landmarks');
  assert.equal(response.status,200);
  const items=await response.json();
  assert.equal(items.length,15);
  assert.deepEqual(items.find(item=>item.id==='ramkund-ghat').location.coordinates,[73.79249,20.00726]);
  assert.equal(items.find(item=>item.id==='ramkund-ghat').isMock,false);
  assert.equal(items.find(item=>item.id==='medical-camp-01').isMock,true);
});

test('event and nearby routes filter and order real distances',async()=>{
  const active=await fetch(base+'/api/landmarks/event/nashik-trimbakeshwar');
  assert.equal((await active.json()).length,15);
  const future=await fetch(base+'/api/landmarks/event/prayagraj');
  assert.deepEqual(await future.json(),[]);
  const one=await fetch(base+'/api/landmarks/ramkund-ghat');
  assert.equal((await one.json()).name,'Ramkund Ghat');
  const nearby=await fetch(base+'/api/landmarks/nearby?lat=20.00726&lng=73.79249&radius=1000');
  assert.equal(nearby.status,200);
  const result=await nearby.json();
  assert.equal(result.nearby[0].id,'ramkund-ghat');
  assert.ok(result.nearby.every((item,index)=>index===0||item.distance>=result.nearby[index-1].distance));
  assert.ok(result.nearby.some(item=>item.type==='medical'));
  assert.equal(result.nearby[0].coordinates.lng,73.79249);
  const invalid=await fetch(base+'/api/landmarks/nearby?lat=200&lng=73.7');
  assert.equal(invalid.status,400);
});

test('geo helpers calculate metres and eight-point direction',()=>{
  assert.equal(Math.round(calculateDistance(20,73,20,73)),0);
  assert.equal(bearingToDirection(calculateBearing(20,73,20.001,73.001)),'NE');
});

test('analysis rejects missing or disguised image',async()=>{
  const missing=await fetch(base+'/api/analyze-location',{method:'POST',body:new FormData()});
  assert.equal(missing.status,400);
  const body=new FormData();
  body.append('image',new Blob(['invalid'],{type:'image/png'}),'bad.png');
  const disguised=await fetch(base+'/api/analyze-location',{method:'POST',body});
  assert.equal(disguised.status,400);
});

test('Gemini adapter sends base64 image and parses structured clues',async()=>{
  let request;
  const result=await analyzeWithGemini(image,'image/png',{
    key:'test-key',
    fetchImpl:async(url,options)=>{
      request={url,options};
      return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(clues)}]}}]})};
    },
  });
  assert.deepEqual(result,clues);
  assert.equal(request.options.headers['x-goog-api-key'],'test-key');
  assert.equal(JSON.parse(request.options.body).contents[0].parts[1].inlineData.data,image.toString('base64'));
});

test('Ollama adapter sends image to local chat API and parses clues',async()=>{
  let request;
  const result=await analyzeWithOllama(image,{
    baseUrl:'http://127.0.0.1:11434',model:'gemma3:4b',
    fetchImpl:async(url,options)=>{
      request={url,options};
      return {ok:true,json:async()=>({message:{content:JSON.stringify(clues)}})};
    },
  });
  assert.deepEqual(result,clues);
  assert.equal(request.url,'http://127.0.0.1:11434/api/chat');
  assert.equal(JSON.parse(request.options.body).messages[0].images[0],image.toString('base64'));
});

test('Ollama reports insufficient memory clearly',async()=>{
  await assert.rejects(
    analyzeWithOllama(image,{fetchImpl:async()=>({ok:false,status:500,json:async()=>({error:'cudaMalloc failed: out of memory'})})}),
    /insufficient available memory/,
  );
});

test('auto analysis falls back to Ollama when Gemini fails',async()=>{
  const previous=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY='test-key';
  try{
    const result=await analyzeLocation(image,{provider:'auto'},{
      gemini:async()=>{throw new Error('unavailable');},
      ollama:async()=>clues,
      landmarks:mockLandmarks,
    });
    assert.equal(result.source,'ollama');
    assert.equal(result.location.id,'ramkund-ghat');
    assert.ok(result.confidence>=.65);
  }finally{
    if(previous===undefined)delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY=previous;
  }
});

test('auto analysis explains when both online and local providers fail',async()=>{
  const previous=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY='test-key';
  try{
    await assert.rejects(analyzeLocation(image,{provider:'auto'},{
      gemini:async()=>{throw new Error('Gemini online is rate-limited.');},
      ollama:async()=>{throw new Error('Local Gemma has insufficient available memory.');},
      landmarks:mockLandmarks,
    }),/Online and local analysis are unavailable:.*Gemini online is rate-limited.*Local Gemma has insufficient available memory/);
  }finally{
    if(previous===undefined)delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY=previous;
  }
});

test('ambiguous clues produce no location',async()=>{
  const result=await analyzeLocation(image,{provider:'ollama'},{
    ollama:async()=>({visibleTexts:['Sector 1'],normalizedClues:[],landmarkType:'unknown'}),
    landmarks:mockLandmarks,
  });
  assert.equal(result.location,null);
  assert.ok(result.confidence<.65);
  assert.equal(matchLandmark(clues,mockLandmarks).location.id,'ramkund-ghat');
});

test('distinctive temple hypothesis can match a directory landmark without inventing coordinates',()=>{
  const result=matchLandmark({visibleTexts:[],normalizedClues:[],landmarkType:'temple',visualLandmarkCandidates:['Trimbakeshwar Jyotirlinga Temple']},mockLandmarks);
  assert.equal(result.location?.id,'trimbakeshwar-temple');
  assert.ok(result.confidence>=.65);
  assert.deepEqual(result.location.location.coordinates,[73.53075,19.93213]);
  const generic=matchLandmark({visibleTexts:[],normalizedClues:[],landmarkType:'temple',visualLandmarkCandidates:[]},mockLandmarks);
  assert.equal(generic.location,null);
});

test('admin validates coordinates and supports add, edit, closed status',async()=>{
  const input={name:'Test Water Point',type:'water',sector:'4',gate:'B',latitude:20.01,longitude:73.79,status:'ACTIVE'};
  const invalid=await fetch(base+'/api/landmarks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,latitude:120})});
  assert.equal(invalid.status,400);
  const added=await fetch(base+'/api/landmarks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
  assert.equal(added.status,201);
  const item=await added.json();
  const edit=await fetch(base+'/api/landmarks/'+item.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({...item,status:'CLOSED'})});
  assert.equal(edit.status,200);
  assert.equal((await edit.json()).status,'closed');
});

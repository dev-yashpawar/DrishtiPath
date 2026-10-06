import {calculateDistance} from '../utils/geo.js';

function normalize(value){
  return String(value||'').toLowerCase()
    .replace(/[०-९]/g,digit=>String('०१२३४५६७८९'.indexOf(digit)))
    .replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
function includesPhrase(haystack,needle){
  return Boolean(needle&&` ${haystack} `.includes(` ${needle} `));
}
const genericPlaceWords=new Set(['temple','mandir','area','ghat','gate','entry','jyotirlinga','shrine','the','of']);
function specificWords(value){return normalize(value).split(' ').filter(word=>word.length>=4&&!genericPlaceWords.has(word));}
function visualCandidateMatches(candidate,item){
  if(item.isMock)return false;
  const target=new Set(specificWords(candidate));
  return target.size>0&&[item.name,...(item.aliases||[])].some(alias=>
    specificWords(alias).some(word=>word.length>=6&&target.has(word))
  );
}

export function matchLandmark(clues,landmarks,{gps}={}){
  const visible=clues.visibleTexts||clues.visibleText||[];
  const evidence=[...visible,...(clues.normalizedClues||[])].map(normalize).filter(Boolean);
  const visualCandidates=(clues.visualLandmarkCandidates||[]).map(normalize).filter(Boolean);
  const has=term=>evidence.some(text=>includesPhrase(text,normalize(term)));
  const sector=clues.sector||null,gate=clues.gate||null;
  const type=clues.landmarkType||clues.landmarks?.[0]||'unknown';
  const ranked=landmarks.filter(item=>String(item.status).toLowerCase()==='active').map(item=>{
    const matchedEvidence=[];
    let points=0;
    if([item.name,...(item.aliases||[])].some(alias=>has(alias))){points+=65;matchedEvidence.push('Visible landmark text match');}
    if((type==='unknown'||type===item.type)&&visualCandidates.some(candidate=>visualCandidateMatches(candidate,item))){
      points+=55;matchedEvidence.push('Visual landmark hypothesis matched the directory');
    }
    if(item.sector&&(has(`Sector ${item.sector}`)||String(sector)===String(item.sector))){points+=15;matchedEvidence.push('Sector match');}
    if(item.gate&&(has(`Gate ${item.gate}`)||String(gate).toLowerCase()===String(item.gate).toLowerCase())){points+=15;matchedEvidence.push('Gate match');}
    if(type===item.type){points+=10;matchedEvidence.push('Landmark type match');}
    if(gps&&Number.isFinite(gps.lat)&&Number.isFinite(gps.lng)){
      const distance=calculateDistance(gps.lat,gps.lng,item.latitude,item.longitude);
      if(distance<=500){points+=10;matchedEvidence.push('Nearby GPS position');}
    }
    return {location:item,score:Math.min(points,96)/100,matchedEvidence};
  }).sort((a,b)=>b.score-a.score);
  const [best,second]=ranked;
  const possibleMatches=ranked.filter(candidate=>candidate.score>0).slice(0,3).map(candidate=>({
    id:candidate.location.id,name:candidate.location.name,score:candidate.score,
  }));
  if(!best||best.score<.6||best.score-(second?.score||0)<.15){
    return {location:null,confidence:best?.score||0,matchedEvidence:[],possibleMatches};
  }
  return {location:best.location,confidence:best.score,matchedEvidence:best.matchedEvidence,possibleMatches};
}

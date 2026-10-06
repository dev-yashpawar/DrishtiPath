import Landmark from '../models/Landmark.js';
import {mockLandmarks,EVENT_ID} from '../../src/data/mockLandmarks.js';
import {calculateDistance,calculateBearing,bearingToDirection,formatDistance} from '../utils/geo.js';

let memory=structuredClone(mockLandmarks);
let persistent=false;
export function setPersistence(value){persistent=value;}
export function serialize(doc){
  const item=doc.toObject?doc.toObject():doc;
  const [longitude,latitude]=item.location?.coordinates||[item.longitude,item.latitude];
  return {...item,latitude,longitude,images:item.referenceImages||item.images||[]};
}
export async function getLandmarkRecords(event=EVENT_ID){
  return persistent?(await Landmark.find({event}).lean()).map(serialize):memory.filter(item=>item.event===event).map(serialize);
}
export async function list(req,res,next){
  try{res.json(await getLandmarkRecords());}catch(error){next(error);}
}
export async function listByEvent(req,res,next){
  try{
    if(req.params.eventId!==EVENT_ID)return res.json([]);
    res.json(await getLandmarkRecords(req.params.eventId));
  }catch(error){next(error);}
}
export async function getById(req,res,next){
  try{
    const item=(await getLandmarkRecords()).find(value=>value.id===req.params.id);
    if(!item)return res.status(404).json({error:'Landmark not found for the active Kumbh event.'});
    res.json(item);
  }catch(error){next(error);}
}
export async function nearby(req,res,next){
  try{
    const lat=Number(req.query.lat),lng=Number(req.query.lng),radius=req.query.radius===undefined?5000:Number(req.query.radius);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180||!Number.isFinite(radius)||radius<=0||radius>50000){
      return res.status(400).json({error:'Provide valid lat, lng and radius (1–50,000 metres).'});
    }
    const docs=persistent?await Landmark.find({
      event:EVENT_ID,status:'active',
      location:{$near:{$geometry:{type:'Point',coordinates:[lng,lat]},$maxDistance:radius}},
    }).lean():memory.filter(item=>item.event===EVENT_ID&&item.status==='active');
    const results=docs.map(serialize).map(item=>{
      const distance=calculateDistance(lat,lng,item.latitude,item.longitude);
      return {...item,distance:Math.round(distance),formattedDistance:formatDistance(distance),direction:bearingToDirection(calculateBearing(lat,lng,item.latitude,item.longitude)),coordinates:{lat:item.latitude,lng:item.longitude}};
    }).filter(item=>item.distance<=radius).sort((a,b)=>a.distance-b.distance);
    res.json({currentLocation:{lat,lng},nearby:results});
  }catch(error){next(error);}
}
export async function save(req,res,next){
  try{
    const input=req.body;
    const types=['ghat','temple','gate','medical','police','water','parking','information','entry','landmark','camp','toilet'];
    const latitude=Number(input.latitude),longitude=Number(input.longitude);
    const status=String(input.status||'active').toLowerCase();
    if(typeof input.name!=='string'||!input.name.trim()||!types.includes(input.type)||!['active','closed','inactive'].includes(status)||
      !Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){
      return res.status(400).json({error:'Provide a name, valid type, status and coordinates.'});
    }
    const id=req.params.id||input.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Date.now();
    const existing=(await getLandmarkRecords()).find(item=>item.id===id);
    if(req.method==='PATCH'&&!existing)return res.status(404).json({error:'Landmark not found.'});
    const value={
      id,event:EVENT_ID,name:input.name.trim().slice(0,120),type:input.type,
      city:input.city||existing?.city||'Nashik',sector:String(input.sector||''),gate:String(input.gate||''),
      location:{type:'Point',coordinates:[longitude,latitude]},
      aliases:existing?.aliases||[],visibleTexts:existing?.visibleTexts||[],
      nearbyLandmarks:existing?.nearbyLandmarks||[],referenceImages:existing?.referenceImages||[],
      description:String(input.description||''),status,isMock:existing?.isMock??true,
      illustrationIndex:existing?.illustrationIndex,
    };
    if(persistent){
      if(req.method==='POST')return res.status(201).json(serialize(await Landmark.create(value)));
      return res.json(serialize(await Landmark.findOneAndUpdate({id,event:EVENT_ID},{$set:value},{new:true,runValidators:true})));
    }
    const index=memory.findIndex(item=>item.id===id);
    if(index>=0)memory[index]=value;else memory.push(value);
    res.status(req.method==='POST'?201:200).json(serialize(value));
  }catch(error){next(error);}
}

import {mockLandmarks,EVENT_ID} from '../data/mockLandmarks';
import {distanceMeters,directionFrom,formatDistance} from '../utils/geo';

export async function fetchEventLandmarks(signal){
  try{
    const response=await fetch(`/api/landmarks/event/${EVENT_ID}`,{signal});
    if(!response.ok)throw new Error('Landmark service is unavailable.');
    const landmarks=await response.json();
    if(!Array.isArray(landmarks))throw new Error('Unexpected landmark response.');
    return {landmarks,offline:false};
  }catch(error){
    if(error.name==='AbortError')throw error;
    return {landmarks:mockLandmarks,offline:true,error:'Landmark service is unavailable. Showing bundled prototype points.'};
  }
}
export async function fetchNearby(latitude,longitude,radius=5000,landmarks=mockLandmarks,signal){
  try{
    const query=new URLSearchParams({lat:String(latitude),lng:String(longitude),radius:String(radius)});
    const response=await fetch(`/api/landmarks/nearby?${query}`,{signal});
    if(!response.ok)throw new Error('Nearby service is unavailable.');
    return {...await response.json(),offline:false};
  }catch(error){
    if(error.name==='AbortError')throw error;
    const origin={latitude,longitude};
    const nearby=landmarks.filter(item=>item.status==='active').map(item=>{
      const distance=distanceMeters(origin,item);
      return {...item,distance,formattedDistance:formatDistance(distance),direction:directionFrom(origin,item),coordinates:{lat:item.latitude,lng:item.longitude}};
    }).filter(item=>item.distance<=radius).sort((a,b)=>a.distance-b.distance);
    return {currentLocation:{lat:latitude,lng:longitude},nearby,offline:true,error:'Nearby service is unavailable. Distances use bundled prototype data.'};
  }
}

const rad=value=>value*Math.PI/180;
export function distanceMeters(a,b){
  const dLat=rad(b.latitude-a.latitude),dLng=rad(b.longitude-a.longitude);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLng/2)**2;
  return Math.round(6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)));
}
export function directionFrom(a,b){
  const delta=rad(b.longitude-a.longitude);
  const y=Math.sin(delta)*Math.cos(rad(b.latitude));
  const x=Math.cos(rad(a.latitude))*Math.sin(rad(b.latitude))-Math.sin(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.cos(delta);
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(((Math.atan2(y,x)*180/Math.PI+360)%360)/45)%8];
}
export function formatDistance(meters){return meters<1000?`${meters} m`:`${(meters/1000).toFixed(1)} km`;}

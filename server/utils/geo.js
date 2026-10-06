const toRadians=degrees=>degrees*Math.PI/180;
const toDegrees=radians=>radians*180/Math.PI;

export function calculateDistance(lat1,lng1,lat2,lng2){
  const deltaLat=toRadians(lat2-lat1);
  const deltaLng=toRadians(lng2-lng1);
  const a=Math.sin(deltaLat/2)**2+Math.cos(toRadians(lat1))*Math.cos(toRadians(lat2))*Math.sin(deltaLng/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
export function calculateBearing(lat1,lng1,lat2,lng2){
  const deltaLng=toRadians(lng2-lng1);
  const y=Math.sin(deltaLng)*Math.cos(toRadians(lat2));
  const x=Math.cos(toRadians(lat1))*Math.sin(toRadians(lat2))-Math.sin(toRadians(lat1))*Math.cos(toRadians(lat2))*Math.cos(deltaLng);
  return (toDegrees(Math.atan2(y,x))+360)%360;
}
export function bearingToDirection(bearing){
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(bearing/45)%8];
}
export function formatDistance(meters){
  return meters<1000?`${Math.round(meters)} m`:`${(meters/1000).toFixed(1)} km`;
}

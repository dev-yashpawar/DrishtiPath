import {useEffect,useMemo} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import L from 'leaflet';
import {MapContainer,TileLayer,Marker,Popup,Polyline,ZoomControl,useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {TypeIcon} from '../Icons';
import LandmarkPopup from './LandmarkPopup';

const street='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const satellite='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
function markerIcon(type,selected=false){
  const icon=renderToStaticMarkup(<TypeIcon type={type} size={22} strokeWidth={2.3}/>);
  return L.divIcon({className:`dp-marker marker-${type} ${selected?'is-selected':''}`,html:icon,iconSize:[42,42],iconAnchor:[21,42],popupAnchor:[0,-38]});
}
function MapSync({target,allPoints,showAll}){
  const map=useMap();
  useEffect(()=>{
    if(target)map.flyTo([target.latitude,target.longitude],Math.max(map.getZoom(),15),{duration:.6});
  },[map,target?.latitude,target?.longitude]);
  useEffect(()=>{
    if(showAll&&allPoints.length)map.fitBounds(L.latLngBounds(allPoints.map(item=>[item.latitude,item.longitude])),{padding:[35,35],maxZoom:15});
  },[map,showAll]);
  return null;
}
export default function DrishtiMap({landmarks,selected,userLocation,from,layer,onSelect,onTileError,showAll}){
  const mapLandmarks=useMemo(()=>landmarks.filter(item=>Number.isFinite(item.latitude)&&Number.isFinite(item.longitude)),[landmarks]);
  return <MapContainer center={[20.0075,73.795]} zoom={14} zoomControl={false} scrollWheelZoom={true} className="drishti-leaflet-map" aria-label="Interactive Nashik landmark map">
    <ZoomControl position="bottomright"/>
    <TileLayer key={layer} url={layer==='satellite'?satellite:street} maxZoom={19} attribution={layer==='satellite'?'Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community':'© OpenStreetMap contributors'} eventHandlers={{tileerror:()=>onTileError(layer)}}/>
    <MapSync target={selected||userLocation} allPoints={mapLandmarks} showAll={showAll}/>
    {mapLandmarks.map(item=><Marker key={item.id} position={[item.latitude,item.longitude]} icon={markerIcon(item.type,item.id===selected?.id)} title={item.name} eventHandlers={{click:()=>onSelect(item.id)}}>
      <Popup minWidth={260}><LandmarkPopup landmark={item} landmarks={mapLandmarks} onViewNearby={onSelect}/></Popup>
    </Marker>)}
    {userLocation&&<Marker position={[userLocation.latitude,userLocation.longitude]} icon={markerIcon('you',true)} title="You are here"><Popup><strong>YOU ARE HERE</strong><p>Device location estimate</p></Popup></Marker>}
    {from&&selected&&from.id!==selected.id&&<Polyline positions={[[from.latitude,from.longitude],[selected.latitude,selected.longitude]]} pathOptions={{color:'#f0442e',weight:3,dashArray:'6 8'}}/>}
  </MapContainer>;
}

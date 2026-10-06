import {useEffect,useMemo,useState} from 'react';
import {useSearchParams,Link} from 'react-router-dom';
import {LocateFixed,Maximize2,MapPin,ArrowUpRight,ChevronDown} from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import KumbhSelector from '../components/map/KumbhSelector';
import MapLayerSwitcher from '../components/map/MapLayerSwitcher';
import DrishtiMap from '../components/map/DrishtiMap';
import NearbyFacilities from '../components/map/NearbyFacilities';
import {TypeIcon} from '../components/Icons';
import {fetchEventLandmarks,fetchNearby} from '../services/landmarkApi';
import {mockLandmarks} from '../data/mockLandmarks';

export default function MapPage(){
  const [params,setParams]=useSearchParams();
  const [landmarks,setLandmarks]=useState(mockLandmarks);
  const [loading,setLoading]=useState(true);
  const [dataWarning,setDataWarning]=useState('');
  const [announcement,setAnnouncement]=useState('');
  const [layer,setLayer]=useState('street');
  const [tileError,setTileError]=useState('');
  const [userLocation,setUserLocation]=useState(null);
  const [locating,setLocating]=useState(false);
  const [locationError,setLocationError]=useState('');
  const [nearby,setNearby]=useState([]);
  const [nearbyLoading,setNearbyLoading]=useState(false);
  const [nearbyError,setNearbyError]=useState('');
  const [filter,setFilter]=useState('all');
  const [showAll,setShowAll]=useState(0);
  const [expanded,setExpanded]=useState(true);
  const selected=landmarks.find(item=>item.id===params.get('selected'));
  let savedScan;
  if(params.get('source')==='scan'){
    try{savedScan=JSON.parse(sessionStorage.getItem('dp-result'));}catch{}
  }
  const scanMatch=selected&&savedScan?.location?.id===selected.id&&savedScan.confidence>=.65?savedScan:null;
  const from=landmarks.find(item=>item.id===params.get('from'));
  const defaultReference=landmarks.find(item=>item.id==='ramkund-ghat');
  const reference=selected||userLocation||from||defaultReference;
  const nearestKnown=userLocation?landmarks.filter(item=>item.status==='active'&&!item.isMock).map(item=>({
    item,distance:Math.round(6371000*2*Math.asin(Math.sqrt(
      Math.sin((item.latitude-userLocation.latitude)*Math.PI/360)**2+
      Math.cos(userLocation.latitude*Math.PI/180)*Math.cos(item.latitude*Math.PI/180)*Math.sin((item.longitude-userLocation.longitude)*Math.PI/360)**2,
    ))),
  })).sort((a,b)=>a.distance-b.distance)[0]:null;

  useEffect(()=>{
    const controller=new AbortController();
    fetchEventLandmarks(controller.signal).then(result=>{
      setLandmarks(result.landmarks);
      setDataWarning(result.error||'');
    }).catch(()=>{}).finally(()=>setLoading(false));
    return()=>controller.abort();
  },[]);
  useEffect(()=>{
    if(!reference)return;
    const controller=new AbortController();
    setNearbyLoading(true);
    fetchNearby(reference.latitude,reference.longitude,5000,landmarks,controller.signal)
      .then(result=>{setNearby(result.nearby);setNearbyError(result.error||'');})
      .catch(()=>{}).finally(()=>setNearbyLoading(false));
    return()=>controller.abort();
  },[reference?.id,reference?.latitude,reference?.longitude,landmarks]);

  const categoryCounts=useMemo(()=>Object.fromEntries(['ghat','temple','gate','medical','police','water','parking','information','entry'].map(type=>[type,landmarks.filter(item=>item.type===type).length])),[landmarks]);
  function selectLandmark(id){
    setParams(current=>{const next=new URLSearchParams(current);next.set('selected',id);next.delete('source');return next;});
    setExpanded(true);
  }
  function locate(){
    if(!navigator.geolocation){setLocationError('This browser does not support location access. You can select a landmark manually.');return;}
    setLocating(true);setLocationError('');
    navigator.geolocation.getCurrentPosition(position=>{
      setUserLocation({latitude:position.coords.latitude,longitude:position.coords.longitude});
      setParams(current=>{const next=new URLSearchParams(current);next.delete('selected');next.delete('source');return next;});
      setLocating(false);
    },error=>{
      setLocationError(error.code===1?'Location permission was not granted. You can still select a landmark manually.':'Your location could not be determined. Select a landmark manually.');
      setLocating(false);
    },{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
  }

  return <div className="map-module">
    <div className="map-intro container">
      <div><SectionLabel>EXPLORE KUMBH</SectionLabel><h1>Find your way<br/><em>through the city.</em></h1><p>Explore mapped places around Nashik and prototype support points. Distances are straight-line estimates.</p></div>
      <div className="map-intro-visual" role="img" aria-label="Illustration of visual landmark discovery"/>
    </div>
    <div className="container"><KumbhSelector onComingSoon={setAnnouncement}/>{announcement&&<p className="coming-soon-note" role="status"><strong>{announcement}:</strong> DrishtiPath location data for this Kumbh is coming soon. The Nashik map stays open.</p>}</div>
    <div className="map-workspace">
      <div className="map-stage">
        <DrishtiMap landmarks={landmarks} selected={selected} userLocation={userLocation} from={from} layer={layer} onSelect={selectLandmark} onTileError={name=>setTileError(`${name==='satellite'?'Satellite':'Street'} tiles are unavailable. Landmarks and nearby lists remain usable.`)} showAll={showAll}/>
        <div className="map-stage-controls"><MapLayerSwitcher layer={layer} onChange={value=>{setTileError('');setLayer(value);}}/><button type="button" onClick={()=>setShowAll(value=>value+1)}><Maximize2 size={17}/> Show all points</button></div>
        <button className="map-locate-button" type="button" onClick={locate} disabled={locating}><LocateFixed size={21}/>{locating?'Locating you...':'Locate Me'}</button>
        {tileError&&<p className="map-tile-error" role="status">{tileError}</p>}
        {from&&selected&&from.id!==selected.id&&<p className="map-line-notice">Dashed line shows straight-line direction only; it is not a walking route.</p>}
      </div>
      <aside className={`map-info panel ${expanded?'expanded':''}`}>
        <button className="mobile-panel-toggle" type="button" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}><span>MAP DETAILS & NEARBY</span><ChevronDown size={20}/></button>
        <div className="map-info-content">
          <div className="map-info-top"><span className="mono">{scanMatch?'PROBABLE LOCATION':selected?'CURRENT REFERENCE LOCATION':userLocation?'YOUR DEVICE LOCATION':'SAMPLE REFERENCE LOCATION'}</span><h2>{selected?.name|| (userLocation?'You are here':defaultReference?.name||'Nashik')}</h2>
            {scanMatch&&<p className="map-scan-confidence"><strong>{Math.round(scanMatch.confidence*100)}%</strong> match confidence · verify with an official sign</p>}
            {selected&&<div className="map-selected-type"><TypeIcon type={selected.type} size={19}/><span>{selected.type.toUpperCase()} {selected.sector?`· SECTOR ${selected.sector}`:''} {selected.gate?`· GATE ${selected.gate}`:''}</span></div>}
            {selected?.isMock&&<span className="prototype-badge">PROTOTYPE FACILITY</span>}
            {selected&&<p>{selected.description}</p>}
            {userLocation&&!selected&&nearestKnown&&<p>Nearest known landmark: <strong>{nearestKnown.item.name}</strong> · {nearestKnown.distance<1000?`${nearestKnown.distance} m`:`${(nearestKnown.distance/1000).toFixed(1)} km`} away</p>}
            {locationError&&<p className="map-message" role="alert">{locationError}</p>}
            {dataWarning&&<p className="map-message" role="status">{dataWarning}</p>}
            {loading&&<p className="map-message" role="status">Loading landmarks...</p>}
            {selected&&<Link className="map-detail-link" to={`/navigate/${selected.id}`}>Explore destinations <ArrowUpRight size={18}/></Link>}
          </div>
          <NearbyFacilities items={nearby} loading={nearbyLoading} error={nearbyError} filter={filter} onFilter={setFilter} onSelect={selectLandmark} originId={reference?.id}/>
          <div className="map-landmark-list"><div className="map-panel-title"><span className="mono">ALL NASHIK LANDMARKS</span><strong>{landmarks.length.toString().padStart(2,'0')}</strong></div>
            <div className="map-category-summary">{Object.entries(categoryCounts).filter(([,count])=>count).map(([type,count])=><span key={type}>{type} {count}</span>)}</div>
            <div className="map-landmark-scroll">{landmarks.map(item=><button key={item.id} type="button" onClick={()=>selectLandmark(item.id)} className={selected?.id===item.id?'is-active':''}><MapPin size={16}/><span>{item.name}</span>{item.isMock&&<small>PROTOTYPE</small>}</button>)}</div>
          </div>
          <p className="map-disclaimer">Prototype facilities and event gates are illustrative, not official or verified. Confirm access, availability and walking routes with on-site staff.</p>
        </div>
      </aside>
    </div>
  </div>;
}

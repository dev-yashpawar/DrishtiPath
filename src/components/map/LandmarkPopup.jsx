import {Link} from 'react-router-dom';
import {distanceMeters,directionFrom,formatDistance} from '../../utils/geo';
import {TypeIcon} from '../Icons';
const essentials=new Set(['medical','police','water','parking','information']);
export default function LandmarkPopup({landmark,landmarks,onViewNearby}){
  const nearby=landmarks.filter(item=>item.id!==landmark.id&&item.status==='active'&&essentials.has(item.type))
    .map(item=>({...item,distance:distanceMeters(landmark,item),direction:directionFrom(landmark,item)}))
    .sort((a,b)=>a.distance-b.distance).slice(0,3);
  return <div className="landmark-popup">
    <span className="mono">{landmark.type.toUpperCase()} {landmark.sector?`/ SECTOR ${landmark.sector}`:''}</span>
    <h3>{landmark.name}</h3>
    <div className="popup-badges"><span>{landmark.status==='active'?'✓ ACTIVE':'× CLOSED'}</span>{landmark.isMock&&<span className="prototype-badge">PROTOTYPE FACILITY</span>}</div>
    {landmark.gate&&<p>Gate {landmark.gate}</p>}
    <div className="popup-nearby"><strong className="mono">NEARBY ESSENTIALS</strong>{nearby.map(item=><div key={item.id}><TypeIcon type={item.type} size={17}/><span>{item.name}</span><b>{formatDistance(item.distance)} · {item.direction}</b></div>)}</div>
    <div className="popup-actions"><button type="button" onClick={()=>onViewNearby(landmark.id)}>View nearby</button><Link to={`/navigate/${landmark.id}`}>Explore destinations</Link></div>
  </div>;
}

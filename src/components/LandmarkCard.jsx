import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {TypeIcon} from './Icons';
export default function LandmarkCard({landmark}){
  const index=landmark.illustrationIndex;
  const illustrated=Number.isInteger(index)&&index>=0&&index<16;
  const position=illustrated?`${index%4*100/3}% ${Math.floor(index/4)*100/3}%`:undefined;
  return <article className="landmark-card">
    <div className={`landmark-art art-${landmark.type} ${illustrated?'atlas-art':''}`} style={illustrated?{backgroundPosition:position}:undefined}>
      <span className="art-sector mono">{landmark.city||'NASHIK'}{landmark.sector?` / SECTOR ${landmark.sector}`:''}</span>
      <TypeIcon type={landmark.type} size={74} strokeWidth={1.4}/>
      <span className="mono art-caption">{landmark.isMock?'ILLUSTRATIVE PLACEMENT':'MAPPED LANDMARK'}</span>
    </div>
    <div className="landmark-body"><span className="tag">{landmark.type}</span>{landmark.isMock&&<span className="prototype-badge">PROTOTYPE FACILITY</span>}
      <h3>{landmark.name}</h3><p>{landmark.sector?`Sector ${landmark.sector}`:landmark.city}{landmark.gate?` · Gate ${landmark.gate}`:''}</p>
      <div className="landmark-bottom"><span className="mono">{landmark.status==='active'?'✓ ACTIVE':'× CLOSED'}</span><Link to={`/map?selected=${landmark.id}`}>View location <ArrowUpRight size={18}/></Link></div>
    </div>
  </article>;
}

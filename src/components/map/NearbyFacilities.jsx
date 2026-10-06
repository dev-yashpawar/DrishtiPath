import {TypeIcon} from '../Icons';
const filters=[['all','ALL'],['medical','MEDICAL'],['police','POLICE'],['water','WATER'],['parking','PARKING'],['ghat','GHATS'],['temple','TEMPLES'],['information','INFORMATION']];
export default function NearbyFacilities({items=[],loading=false,error='',filter,onFilter,onSelect,originId}){
  const filtered=items.filter(item=>item.id!==originId&&(filter==='all'||item.type===filter));
  return <section className="nearby-panel" aria-label="Nearby facilities">
    <div className="map-panel-title"><span className="mono">NEARBY PLACES</span><strong>{filtered.length.toString().padStart(2,'0')}</strong></div>
    <div className="nearby-filters" role="group" aria-label="Filter nearby places">{filters.map(([id,label])=><button key={id} type="button" aria-pressed={filter===id} className={filter===id?'selected':''} onClick={()=>onFilter(id)}>{label}</button>)}</div>
    {loading?<p role="status" className="map-message">Finding nearby facilities...</p>:error?<p role="status" className="map-message">{error}</p>:null}
    {!loading&&!filtered.length&&<p className="map-message">No places found in this category and radius. Select another filter or reference point.</p>}
    <div className="nearby-list">{filtered.slice(0,12).map(item=><button key={item.id} type="button" className="nearby-row" onClick={()=>onSelect(item.id)}>
      <span className={`nearby-icon marker-${item.type}`}><TypeIcon type={item.type} size={22}/></span>
      <span className="nearby-name"><strong>{item.name}</strong><small>{item.type.toUpperCase()} {item.isMock?'· PROTOTYPE FACILITY':''}</small></span>
      <span className="nearby-distance"><strong>{item.formattedDistance}</strong><small>{item.direction}</small></span>
    </button>)}</div>
  </section>;
}

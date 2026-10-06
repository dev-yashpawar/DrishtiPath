export default function MapLayerSwitcher({layer,onChange}){
  return <div className="map-layer-switch" role="group" aria-label="Map layer">
    <button type="button" aria-pressed={layer==='street'} onClick={()=>onChange('street')}>Street</button>
    <button type="button" aria-pressed={layer==='satellite'} onClick={()=>onChange('satellite')}>Satellite</button>
  </div>;
}

const events=[
  {id:'nashik-trimbakeshwar',name:'Nashik–Trimbakeshwar Kumbh',status:'ACTIVE'},
  {id:'prayagraj',name:'Prayagraj Kumbh',status:'COMING SOON'},
  {id:'haridwar',name:'Haridwar Kumbh',status:'COMING SOON'},
  {id:'ujjain',name:'Ujjain Simhastha',status:'COMING SOON'},
];
export default function KumbhSelector({onComingSoon}){
  return <div className="kumbh-selector" role="group" aria-label="Choose Kumbh event">
    {events.map(event=><button key={event.id} type="button" className={event.status==='ACTIVE'?'event-active':''} aria-pressed={event.status==='ACTIVE'} onClick={()=>onComingSoon(event.status==='ACTIVE'?'':event.name)}>
      <span>{event.name}</span><small className="mono">{event.status}</small>
    </button>)}
  </div>;
}

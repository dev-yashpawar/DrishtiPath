// Event facilities are illustrative prototype placements, never official Kumbh locations.
export const EVENT_ID='nashik-trimbakeshwar';
const point=(longitude,latitude)=>({type:'Point',coordinates:[longitude,latitude]});
const rows=[
  ['ramkund-ghat','Ramkund Ghat','ghat','Nashik','','',73.79249,20.00726,false,['Ramkund','Ram Kund','रामकुंड'],'Riverside Ramkund locality and ghat reference point.'],
  ['panchavati-entry','Panchavati Entry Gate','entry','Nashik','1','',73.79335,20.00915,true,['Panchavati Entry','पंचवटी प्रवेश'],'Illustrative entry gate near Panchavati.'],
  ['tapovan','Tapovan','landmark','Nashik','','',73.81264,20.00063,false,['Tapovan','तपोवन'],'Representative point for Tapovan park area.'],
  ['kalaram-mandir','Kalaram Mandir Area','temple','Nashik','','',73.79522,20.00695,false,['Kalaram Mandir','Kalaram Temple','कालाराम मंदिर'],'Mapped Kalaram Mandir site in Panchavati.'],
  ['police-booth-01','Police Help Booth 01','police','Nashik','1','',73.79352,20.00790,true,['Police Booth 01','पुलिस सहायता केंद्र'],'Illustrative police help position near Ramkund.'],
  ['medical-camp-01','Medical Camp 01','medical','Nashik','1','',73.79280,20.00820,true,['Medical Camp 01','चिकित्सा शिविर ०१'],'Illustrative first-aid camp near Ramkund.'],
  ['medical-camp-02','Medical Camp 02','medical','Nashik','1','',73.79665,20.00870,true,['Medical Camp 02','चिकित्सा शिविर ०२'],'Illustrative medical camp near Panchavati.'],
  ['sector1-gate-a','Sector 1 Gate A','gate','Nashik','1','A',73.79085,20.00920,true,['Gate A','गेट ए'],'Illustrative sector entry gate.'],
  ['sector1-gate-b','Sector 1 Gate B','gate','Nashik','1','B',73.79745,20.00935,true,['Gate B','गेट बी'],'Illustrative sector entry gate.'],
  ['sadhugram-entry','Sadhugram Entry','entry','Nashik','1','',73.81100,20.01020,true,['Sadhugram','साधुग्राम'],'Illustrative camp entry near Tapovan.'],
  ['main-parking','Main Parking Area','parking','Nashik','1','',73.78765,20.01050,true,['Main Parking','पार्किंग'],'Illustrative parking point; availability is not live.'],
  ['water-point-01','Water Point 01','water','Nashik','1','',73.79202,20.00865,true,['Water Point 01','पानी केंद्र'],'Illustrative drinking-water point.'],
  ['trimbakeshwar-temple','Trimbakeshwar Temple Area','temple','Trimbakeshwar','','',73.53075,19.93213,false,['Trimbakeshwar Temple','त्र्यंबकेश्वर मंदिर'],'Mapped temple area in Trimbakeshwar.'],
  ['trimbakeshwar-ghat','Trimbakeshwar Ghat','ghat','Trimbakeshwar','','',73.53175,19.93270,true,['Trimbakeshwar Ghat','त्र्यंबकेश्वर घाट'],'Illustrative ghat reference near the temple; exact access is unverified.'],
  ['information-centre','Information Centre','information','Nashik','1','',73.79430,20.00855,true,['Information Centre','सूचना केंद्र'],'Illustrative visitor information point.'],
];

export const mockLandmarks=rows.map(([id,name,type,city,sector,gate,longitude,latitude,isMock,aliases,description],index)=>({
  id,name,type,city,sector,gate,event:EVENT_ID,latitude,longitude,location:point(longitude,latitude),
  isMock,status:'active',aliases:[name,...aliases],visibleTexts:[name,...aliases,sector?`Sector ${sector}`:'',gate?`Gate ${gate}`:''].filter(Boolean),
  nearbyLandmarks:[],description,referenceImages:[],images:[],illustrationIndex:index,
}));
export const categories=['all','ghat','temple','gate','entry','medical','police','water','parking','information','landmark'];
export function distance(a,b){
  const rad=value=>value*Math.PI/180;
  const lat=rad(b.latitude-a.latitude),lng=rad(b.longitude-a.longitude);
  const h=Math.sin(lat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(lng/2)**2;
  return Math.round(6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)));
}

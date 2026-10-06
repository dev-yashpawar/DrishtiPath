import {MapPin,Waves,HeartPulse,Shield,GlassWater,Car,Tent,DoorOpen,Accessibility,Landmark,Info,Signpost} from 'lucide-react';
export const icons={gate:Signpost,ghat:Waves,temple:Landmark,medical:HeartPulse,police:Shield,water:GlassWater,parking:Car,information:Info,entry:DoorOpen,landmark:MapPin,camp:Tent,toilet:Accessibility};
export function TypeIcon({type,...props}){const Icon=icons[type]||MapPin;return <Icon {...props}/>;}

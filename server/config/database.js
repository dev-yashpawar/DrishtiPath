import mongoose from 'mongoose';
import Landmark from '../models/Landmark.js';
import {EVENT_ID} from '../../src/data/mockLandmarks.js';
import {seedNashikLandmarks} from '../scripts/seedLandmarks.js';

export async function connectDatabase(){
 if(!process.env.MONGODB_URI){console.log('No MONGODB_URI: using in-memory demo landmarks.');return false;}
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000});
 if(await Landmark.countDocuments({event:EVENT_ID})<15){
  const result=await seedNashikLandmarks();
  console.log(`Nashik landmarks ready: ${result.total} (${result.inserted} inserted, ${result.migrated} migrated).`);
 }
 return true;
}

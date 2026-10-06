import 'dotenv/config';
import mongoose from 'mongoose';
import Landmark from '../models/Landmark.js';
import {mockLandmarks,EVENT_ID} from '../../src/data/mockLandmarks.js';

export async function seedNashikLandmarks(){
  let inserted=0,migrated=0;
  for(const sample of mockLandmarks){
    const existing=await Landmark.findOne({id:sample.id}).select('event').lean();
    if(!existing){
      await Landmark.create(sample);
      inserted++;
    }else if(!existing.event){
      await Landmark.updateOne({id:sample.id},{$set:sample});
      migrated++;
    }
  }
  await Landmark.init();
  return {inserted,migrated,total:await Landmark.countDocuments({event:EVENT_ID})};
}

if(process.argv[1] && import.meta.url===new URL(`file:///${process.argv[1].replace(/\\/g,'/')}`).href){
  if(!process.env.MONGODB_URI)throw new Error('Set MONGODB_URI in .env before seeding.');
  try{
    await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000});
    const result=await seedNashikLandmarks();
    console.log(`Nashik landmarks: ${result.total} (${result.inserted} inserted, ${result.migrated} migrated).`);
  }finally{await mongoose.disconnect();}
}

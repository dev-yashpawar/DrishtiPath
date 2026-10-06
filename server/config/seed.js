// Kept as a compatible entry point for older local commands.
import 'dotenv/config';
import mongoose from 'mongoose';
import {seedNashikLandmarks} from '../scripts/seedLandmarks.js';
if(!process.env.MONGODB_URI)throw new Error('Set MONGODB_URI before seeding.');
try{
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000});
  console.log(await seedNashikLandmarks());
}finally{await mongoose.disconnect();}

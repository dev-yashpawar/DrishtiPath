import mongoose from 'mongoose';
export default mongoose.model('Facility',new mongoose.Schema({name:String,type:String,landmark:{type:mongoose.Schema.Types.ObjectId,ref:'Landmark'},status:{type:String,enum:['ACTIVE','CLOSED'],default:'ACTIVE'}},{timestamps:true}));

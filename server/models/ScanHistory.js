import mongoose from 'mongoose';
export default mongoose.model('ScanHistory',new mongoose.Schema({imageUrl:String,detectedClues:[String],matchedLandmark:{type:mongoose.Schema.Types.ObjectId,ref:'Landmark'},confidence:{type:Number,min:0,max:1},timestamp:{type:Date,default:Date.now}}));

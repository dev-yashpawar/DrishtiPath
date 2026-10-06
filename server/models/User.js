import mongoose from 'mongoose';
export default mongoose.model('User',new mongoose.Schema({name:String,language:{type:String,enum:['en','hi'],default:'en'}},{timestamps:true}));

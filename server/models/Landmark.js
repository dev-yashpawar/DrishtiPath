import mongoose from 'mongoose';

const landmarkSchema=new mongoose.Schema({
  id:{type:String,unique:true,required:true},
  event:{type:String,required:true,default:'nashik-trimbakeshwar',index:true},
  name:{type:String,required:true},
  type:{type:String,enum:['ghat','temple','gate','medical','police','water','parking','information','entry','landmark','camp','toilet'],required:true},
  city:{type:String,default:'Nashik'},
  sector:String,
  gate:String,
  location:{
    type:{type:String,enum:['Point'],default:'Point'},
    coordinates:{type:[Number],required:true,validate:{validator:value=>value?.length===2&&value[0]>=-180&&value[0]<=180&&value[1]>=-90&&value[1]<=90,message:'GeoJSON coordinates must be [longitude, latitude].'}},
  },
  aliases:[String],
  visibleTexts:[String],
  nearbyLandmarks:[String],
  description:String,
  status:{type:String,enum:['active','closed','inactive'],default:'active'},
  isMock:{type:Boolean,default:true},
  referenceImages:[String],
  illustrationIndex:Number,
},{timestamps:true});

landmarkSchema.index({location:'2dsphere'});
export default mongoose.model('Landmark',landmarkSchema);

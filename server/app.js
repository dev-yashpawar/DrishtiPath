import express from 'express';import api from './routes/api.js';
const app=express();app.use(express.json({limit:'64kb'}));app.use('/api',api);app.use((err,req,res,next)=>{console.error(err.message);res.status(err.code==='LIMIT_FILE_SIZE'?413:500).json({error:err.code==='LIMIT_FILE_SIZE'?'Image must be smaller than 10 MB.':'Request failed. Please try again.'});});export default app;

import 'dotenv/config';
import {existsSync} from 'node:fs';
import path from 'node:path';
import express from 'express';
import app from './app.js';
import {connectDatabase} from './config/database.js';
import {setPersistence} from './controllers/landmarkController.js';

app.locals.database='connecting';
if(existsSync('dist/index.html')){
  app.use(express.static('dist'));
  app.get('*',(req,res)=>res.sendFile(path.resolve('dist/index.html')));
}
app.listen(process.env.PORT||3001,'127.0.0.1',()=>console.log('DrishtiPath API: http://127.0.0.1:'+(process.env.PORT||3001)));

async function initializeDatabase(){
  try{
    const connected=await connectDatabase();
    setPersistence(connected);
    app.locals.database=connected?'mongodb':'bundled-prototype';
  }catch(error){
    setPersistence(false);
    app.locals.database='bundled-prototype';
    console.error('MongoDB is unavailable; serving labelled prototype landmarks:',error.message);
  }
}
initializeDatabase();

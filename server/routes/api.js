import {Router} from 'express';
import multer from 'multer';
import {analyzeLocation} from '../services/aiService.js';
import {list,listByEvent,getById,nearby,save} from '../controllers/landmarkController.js';

const router=Router();
const upload=multer({
 storage:multer.memoryStorage(),
 limits:{fileSize:10*1024*1024,files:1},
 fileFilter:(req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype)),
});

router.get('/health',(req,res)=>res.json({status:'ok',database:req.app.locals.database||'bundled-prototype',inference:'gemini-or-ollama',geminiConfigured:Boolean(process.env.GEMINI_API_KEY)}));
router.get('/landmarks',list);
router.get('/landmarks/nearby',nearby);
router.get('/landmarks/event/:eventId',listByEvent);
router.get('/landmarks/:id',getById);
router.post('/landmarks',save);
router.patch('/landmarks/:id',save);

router.post('/analyze-location',upload.single('image'),async(req,res,next)=>{
 try{
  if(!req.file)return res.status(400).json({error:'Upload a JPG, PNG or WebP image (maximum 10 MB).'});
  const b=req.file.buffer;
  const valid=(b[0]===255&&b[1]===216&&b[2]===255)||
   b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||
   (b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP');
  if(!valid)return res.status(400).json({error:'The file does not contain a supported image.'});
  const provider=req.body.provider||'auto';
  if(!['auto','gemini','ollama'].includes(provider))return res.status(400).json({error:'Unsupported analysis provider.'});
  if(provider==='gemini'&&!process.env.GEMINI_API_KEY)return res.status(503).json({error:'Gemini API key is missing. Add GEMINI_API_KEY to .env and restart the server.'});
  res.json(await analyzeLocation(b,{mimeType:req.file.mimetype,provider,clientOffline:req.body.clientOffline==='true'}));
 }catch(e){
  const message=e.message||'';
  if(message.startsWith('Online and local analysis are unavailable:'))return res.status(503).json({error:message});
  if(message.startsWith('Local Gemma'))return res.status(503).json({error:message});
  if(message.startsWith('Gemini online'))return res.status(503).json({error:message});
  if(/fetch failed|abort|ollama|gemini|model|clues|unreadable|incomplete/i.test(message))return res.status(503).json({error:'Analysis is unavailable. Check your Gemini key or local Ollama Gemma model, then try again.'});
  next(e);
 }
});
export default router;

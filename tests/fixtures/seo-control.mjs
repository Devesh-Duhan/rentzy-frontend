import {setBlogFixtures} from './seo-api.mjs';
let lease=null,expires=0;
// Test server only: loopback HTTP control plane, never mounted in the application/backend.
export async function seoTestControl(request,response,url){
 if(!url.pathname.startsWith('/__test/'))return false;
 const body=await new Promise(resolve=>{let text='';request.on('data',chunk=>{text+=chunk;});request.on('end',()=>{try{resolve(JSON.parse(text||'{}'));}catch{resolve({});}});});
 let status=200;
 if(url.pathname==='/__test/lease'){
  if(body.release&&lease===body.owner){lease=null;setBlogFixtures();}
  else if(!lease||lease===body.owner||Date.now()>expires){lease=body.owner;expires=Date.now()+600000;}
  else status=409;
 }else if(url.pathname==='/__test/blogs'&&lease===body.owner)setBlogFixtures(body.blogs,body.error);
 else status=403;
 response.writeHead(status);response.end('{}');return true;
}

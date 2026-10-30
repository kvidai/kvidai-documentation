// Real negative process boundary: an occupied service is never terminated by pnpm test.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
test('documentation test refuses an occupied3100 port and leaves its owner alive', { timeout: 25000 }, async t => {
  const sentinel=http.createServer((_request,response)=>response.end('owned-negative-boundary'));
  try { await new Promise((resolve,reject)=>{sentinel.once('error',reject);sentinel.listen(3100,'127.0.0.1',resolve);}); }
  catch(error){if(error.code==='EADDRINUSE'){t.skip('3100 belongs to another process; no takeover');return;}throw error;}
  let child,exit,deadline,output='';
  try{
    const env={...process.env};delete env.BASE_URL;
    child=spawn('pnpm',['run','test','--grep','generated llms.txt'],{cwd:path.resolve(import.meta.dirname,'../..'),env,detached:true,stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{output+=chunk;});
    exit=await Promise.race([new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);}),new Promise((_resolve,reject)=>{deadline=setTimeout(()=>reject(Error('Occupied-port refusal exceeded15s')),15000);})]);
    assert.notEqual(exit,0,output);
    assert.match(output,/already used|already in use/i);
    assert.equal(await(await fetch('http://127.0.0.1:3100')).text(),'owned-negative-boundary');
  }finally{
    clearTimeout(deadline);
    if(child&&child.exitCode===null){try{process.kill(-child.pid,'SIGTERM');}catch{}}
    sentinel.closeAllConnections();await new Promise(resolve=>sentinel.close(resolve));
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {runGoogleSignIn} from '../src/lib/google-signin.js';
const timeouts={popup:20,token:20,exchange:20};
const pending=()=>new Promise(()=>{});
const popup=async()=>({user:{getIdToken:async()=> 'synthetic-firebase-token'}});
test('Google popup starts in the click call, and verified exchange returns the actual role',async()=>{
 let started=false;const stages=[];
 const result=runGoogleSignIn({popup:()=>{started=true;return popup();},exchange:async token=>{assert.equal(token,'synthetic-firebase-token');return {role:'seller'};},onStage:value=>stages.push(value),timeouts});
 assert.equal(started,true);assert.equal((await result).role,'seller');assert.deepEqual(stages,['Opening Google…','Verifying account…','Signing in…']);
});
test('stalled popup, token and backend all finish with a retryable error',async()=>{
 await assert.rejects(runGoogleSignIn({popup:pending,exchange:async()=>{},timeouts}),/Google sign-in did not finish/);
 await assert.rejects(runGoogleSignIn({popup:async()=>({user:{getIdToken:pending}}),exchange:async()=>{},timeouts}),/could not verify/);
 await assert.rejects(runGoogleSignIn({popup,exchange:pending,timeouts}),/login server did not respond/);
});
test('cancelled or late popup never triggers a backend login',async()=>{
 let calls=0,finish;const controller=new AbortController();
 const result=runGoogleSignIn({popup:()=>new Promise(resolve=>{finish=resolve;}),exchange:async()=>{calls++;},signal:controller.signal,timeouts});
 controller.abort();await assert.rejects(result,{name:'AbortError'});finish(await popup());await new Promise(resolve=>setTimeout(resolve,1));assert.equal(calls,0);
});
test('invalid tokens and denied credentials cannot establish a session',async()=>{
 let calls=0;
 await assert.rejects(runGoogleSignIn({popup:async()=>({user:{getIdToken:async()=>''}}),exchange:async()=>{calls++;},timeouts}),/valid sign-in token/);assert.equal(calls,0);
 await assert.rejects(runGoogleSignIn({popup,exchange:async()=>{throw new Error('Invalid or expired token');},timeouts}),/Invalid or expired/);
});

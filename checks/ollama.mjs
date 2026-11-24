// Exercise the actual app endpoint with a tiny original syllabus. No saved pack or sample fallback.
import assert from 'node:assert/strict'
import {defaultModel} from '../src/study.js'
import {validateResult} from '../shared/contracts.js'
const pages=[{id:'syllabus-1',kind:'syllabus',text:'Relational keys: distinguish candidate keys from superkeys and explain minimality.'}]
const model=process.env.BACHAO_MODEL || defaultModel
try {
 const response=await fetch('http://127.0.0.1:5173/api/generate',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({task:'map',model,pages}),signal:AbortSignal.timeout(250000)
 })
 const value=await response.json()
 if(!response.ok)throw new Error(value.error)
 const pack=validateResult('map',value,pages)
 assert.ok(pack.topics.length>0)
 console.log('Live Ollama smoke passed for '+model+' with '+pack.topics.length+' source-validated topics.')
} catch(error) {
 console.error('Live Ollama smoke did not complete: '+error.message)
 process.exitCode=1
}

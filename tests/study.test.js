import test from 'node:test'
import assert from 'node:assert/strict'
import {samplePack} from '../src/sample.js'
import {schedule,contextPages,pageIndex} from '../src/study.js'
import {generate} from '../server/local.js'
import {validateResult} from '../shared/contracts.js'
const pack=samplePack()
const fixed={date:'2026-02-10',minutes:30,mode:'days'}
test('ten-day coverage, practice and revision stay inside daily budgets',()=>{
 const {sessions,deferred}=schedule(pack,fixed,'2026-02-01')
 assert.equal(deferred.length,0);assert.equal(sessions.at(-1).day,10)
 for(const day of Map.groupBy(sessions,s=>s.day).values())assert.ok(day.reduce((n,s)=>n+s.minutes,0)<=30)
 assert.ok(sessions.some(s=>s.kind==='Revise'))
})
test('sprint fits 90 minutes, shortens practice, and discloses deferred topics',()=>{
 const plan=schedule(pack,{...fixed,mode:'sprint'},'2026-02-01')
 assert.ok(plan.sessions.reduce((n,s)=>n+s.minutes,0)<=90);assert.equal(plan.deferred.length,4);assert.ok(plan.sessions.some(s=>s.kind==='Quick check'))
 assert.equal(schedule(pack,fixed,'2026-02-11').sessions.length,0)
})
const pages=contextPages(pack.docs)
const body={task:'map',model:'qwen3:4b-instruct',pages}
const output={subject:pack.subject,topics:[pack.topics[0]]}
test('mock Ollama transport receives schema and validated source-grounded pack',async()=>{
 const calls=[]
 const result=await generate(body,async(url,opts)=>{calls.push([url,JSON.parse(opts.body)]);return Response.json(url.endsWith('/show')?{}:{message:{content:JSON.stringify(output)}})})
 assert.equal(result.topics[0].title,pack.topics[0].title);assert.ok(calls[1][1].format.properties.topics);assert.match(calls[1][0],/^http:\/\/127\.0\.0\.1:/)
})
test('refuses invented references, malformed output, remote models and missing weights',async()=>{
 assert.throws(()=>validateResult('map',{...output,topics:[{...pack.topics[0],refs:[{page:'s:1',quote:'invented text'}]}]},pages),/excerpt/i)
 await assert.rejects(generate(body,async()=>new Response('',{status:404})),/Model missing/)
 await assert.rejects(generate(body,async()=>Response.json({remote_host:'example'})),/weights/)
 await assert.rejects(generate(body,async(url)=>Response.json(url.endsWith('/show')?{}:{message:{content:'unfinished'}})),/incomplete JSON/)
})
test('every synthetic topic reference matches its stored source page',()=>{
 validateResult('map',{subject:pack.subject,topics:pack.topics},pageIndex(pack.docs))
})

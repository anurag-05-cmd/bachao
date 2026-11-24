import React,{useEffect,useRef,useState} from 'react'
import {Evidence} from './Desk.jsx'
import {consistentLayout,historicalRows,paperChunks,paperSlots,skillGroups} from './history.js'
import {samplePractice} from './samplePapers.js'
import {requestStudy,pageIndex} from './study.js'
export function Papers({pack,view,patch,navigate}) {
 const [busy,setBusy]=useState(''),[error,setError]=useState('')
 const mounted=useRef(true)
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[])
 const chunks=paperChunks(pack),processed=pack.history||{},pending=chunks.filter(c=>!Object.hasOwn(processed,c.key))
 const rows=historicalRows(pack),groups=skillGroups(rows),layout=consistentLayout(pack)
 const slots=paperSlots(layout,groups),paper=pack.practice||{}
 async function analyse(){
   let known=groups.map(g=>g.skill)
   setError('')
   for(const chunk of pending){
     if(!mounted.current)break
     setBusy('Reading '+chunk.name+' · p. '+chunk.number)
     try{
       const result=await requestStudy('history',[chunk],pack.settings.model,JSON.stringify(known).slice(0,3900))
       if(!mounted.current)break
       patch(p=>({...p,history:{...p.history,[chunk.key]:result.questions}}))
       known=[...new Set([...known,...result.questions.map(q=>q.skill)])]
     }catch(e){setError(e.message);break}
   }
   if(mounted.current)setBusy('')
 }
 async function generate(){
   setError('')
   for(const slot of slots.filter(s=>!paper[s.id])){
     if(!mounted.current)break
     setBusy('Preparing '+slot.section+' · question '+slot.number)
     try{
       const group=groups.find(g=>g.skill===slot.skill),row=group.rows[0]
       let item
       if(pack.sample)item=samplePractice[Number(slot.id.slice(1))%samplePractice.length]
       else {
         const notePages=pageIndex(pack.docs).filter(p=>p.kind==='notes').sort((a,b)=>overlap(b.text,slot.skill)-overlap(a.text,slot.skill)).slice(0,2)
         const pages=[{id:row.page,kind:'pyq',text:row.quote},...notePages.map(p=>({...p,text:p.text.slice(0,1600)}))]
         const result=await requestStudy('practice',pages,pack.settings.model,JSON.stringify({skill:slot.skill,marks:slot.marks,subject:pack.subject}))
         item=result
       }
       if(!mounted.current)break
       if(rows.some(r=>r.quote.toLowerCase().includes(item.prompt.toLowerCase())))throw new Error('The generated question repeated a historical question. Retry this question.')
       patch(p=>({...p,practice:{...p.practice,[slot.id]:item}}))
     }catch(e){setError(e.message);break}
   }
   if(mounted.current)setBusy('')
 }
 const insights=view==='PYQ insights'
 return <><p className="eyebrow">{pack.sample?'Synthetic DBMS papers':'Historical papers'}</p><h1>{insights?'PYQ insights':'Expected paper'}</h1>{insights?<p>See which skills recur and read the original questions behind each count.</p>:<h2>PYQ-based practice paper</h2>}
 {!chunks.length?<div className="panel"><h3>Add a readable previous-year paper</h3><p>Your syllabus pack is ready to study. Add a paper in Materials and build a pack to unlock historical analysis.</p><button className="btn" onClick={()=>navigate('Materials')}>Open materials</button></div>:<><div className="panel"><p>{chunks.length-pending.length} of {chunks.length} paper excerpts analysed · {rows.length} verified questions</p>{pending.length>0&&<button disabled={!!busy} className="primary" onClick={analyse}>{Object.keys(processed).length?'Continue paper analysis':'Analyse past papers'}</button>}{!pending.length&&!groups.length&&<p>No verifiable question was found. Paste a clearer transcription and rebuild.</p>}</div>
 {insights?<div className="reading">{groups.map(g=><section className="panel" key={g.skill}><p className="eyebrow">{g.papers.size} distinct {g.papers.size===1?'paper':'papers'}</p><h2>{g.skill}</h2>{g.rows.map((r,i)=><div className="response" key={i}><blockquote>{r.quote}</blockquote><p className="meta">{r.year||'Year unknown'} · {r.marks===null?'Marks unknown':r.marks+' marks'} · {r.name} · p. {r.number}</p><Evidence refs={[r]} docs={pack.docs}/></div>)}</section>)}</div>:groups.length>0&&<><div className="panel deferred"><h3>{layout?'Source-matched format':'Practice set'}</h3><p>{layout?'The papers agree on section order, question counts, choices and marks.':'A complete, consistent sections-and-marks format could not be confirmed across two distinct papers. This set practices the verified skills.'}</p>{!pending.length&&Object.keys(paper).length<slots.length&&<button className="primary" disabled={!!busy} onClick={generate}>{Object.keys(paper).length?'Continue practice paper':'Generate practice paper'}</button>}{pending.length>0&&<p>Finish analysing the paper excerpts before generating questions.</p>}</div>{[...Map.groupBy(slots,s=>s.section)].map(([name,section])=><section className="panel deferred" key={name}><h2>{name}</h2>{layout&&<p>Answer {section[0].take} of {section.length}.</p>}{section.map(s=>paper[s.id]&&<div className="response" key={s.id}><p className="eyebrow">Generated question {s.number}{s.marks===null?'':' · '+s.marks+' marks'}</p><h3>{paper[s.id].prompt}</h3><p className="meta">Skill · {s.skill}</p><details><summary>Marking guide</summary><ul>{paper[s.id].points.map(p=><li key={p}>{p}</li>)}</ul></details></div>)}</section>)}</>}</>}
 {busy&&<p role="status">{busy}…</p>}{error&&<p role="alert" className="error">{error} Completed excerpts and questions are saved. Retry the unfinished step.</p>}</>
}
function overlap(text,skill) {const words=skill.toLowerCase().match(/\w{4,}/g)||[];return words.filter(w=>text.toLowerCase().includes(w)).length}

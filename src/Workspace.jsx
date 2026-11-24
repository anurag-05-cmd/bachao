import {Papers} from './Papers.jsx'
import {Quiz} from './Quiz.jsx'
import React,{useEffect,useRef,useState} from 'react'
import {Shell} from './App.jsx'
import {Materials,Sources} from './Materials.jsx'
import {Desk,Topic,Topics} from './Desk.jsx'
import {access} from './db.js'
import {samplePack} from './sample.js'
import {contextPages,initialSettings,pageIndex,requestStudy,schedule} from './study.js'
const blank=()=>({docs:[],packs:[],active:null,draft:initialSettings()})
export function Workspace(){
 const [state,setState]=useState(null),[view,setView]=useState('Study desk'),[focus,setFocus]=useState(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[storageError,setStorageError]=useState('')
 const writes=useRef(Promise.resolve())
 const [reading,setReading]=useState(0)
 const readingChanged=delta=>setReading(n=>n+delta)
 useEffect(()=>{access('load').then(saved=>{if(saved)setState(saved);else {const sample=samplePack();setState({...blank(),packs:[sample],active:sample.id})}}).catch(e=>{setStorageError('Local storage could not open: '+e.message);setState(blank())})},[])
 useEffect(()=>{if(state){writes.current=writes.current.then(()=>access(state)).then(()=>setStorageError('')).catch(e=>setStorageError('Changes could not be saved on this device: '+e.message))}},[state])
 const pack=state?.packs.find(p=>p.id===state.active)
 const update=changed=>setState(s=>({...s,packs:s.packs.map(p=>p.id===changed.id?changed:p)}))
 function navigate(name){setFocus(null);setView(name);window.scrollTo(0,0)}
 function open(id,kind){setFocus({id,kind});setView('Topics');window.scrollTo(0,0);if(['Practice','Quick check'].includes(kind))requestAnimationFrame(()=>document.getElementById('test-me')?.scrollIntoView())}
 function activate(id){setState(s=>({...s,active:id}));navigate('Study desk')}
 function demo(){const sample=samplePack();setState(s=>({...s,active:sample.id,packs:s.packs.some(p=>p.id===sample.id)?s.packs:[...s.packs,sample]}));navigate('Study desk')}
 function deletePack(id) {
   if (!window.confirm('Delete this saved pack and its test history? Your uploaded draft and other packs will stay available.')) return
   setState(s=>({...s,packs:s.packs.filter(p=>p.id!==id),active:s.active===id?null:s.active}))
   setError('')
 }
 async function analyse(){
   const {docs,draft}=state
   const cacheKey=JSON.stringify([draft.model,...docs.map(d=>d.id).sort()])
   const cached=state.packs.find(p=>p.cacheKey===cacheKey)
   if(cached){update({...cached,settings:{...draft}});activate(cached.id);return}
   const pages=contextPages(docs)
   setBusy(true);setError('');setStatus('Reading '+pages.length+' page excerpts with '+draft.model+' on this device…')
   try {
     const generated=await requestStudy('map',pages,draft.model)
     const id=crypto.randomUUID(),topics=generated.topics.map((t,i)=>({...t,id:'t'+i}))
     const next={id,...generated,topics,docs,settings:{...draft},covered:pages.map(p=>({page:p.id,length:p.text.length})),cacheKey,done:[],attempts:[]}
     setState(s=>({...s,active:id,packs:[...s.packs,next]}));navigate('Study desk')
   } catch(e){setError(e.message)} finally {setBusy(false);setStatus('')}
 }
 if(!state)return <p className="page" role="status">Opening your local study desk…</p>
 const topic=pack?.topics.find(t=>t.id===focus?.id)
 const materials=view==='Materials'||!pack
 const settings=state.draft
 const setDraft=(key,value)=>setState(s=>({...s,draft:{...s.draft,[key]:value}}))
 return <Shell view={materials?'Materials':view} navigate={navigate} sample={!materials&&pack?.sample}><div className="page">{storageError&&<p role="alert">{storageError}</p>}{materials?<><fieldset disabled={busy}><Materials readingChanged={readingChanged} docs={state.docs} setDocs={fn=>setState(s=>({...s,docs:fn(s.docs)}))}><div className="panel"><h2>Exam settings</h2><div className="grid3"><label>Exam date<input type="date" value={settings.date} onChange={e=>setDraft('date',e.target.value)}/></label><label>Study minutes per day<input type="number" min="1" max="1440" value={settings.minutes} onChange={e=>setDraft('minutes',e.target.value)}/></label><label>Local Ollama model<input value={settings.model} onChange={e=>setDraft('model',e.target.value)}/></label></div><button className="primary" disabled={reading>0||!contextPages(state.docs).some(p=>p.kind==='syllabus')||!settings.date||settings.minutes<1||settings.minutes>1440||!settings.model} onClick={analyse}>{busy?'Analysing excerpts…':reading?'Reading PDFs…':error?'Retry analysis':'Build my study pack'}</button><p role="status">{status}</p>{error&&<p className="error" role="alert">{error}</p>}</div></Materials></fieldset><div className="sectiontitle"><h2>Saved study packs</h2></div>{state.packs.filter(p=>!p.sample).map(p=><div className="panel" key={p.id}><button className="textbtn" onClick={()=>activate(p.id)}>{p.subject}</button> <button className="textbtn danger" aria-label={'Delete pack '+p.subject} onClick={()=>deletePack(p.id)}>Delete pack</button><details><summary>Analysis coverage</summary>{p.covered.map(r=>{const page=pageIndex(p.docs).find(v=>v.id===r.page);return <p key={r.page}>{page.name} · p. {page.number} · first {r.length} of {page.text.length} characters</p>})}<Sources docs={p.docs}/></details></div>)}<div className="panel demo"><div><h3>DBMS sample pack</h3><p>Pre-generated from synthetic materials. Works without Ollama.</p></div><button className="btn" onClick={demo}>Open sample</button></div><button disabled={busy} className="textbtn danger" onClick={()=>{if(window.confirm('Delete all local study packs, uploaded PDFs, drafts and test history from this browser?')){setState(blank());setError('');navigate('Materials')}}}>Delete all local study data</button></>:view==='Study desk'?<Desk pack={pack} update={update} open={open} navigate={navigate}/>:view==='Topics'?topic?<Topic pack={pack} topic={topic} compact={schedule(pack,pack.settings).compact}><Quiz key={pack.id+topic.id} pack={pack} topic={topic} update={update} preferred={focus.kind}/></Topic>:<Topics pack={pack} open={open}/>:<Papers key={pack.id+view} pack={pack} view={view} navigate={navigate} patch={fn=>setState(s=>({...s,packs:s.packs.map(p=>p.id===pack.id?fn(p):p)}))}/>}</div></Shell>
}

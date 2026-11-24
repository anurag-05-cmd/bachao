import React,{useEffect,useRef,useState} from 'react'
import {Evidence} from './Desk.jsx'
import {sampleQuiz} from './sampleQuiz.js'
import {grade,quizPages,score} from './quiz.js'
import {requestStudy,schedule} from './study.js'
export function Quiz({pack,topic,update,preferred}) {
 const [items,setItems]=useState([]),[answers,setAnswers]=useState({}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[mode,setMode]=useState('Quick Check'),[showResult,setShowResult]=useState(true)
 const alive=useRef(true)
 useEffect(()=>{alive.current=true;return ()=>{alive.current=false}},[])
 const last=pack.attempts.filter(a=>a.topic===topic.id).at(-1)
 const cached=pack.sample?sampleQuiz(topic):topic.quiz
 const result=showResult?last:null
 function start(bank,label){setAnswers({});setShowResult(false);setItems(bank);setMode(label);setError('')}
 async function choose(count) {
   setError('');let bank=cached
   if(!bank){
     setBusy(true)
     try {
       const result=await requestStudy('quiz',quizPages(pack,topic),pack.settings.model,topic.title)
       bank=result.questions.map((q,i)=>({...q,id:'q'+i}))
       if(!alive.current)return
       update({...pack,topics:pack.topics.map(t=>t.id===topic.id?{...t,quiz:bank}:t)})
     }catch(e){if(alive.current)setError(e.message);return}finally{if(alive.current)setBusy(false)}
   }
   if(!bank.length){setError('These excerpts did not support a question. Add explanatory notes to your materials and rebuild.');return}
   start(bank.slice(0,count),bank.length<count?'Source-limited check':count===3?'Quick Check':'Topic Test')
 }
 function submit(e){e.preventDefault()
   const attempt={id:crypto.randomUUID(),topic:topic.id,mode,when:Date.now(),items,results:grade(items,answers)}
   const session=schedule(pack,pack.settings).sessions.find(s=>s.topic===topic.id&&['Quick check','Practice'].includes(s.kind)&&!pack.done.includes(s.key))
   update({...pack,attempts:[...pack.attempts,attempt],done:session?[...pack.done,session.key]:pack.done})
   setShowResult(true);setItems([])
 }
 function selfCheck(id,correct){update({...pack,attempts:pack.attempts.map(a=>a.id===result.id?{...a,results:a.results.map(r=>r.id===id?{...r,correct}:r)}:a)})}
 const ranked=preferred==='Practice'?[5,3]:[3,5]
 const missed=result?.items.filter(q=>result.results.find(r=>r.id===q.id)?.correct===false)||[]
 return <section className="panel quiz" id="test-me"><h2>Test Me</h2><p>Choose an answer for each MCQ. After submission, check your written answers against the marking points.</p><div className="actions">{ranked.map(n=><button key={n} disabled={busy} className={n===ranked[0]?'primary':'btn'} onClick={()=>choose(n)}>{n===3?'Quick Check · 3':'Topic Test · 5'}</button>)}</div>{busy&&<p role="status">Preparing questions with your local model…</p>}{error&&<p className="error" role="alert">{error}</p>}
 {items.length>0&&<form onSubmit={submit}><h3>{mode}</h3>{items.map((q,i)=><fieldset key={q.id}><legend>{i+1}. {q.prompt}</legend>{q.kind==='mcq'?q.options.map((opt,j)=><label className="option" key={j}><input required type="radio" name={q.id} checked={answers[q.id]===j} onChange={()=>setAnswers(a=>({...a,[q.id]:j}))}/>{opt}</label>):<textarea required aria-label={q.prompt} value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}/>}</fieldset>)}<button className="primary" disabled={items.some(q=>answers[q.id]===undefined||answers[q.id]==='')}>Submit answers</button></form>}
 {result&&<div className="feedback"><h3>{result.mode} results</h3><p><b>{score(result).right} / {score(result).total} correct</b> · {score(result).pending} awaiting self-check</p>{result.items.map((q,i)=>{const r=result.results[i];return <div className="response" key={q.id}><strong>{q.prompt}</strong><p>Your answer · {q.kind==='mcq'?q.options[r.answer]:r.answer}</p><b>{r.correct===null?'Self-check required':r.correct?'Correct':'Review this point'}</b>{q.kind==='mcq'?<p>Correct answer · {q.options[q.answer]}. {q.explanation}</p>:<><ul>{q.points.map(p=><li key={p}>{p}</li>)}</ul><div className="actions"><button className="btn" aria-pressed={r.correct===true} onClick={()=>selfCheck(q.id,true)}>Met the marking points</button><button className="btn" aria-pressed={r.correct===false} onClick={()=>selfCheck(q.id,false)}>Needs review</button></div></>}<Evidence refs={q.refs} docs={pack.docs}/></div>})}{missed.length>0&&<button className="primary" onClick={()=>start(missed,'Targeted retry')}>Retry missed questions ({missed.length})</button>}</div>}</section>
}

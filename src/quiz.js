import {pageIndex} from './study.js'
export function quizPages(pack,topic) {
 const pages=pageIndex(pack.docs)
 const refs=topic.refs.map(r=>{const p=pages.find(p=>p.id===r.page);if(!p)return null
   const start=Math.max(0,p.text.indexOf(r.quote)-200)
   return {id:p.id,kind:p.kind,text:p.text.slice(start,start+1800)}
 }).filter(Boolean)
 const related=pages.filter(p=>p.kind==='notes'&&p.text.toLowerCase().includes(topic.title.toLowerCase())).map(p=>({...p,text:p.text.slice(0,1800)}))
 return [...new Map([...related,...refs].map(p=>[p.id,p])).values()].slice(0,5)
}
export function grade(items,answers) {
 return items.map(q=>({id:q.id,answer:answers[q.id],correct:q.kind==='mcq'?q.answer===answers[q.id]:null}))
}
export function score(attempt) {
 const graded=attempt.results.filter(r=>r.correct!==null)
 return {right:graded.filter(r=>r.correct).length,total:graded.length,pending:attempt.results.length-graded.length}
}
export function nextAction(plan,pack) {
 const pending=plan.sessions.filter(s=>!pack.done.includes(s.key))
 const last=pack.attempts.at(-1)
 if(last?.results.some(r=>r.correct===false)) {
   const review=pending.find(s=>s.topic===last.topic && s.kind==='Revise')
   if(review){
     const missed=last.results.find(r=>r.correct===false)
     const question=last.items?.find(q=>q.id===missed.id)
     return {...review,reason:'Your last check flagged this topic. '+(question?.explanation || 'Revisit the missed marking points.')}
   }
 }
 return pending[0]
}

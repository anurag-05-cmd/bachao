export const defaultModel='qwen3:4b-instruct'
export function dateString(date=new Date()) {
  return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')
}
export function initialSettings() {
  const date=new Date(); date.setDate(date.getDate()+9)
  return {date:dateString(date),minutes:60,mode:'days',model:defaultModel}
}
export function pageIndex(docs) {
  return docs.flatMap(doc=>doc.pages.filter(p=>p.text).map(p=>({id:doc.id+':'+p.number,name:doc.name,kind:doc.kind,number:p.number,text:p.text,docId:doc.id})))
}
export function contextPages(docs) {
  const pages=pageIndex(docs)
  return ['syllabus','notes','pyq'].flatMap((kind,i)=>pages.filter(p=>p.kind===kind).slice(0,[5,3,2][i]).map(p=>({id:p.id,kind,text:p.text.slice(0,1100)})))
}
export function availableDays(date,today=dateString()) {
  return Math.max(0,Math.min(366,Math.round((Date.parse(date)-Date.parse(today))/86400000)+1)) || 0
}
export function schedule(pack,settings,today=dateString()) {
  const days=availableDays(settings.date,today)
  const limit=settings.mode==='sprint'?1:days
  const cap=settings.mode==='sprint'?90:Math.min(1440,Math.max(1,Number(settings.minutes)||1))
  const compact=settings.mode==='sprint'||limit*cap<=90
  const all=pack.topics
  const selected=compact?all.slice(0,2):all
  const steps=[]
  const add=(kind,t,minutes)=>steps.push({key:kind+'-'+t.id,kind,topic:t.id,minutes})
  const study=(t)=>add('Study',t,compact?18:25)
  const practice=(t)=>add(compact?'Quick check':'Practice',t,compact?7:15)
  if(compact) selected.forEach(t=>{study(t);practice(t)})
  else {selected.forEach(study);selected.forEach(practice)}
  selected.forEach(t=>add('Revise',t,compact?8:12))
  const sessions=[]
  if(days && limit) {
    // Spread the work while respecting both each day's budget and the remaining days.
    const target=Math.min(cap,Math.max(1,Math.ceil(steps.reduce((n,s)=>n+s.minutes,0)/limit)))
    let day=0,used=0
    for(const step of steps) {
      let left=step.minutes
      while(left && day<limit) {
        const minutes=Math.min(left,target-used)
        sessions.push({...step,key:step.key+'-'+(step.minutes-left),day:day+1,minutes})
        used+=minutes;left-=minutes
        if(used===target){day++;used=0}
      }
    }
  }
  const deferred=all.filter(t=>!sessions.some(s=>s.topic===t.id && s.kind==='Study'))
  return {sessions,deferred,compact}
}
export async function requestStudy(task,pages,model,context='') {
  const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task,pages,model,context})})
  const json=await res.json()
  if(!res.ok) throw new Error(json.error || 'Local processing failed. Retry this step.')
  return json
}

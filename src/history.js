import {pageIndex} from './study.js'
const flat=text=>text.replace(/\s+/g,' ').trim()
export function paperChunks(pack) {
 const chunks=[]
 for(const p of pageIndex(pack.docs).filter(p=>p.kind==='pyq')) {
   for(let start=0;start<p.text.length;) {
     let end=Math.min(p.text.length,start+2000)
     if(end<p.text.length){const line=p.text.lastIndexOf('\n',end);if(line>start+500)end=line+1}
     chunks.push({id:p.id,kind:p.kind,text:p.text.slice(start,end),key:p.id+'@'+start,name:p.name,number:p.number})
     if(end===p.text.length)break
     start=end>start && p.text[end-1]==='\n'?end:end-180
   }
 }
 return chunks
}
// A number counts as a mark only when it occurs at the question boundary.
const marksAtEnd=/(?:[[(]\s*(\d{1,3})\s*(?:marks?|points?|pts?)?\s*[\])]|\b(\d{1,3})\s*(?:marks?|points?))\s*$/i
function yearOf(doc) {
 const header=doc.pages[0]?.text.split('\n').slice(0,4).filter(l=>/exam|semester|session|year|paper/i.test(l)&&!/^\s*(?:Q\s*)?\d+[.)]/i.test(l)).join(' ') || ''
 const years=[...new Set((doc.name+' '+header).match(/\b(?:19|20)\d{2}\b/g)||[])]
 return years.length===1?years[0]:null
}
export function historicalRows(pack) {
 const pages=pageIndex(pack.docs),rows=new Map()
 for(const batch of Object.values(pack.history||{}))for(const entry of batch){
   const page=pages.find(p=>p.id===entry.page&&p.kind==='pyq')
   if(!page)continue
   const source=flat(page.text),query=flat(entry.quote),start=source.indexOf(query)
   if(start<0 || query.length<8)continue
   const quote=source.slice(start,start+query.length)
   const doc=pack.docs.find(d=>d.id===page.docId)
   const tail=source.slice(start+query.length).match(/^\s*(\[\s*\d{1,3}\s*(?:marks?)?\s*\]|\(\s*\d{1,3}\s*marks?\s*\))/i)?.[0] || ''
   const mark=(quote+tail).match(marksAtEnd)
   rows.set(page.id+'|'+quote,{...entry,quote,name:doc.name,paper:doc.fingerprint||doc.id,number:page.number,year:yearOf(doc),marks:mark?Number(mark[1]||mark[2]):null})
 }
 return [...rows.values()]
}
export function skillGroups(rows) {
 const groups=new Map()
 for(const row of rows){
   const key=flat(row.skill).toLowerCase()
   if(!groups.has(key))groups.set(key,{skill:row.skill,rows:[],papers:new Set()})
   const group=groups.get(key);group.rows.push(row);group.papers.add(row.paper)
 }
 return [...groups.values()].sort((a,b)=>b.papers.size-a.papers.size)
}
const numbers={one:1,two:2,three:3,four:4,five:5,six:6}
const asNumber=word=>numbers[word]||Number(word)
function sectionLayout(doc) {
 if(doc.pages.some(p=>!p.text || p.issue))return null
 const lines=doc.pages.flatMap(p=>p.text.split(/\r?\n/)).map(s=>s.trim()).filter(Boolean)
 const sections=[]
 for(const line of lines) {
   const header=line.match(/^section\s+([a-z0-9]+)\s*[:.\-–—]?\s*(.*)$/i)
   if(header)sections.push({name:'Section '+header[1].toUpperCase(),take:null,count:null,marks:[]})
   const section=sections.at(-1)
   if(!section){if(/^\s*(?:Q\s*)?\d+[.)]|\b(?:optional|compulsory|attempt|answer any|choose|either)\b/i.test(line))return null;continue}
   const text=(header?header[2]:line).trim()
   if(!text)continue
   const choice=text.match(/^(?:answer|attempt|choose)\s+(?:any\s+)?(all|\d+|one|two|three|four|five|six)(?:\s+(?:of|out of)\s+(\d+|one|two|three|four|five|six))?(?:\s+questions?)?[.!]?$/i)
   if(choice){if(section.take!==null)return null;section.take=choice[1].toLowerCase()==='all'?'all':asNumber(choice[1].toLowerCase());section.count=choice[2]?asNumber(choice[2].toLowerCase()):null;continue}
   const q=text.match(/^(?:Q\.?\s*)?\d+[.)]\s+.+?[[(]\s*(\d{1,2})\s*(?:marks?)?\s*[\])]\s*$/i)
   if(!q || /\b(?:either|or alternatively)\b/i.test(text))return null
   section.marks.push(Number(q[1]))
 }
 if(!sections.length||sections.some(s=>!s.take||!s.marks.length||s.marks.some(n=>n<=0)||s.take>s.marks.length||(s.count&&s.count!==s.marks.length)))return null
 return sections.map(s=>({name:s.name,take:s.take==='all'?s.marks.length:s.take,marks:s.marks}))
}
export function consistentLayout(pack) {
 const papers=[...new Map(pack.docs.filter(d=>d.kind==='pyq').map(d=>[d.fingerprint||d.id,d])).values()]
 if(papers.length<2)return null
 const layouts=papers.map(sectionLayout)
 return layouts[0]&&layouts.every(layout=>JSON.stringify(layout)===JSON.stringify(layouts[0]))?layouts[0]:null
}
export function paperSlots(layout,groups) {
 if(!groups.length)return []
 const skills=groups.map(g=>g.skill)
 const sections=layout || [{name:'Practice set',take:Math.min(5,skills.length),marks:Array(Math.min(5,skills.length)).fill(null)}]
 let index=0
 return sections.flatMap(s=>s.marks.map((marks,i)=>({id:'p'+index,section:s.name,take:s.take,number:i+1,marks,skill:skills[index++%skills.length]})))
}

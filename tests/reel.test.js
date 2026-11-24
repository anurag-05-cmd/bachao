import test from 'node:test'
import assert from 'node:assert/strict'
import {consistentLayout,historicalRows,skillGroups,totalMarks} from '../src/history.js'
import {samplePack} from '../src/sample.js'
import {sampleQuiz} from '../src/sampleQuiz.js'
import {pageIndex} from '../src/study.js'

test('13 attempted marks exclude the unused choice and contradicting headers prevent mirroring',()=>{
 const pack=samplePack()
 assert.equal(totalMarks(consistentLayout(pack)),13)
 for(const doc of pack.docs.filter(d=>d.kind==='pyq'))doc.pages[0].text='Maximum marks: 18\n'+doc.pages[0].text
 assert.equal(consistentLayout(pack),null)
})
test('unequal optional marks cannot imply one fixed paper total',()=>{
 const pack=samplePack()
 for(const doc of pack.docs.filter(d=>d.kind==='pyq'))doc.pages[0].text=doc.pages[0].text.replace('[5 marks]','[6 marks]')
 assert.equal(consistentLayout(pack),null)
})
test('same DBMS topic can have different tested skills on the same page',()=>{
 const pack=samplePack(),doc=pack.docs.at(-1)
 const quote='Identify the transitive dependency in Booking.'
 doc.pages[0].text+='\n4. '+quote
 pack.history[doc.id+':1@0'].push({page:doc.id+':1',quote,skill:'Identify a transitive dependency'})
 const groups=skillGroups(historicalRows(pack))
 assert.equal(groups.find(g=>g.skill==='Identify a transitive dependency').papers.size,1)
 assert.equal(groups.find(g=>g.skill==='Decompose a relation using dependencies').papers.size,2)
 assert.equal(groups.at(-1).rows[0].marks,null)
})
test('each synthetic question links its answer to a specific note excerpt',()=>{
 const pack=samplePack()
 for (const t of pack.topics) {
   for(const question of sampleQuiz(t)){
     const ref=question.refs[0]
     const source=pageIndex(pack.docs).find(p=>p.id===ref.page)
     assert.equal(source.kind,'notes')
     assert.ok(source.text.includes(ref.quote))
   }
 }
 const normalization=sampleQuiz(pack.topics[0])
 assert.match(normalization[0].refs[0].quote,/Room\(roomID, building\)/)
 assert.match(normalization[4].refs[0].quote,/prime attribute/)
})

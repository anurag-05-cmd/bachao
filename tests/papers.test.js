import test from 'node:test'
import assert from 'node:assert/strict'
import {samplePack} from '../src/sample.js'
import {historicalRows,skillGroups,consistentLayout,paperSlots,paperChunks} from '../src/history.js'
import {validateResult} from '../shared/contracts.js'
test('equivalent questions count distinct papers and retain verified wording, year, marks and page',()=>{
 const pack=samplePack(), first=pack.docs.find(d=>d.kind==='pyq')
 pack.history.duplicate=[...Object.values(pack.history)[0]]
 pack.history.bad=[{page:first.id+':1',quote:'Invented wording appears here.',skill:'Invented'}]
 const rows=historicalRows(pack),groups=skillGroups(rows)
 assert.equal(rows.length,6);assert.equal(groups.length,3);assert.ok(groups.every(g=>g.papers.size===2))
 assert.equal(rows[0].year,'2023');assert.equal(rows[0].marks,5);assert.equal(rows[0].number,1)
 assert.equal(paperChunks(pack).length,2)
})
test('consistent explicit layouts preserve section choices and mark totals',()=>{
 const pack=samplePack(),layout=consistentLayout(pack)
 assert.deepEqual(layout,[{name:'Section A',take:1,marks:[5,5]},{name:'Section B',take:1,marks:[8]}])
 assert.deepEqual(paperSlots(layout,skillGroups(historicalRows(pack))).map(s=>s.marks),[5,5,8])
 pack.docs.at(-1).pages[0].text=pack.docs.at(-1).pages[0].text.replace('Answer one','Answer two')
 assert.equal(consistentLayout(pack),null)
})
test('unknown metadata and incomplete formats stay unknown',()=>{
 const doc={id:'x',kind:'pyq',name:'Revision paper',pages:[{number:1,text:'Explain how a dirty read happens.'}]}
 const pack={docs:[doc],history:{x:[{page:'x:1',quote:doc.pages[0].text,skill:'Trace a dirty read'}]}}
 assert.equal(historicalRows(pack)[0].year,null);assert.equal(historicalRows(pack)[0].marks,null)
 assert.equal(consistentLayout(pack),null)
 assert.throws(()=>validateResult('history',{questions:[{...pack.history.x[0],quote:'Made up exam question?'}]},paperChunks(pack)),/excerpt/i)
})
test('a second copy of the same paper cannot establish a consistent format',()=>{
 const pack=samplePack(),paper=pack.docs.at(-1)
 pack.docs=[{...paper,fingerprint:'same'},{...paper,id:'renamed',fingerprint:'same'}]
 assert.equal(consistentLayout(pack),null)
})

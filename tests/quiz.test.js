import test from 'node:test'
import assert from 'node:assert/strict'
import {grade,score,nextAction} from '../src/quiz.js'
import {samplePack} from '../src/sample.js'
import {sampleQuiz} from '../src/sampleQuiz.js'
import {pageIndex} from '../src/study.js'
import {validateResult} from '../shared/contracts.js'
const pack=samplePack()
test('all six sample tests have validated, referenced answer keys',()=>{
 for(const t of pack.topics){const questions=sampleQuiz(t);assert.equal(questions.length,5);validateResult('quiz',{questions},pageIndex(pack.docs))}
})
test('MCQ scoring leaves written answers for self-check',()=>{
 const items=sampleQuiz(pack.topics[0]).slice(0,3)
 const results=grade(items,{q0:0,q1:0,q2:'My explanation'})
 assert.deepEqual(score({results}),{right:1,total:2,pending:1})
 assert.throws(()=>validateResult('quiz',{questions:[{...items[0],answer:7}]},pageIndex(pack.docs)),/answer key/)
})
test('a missed answer recommends a budgeted revision slot only while available',()=>{
 const sessions=[{kind:'Study',topic:'t1',key:'study'},{kind:'Revise',topic:'t0',key:'review'}]
 const progress={...pack,attempts:[{topic:'t0',results:[{correct:false}]}]}
 assert.equal(nextAction({sessions},progress).key,'review')
 assert.equal(nextAction({sessions},{...progress,done:['review']}).key,'study')
})

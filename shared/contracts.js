import {z} from 'zod'
import {normalize} from '../src/materials.js'
const sentence=z.string().trim().min(1).max(1600)
export const ref=z.object({page:z.string().min(1),quote:z.string().trim().min(4).max(450)})
export const topicSchema=z.object({title:sentence,notes:sentence,points:z.array(sentence).min(1).max(4),example:sentence,outline:sentence,refs:z.array(ref).min(1).max(3)})
export const schemas={map:z.object({subject:sentence,topics:z.array(topicSchema).min(1).max(6)})}
export const instructions={map:'Build a compact study pack for the syllabus in these excerpts. Give at most six distinct syllabus topics in priority order. Cite a syllabus excerpt for every topic and use notes where relevant. In plain English give a short explanation, important points, a tiny worked example and an exam answer outline. Do not treat unanswered historical questions as answer keys.'}
export const pageSchema=z.object({id:z.string().min(1).max(160),kind:z.enum(['syllabus','notes','pyq']),text:z.string().min(1).max(2200)})
export function verifyRefs(refs,pages) {
  for(const ref of refs) {
    const page=pages.find(p=>p.id===ref.page)
    if(!page || !normalize(page.text).includes(normalize(ref.quote))) throw new Error('An excerpt did not match its source. Retry with a shorter, clearer excerpt.')
  }
}
export function validateResult(task,raw,pages) {
  const result=schemas[task].parse(raw)
  if(task==='map') for(const t of result.topics) {
    verifyRefs(t.refs,pages)
    if(!t.refs.some(r=>pages.find(p=>p.id===r.page)?.kind==='syllabus')) throw new Error('A topic lacked syllabus evidence. Retry the analysis.')
  }
  return result
}

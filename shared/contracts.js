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
  if(task==='quiz') {
    const seen=new Set()
    for(const q of result.questions) {
      verifyRefs(q.refs,pages)
      const key=normalize(q.prompt).toLowerCase()
      if(seen.has(key)) throw new Error('Duplicate quiz questions. Retry the test.')
      seen.add(key)
      if(q.kind==='mcq' && (q.options.length<2 || new Set(q.options.map(normalize)).size!==q.options.length || q.answer===null || q.answer<0 || q.answer>=q.options.length)) throw new Error('Invalid MCQ answer key. Retry the test.')
      if(q.kind==='short' && (q.answer!==null || q.options.length)) throw new Error('Invalid short-answer format. Retry the test.')
    }
  }
  return result
}
const question=z.object({
  prompt:sentence,kind:z.enum(['mcq','short']),options:z.array(sentence).max(5),
  answer:z.number().int().nullable(),explanation:sentence,points:z.array(sentence).min(1).max(5),
  refs:z.array(ref).min(1).max(3)
})
schemas.quiz=z.object({questions:z.array(question).max(5)})
instructions.quiz='Write up to five distinct test questions about the topic named in context, mixing MCQs with short answers. Aim for three usable questions first. Base each answer on cited source material. Return fewer if unsupported. For MCQs provide distinct options and a zero-based answer index. For short answers use empty options, a null answer and specific marking points. Explain each correct answer.'

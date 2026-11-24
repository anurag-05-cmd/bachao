import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { readPages, material } from './materials.js'
GlobalWorkerOptions.workerSrc = worker
export async function readPdf(kind,file,progress) {
  if (file.size > 50 * 1024 * 1024) throw new Error('Choose a PDF under 50 MB or paste the relevant pages.')
  const task = getDocument({ data:await file.arrayBuffer(), isEvalSupported:false, useSystemFonts:true })
  try { return await material(kind,file.name,await readPages(await task.promise,progress),file) }
  finally { await task.destroy() }
}

import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {samplePack} from '../src/sample.js'

// Make original, selectable-text PDFs from the same sources as the labelled sample.
function makePdf(pages) {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
  const children = []
  for (const page of pages) {
    const lines = page.text.replaceAll('→', '->').replaceAll('’', "'").split('\n')
      .flatMap(line => line.match(/.{1,88}(?:\s+|$)|\S+/g) || [''])
    const escape = text => text.trim().replace(/[\\()]/g, c => '\\' + c)
    const stream = ['BT /F1 11 Tf 16 TL 36 790 Td', ...lines.map(line => '('+escape(line)+') Tj T*'), 'ET'].join('\n')
    const number = objects.length + 1
    children.push(number+' 0 R')
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents '+(number+1)+' 0 R >>')
    objects.push('<< /Length '+Buffer.byteLength(stream)+' >>\nstream\n'+stream+'\nendstream')
  }
  objects[1]='<< /Type /Pages /Count '+children.length+' /Kids ['+children.join(' ')+'] >>'
  let pdf='%PDF-1.4\n'
  const offsets=[]
  for (const [i,obj] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf))
    pdf+=(i+1)+' 0 obj\n'+obj+'\nendobj\n'
  }
  const xref=Buffer.byteLength(pdf)
  pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'
  for(const offset of offsets) pdf+=String(offset).padStart(10,'0')+' 00000 n \n'
  return Buffer.from(pdf+'trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n')
}
export function reelFiles() {
  return samplePack().docs.map(doc=>({
    name:doc.name.replace(' · synthetic',' - synthetic')+'.pdf',kind:doc.kind,
    mimeType:'application/pdf',buffer:makePdf(doc.pages)
  }))
}
if (import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const dir=resolve('.cache/reel')
  await mkdir(dir,{recursive:true})
  for(const file of reelFiles()) await writeFile(resolve(dir,file.name),file.buffer)
  console.log('Four synthetic DBMS PDFs ready in '+dir)
}

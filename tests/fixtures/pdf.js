// Original two-page fixture, generated in memory so no uploaded PDFs enter Git.
export function syntheticPdf() {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Count 2 /Kids [3 0 R 4 0 R] >>']
  for (const stream of [6,7]) objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 5 0 R >> >> /Contents '+stream+' 0 R >>')
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  for (const text of ['BT /F1 12 Tf 20 100 Td (Database keys) Tj ET','']) objects.push('<< /Length '+text.length+' >>\nstream\n'+text+'\nendstream')
  let file='%PDF-1.4\n'; const offsets=[0]
  objects.forEach((obj,i)=>{offsets.push(file.length);file+=(i+1)+' 0 obj\n'+obj+'\nendobj\n'})
  const xref=file.length
  file+='xref\n0 '+offsets.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')
  return new TextEncoder().encode(file+'trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF')
}

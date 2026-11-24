export const kinds = { syllabus: 'Syllabus', notes: 'Notes & slides', pyq: 'Previous-year papers' }
export const normalize = text => text.normalize('NFKC').replace(/\s+/g, ' ').trim()
export async function digest(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2,'0')).join('')
}
export async function material(kind, name, pages, original) {
  const content = normalize(pages.map(p => p.text).join(' '))
  const fingerprint = await digest(content || name)
  return { id: kind + '-' + fingerprint, fingerprint, kind, name, pages, original }
}
export async function readPages(pdf, progress = () => {}) {
  const pages = []
  for (let number = 1; number <= pdf.numPages; number++) {
    progress(number, pdf.numPages)
    try {
      const page = await pdf.getPage(number)
      const content = await page.getTextContent()
      const text = content.items.filter(item => typeof item.str === 'string').map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('').trim()
      pages.push({number,text,issue:text ? '' : 'No readable text. Paste this page below.'})
      page.cleanup()
    } catch { pages.push({number,text:'',issue:'Page extraction failed. Paste the text below.'}) }
  }
  return pages
}
export function mergeMaterials(old, incoming) {
  return [...new Map([...old,...incoming].map(doc => [doc.id,doc])).values()]
}

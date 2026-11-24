import React, {useState} from 'react'
import { FileText, Upload, Plus } from 'lucide-react'
import { kinds, material, mergeMaterials } from './materials.js'
export function Sources({docs, onRemove}) {
  return <div className="sources">{docs.map(doc=><details key={doc.id}><summary><FileText size={16}/> {doc.name} <small>{kinds[doc.kind]} · {doc.pages.filter(p=>p.text).length}/{doc.pages.length} pages read</small></summary>{doc.pages.map(p=><div key={p.number}><b>Page {p.number}</b><pre>{p.issue || p.text}</pre></div>)}{onRemove&&<button className="textbtn" onClick={()=>onRemove(doc.id)}>Remove material</button>}</details>)}</div>
}
function Intake({kind, add, readingChanged}) {
  const [paste,setPaste]=useState(''),[name,setName]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false)
  async function files(input) {
    const files=Array.from(input.files); input.value='';setBusy(true);readingChanged(1)
    const errors=[]
    for(const file of files) {
      try {
        setStatus('Opening '+file.name)
        const {readPdf}=await import('./pdf.js')
        const doc=await readPdf(kind,file,(n,total)=>setStatus(file.name+' · Reading page '+n+' of '+total))
        add(doc)
        const unread=doc.pages.filter(page=>!page.text).map(page=>page.number)
        if(unread.length) errors.push(file.name+' · No readable text on page '+unread.join(', ')+'. Paste a transcription below.')
      } catch(e) {errors.push(file.name+' — '+e.message+' You can paste the text below.')}
    }
    setBusy(false);readingChanged(-1);setStatus(errors.join(' ') || 'Extraction finished. Review the source pages below.')
  }
  async function saveText() {
    const text=paste.trim(); if(!text) return
    add(await material(kind,name.trim() || kinds[kind]+' · '+text.slice(0,30),[{number:1,text,issue:''}]))
    setPaste('');setName('');setStatus('Pasted text added as one source page.')
  }
  return <section className="panel"><p className="eyebrow">{kind==='syllabus'?'Required':'Optional'}</p><h2>{kinds[kind]}</h2><label className="file"><Upload size={17}/> Choose PDFs<input aria-label={'Choose '+kinds[kind]+' PDFs'} type="file" multiple accept="application/pdf,.pdf" disabled={busy} onChange={e=>files(e.target)}/></label><details><summary>Paste text</summary><label>Source name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Unit 1 handout"/></label><label>Source text<textarea value={paste} onChange={e=>setPaste(e.target.value)} rows="5"/></label><button className="btn" onClick={saveText} disabled={!paste.trim()}><Plus size={16}/> Add text</button></details><small role="status">{status}</small></section>
}
export function Materials({docs,setDocs,children,readingChanged}) {
  const add=doc=>setDocs(old=>mergeMaterials(old,[doc]))
  return <><p className="eyebrow">Your sources</p><h1>Study materials</h1><p>Start with your syllabus. Add notes for explanations and past papers for question history.</p><div className="grid3">{Object.keys(kinds).map(kind=><Intake key={kind} kind={kind} add={add} readingChanged={readingChanged}/>)}</div><h2>Source pages</h2><p>Text-readable PDFs are extracted on this device. For a scanned page, paste its text and include the original page number in the source name.</p><Sources docs={docs} onRemove={id=>setDocs(old=>old.filter(d=>d.id!==id))}/>{children}</>
}

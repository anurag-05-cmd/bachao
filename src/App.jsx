import React from 'react'

import { BookOpen, Layers, LibraryBig, Files, LayoutDashboard, LockKeyhole } from 'lucide-react'
export function Shell({children, view='Study desk', navigate, sample=false}) {
  const entries = [[LayoutDashboard,'Study desk'],[LibraryBig,'Topics'],[Files,'PYQ insights'],[BookOpen,'Expected paper'],[Layers,'Materials']]
  return <div className="layout"><aside><div className="wordmark" aria-label="Bachao">bacha<span>o</span></div><nav aria-label="Workspace">{entries.map(([Icon,name])=><button key={name} className={view===name?'nav selected':'nav'} aria-current={view===name?'page':undefined} onClick={()=>navigate?.(name)}><Icon size={18}/>{name}</button>)}</nav><div className="privacy"><LockKeyhole size={16}/> Local workspace</div></aside><main><header><span>Workspace <i>/</i> <strong>{view}</strong></span><small>{sample?'Pre-generated sample':'On this device'}</small></header>{children}</main></div>
}

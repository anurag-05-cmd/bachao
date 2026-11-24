import React from 'react'
import logo from './assets/bachao.png'

import { BookOpen, Layers, LibraryBig, Files, LayoutDashboard, LockKeyhole } from 'lucide-react'
export function Shell({children, view='Study desk', navigate, sample=false}) {
  const entries = [[LayoutDashboard,'Study desk'],[LibraryBig,'Topics'],[Files,'PYQ insights'],[BookOpen,'Expected paper'],[Layers,'Materials']]
  const shortNames={'Study desk':'Desk','PYQ insights':'PYQs','Expected paper':'Paper'}
  return <div className="layout"><aside><div className="brand"><img src={logo} alt="Bachao"/></div><nav aria-label="Workspace">{entries.map(([Icon,name])=><button key={name} aria-label={name} className={view===name?'nav selected':'nav'} aria-current={view===name?'page':undefined} onClick={()=>navigate?.(name)}><Icon size={18}/><span className="longnav">{name}</span><span className="shortnav">{shortNames[name]||name}</span></button>)}</nav><div className="privacy"><LockKeyhole size={16}/> Local workspace</div></aside><main><header><span>Workspace <i>/</i> <strong>{view}</strong></span><small className={sample?"samplelabel":""}>{sample?'Pre-generated sample':'On this device'}</small></header>{children}</main></div>
}

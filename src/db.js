const dbPromise=()=>new Promise((resolve,reject)=>{
  const req=indexedDB.open('bachao-study-desk',1)
  req.onupgradeneeded=()=>req.result.createObjectStore('workspace')
  req.onerror=()=>reject(req.error);req.onsuccess=()=>resolve(req.result)
})
export async function access(operation) {
  const db=await dbPromise()
  try {return await new Promise((resolve,reject)=>{
    const tx=db.transaction('workspace',operation==='load'?'readonly':'readwrite')
    const store=tx.objectStore('workspace')
    const request=operation==='load'?store.get('desk'):operation==='delete'?store.clear():store.put(operation,'desk')
    tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)
  })} finally {db.close()}
}

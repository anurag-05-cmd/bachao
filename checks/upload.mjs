import assert from 'node:assert/strict'
import {preview} from 'vite'
import {testBrowser} from './edge.mjs'
import {reelFiles} from './demo-files.mjs'
import {generate} from '../server/local.js'
const server=await preview({preview:{host:'127.0.0.1',port:5275,strictPort:false},logLevel:'error'})
let browser
try {
  browser=await testBrowser({width:1100,height:820})
  const page=await browser.newPage()
  await page.goto(server.resolvedUrls.local[0])
  const button=name=>page.getByRole('button',{name,exact:true})
  const materials=()=>button('Materials').click()
  await materials()
  const files=reelFiles()
  const syllabus=page.getByLabel('Choose Syllabus PDFs')
  await syllabus.setInputFiles({name:'Unreadable fixture.pdf',mimeType:'application/pdf',buffer:Buffer.from('synthetic invalid PDF')})
  await page.getByText(/Unreadable fixture.pdf.*paste the text/i).waitFor()
  assert.equal(await button('Build my study pack').isDisabled(),true)
  await syllabus.setInputFiles(files[0])
  await page.getByText('Syllabus · 1/1 pages read').waitFor()

  let failure='missing',requests=0
  const acceptedKinds=[]
  // The test transport feeds Ollama protocol fixtures into the actual production validator.
  // It exists only in this isolated browser test.
  await page.route('**/api/generate',async route=>{
    const request=route.request().postDataJSON()
    requests++
    acceptedKinds.push(request.pages.map(p=>p.kind))
    try {
      const data=await generate(request,async url=>{
        if(failure==='missing')return new Response(null,{status:404})
        if(url.endsWith('/show'))return Response.json({})
        if(failure==='malformed')return Response.json({message:{content:'{incomplete'}})
        const p=request.pages[0]
        const topic={title:'Relational normalization',notes:'Separate facts that depend on different keys.',points:['Identify the key before decomposition.'],example:'Move each room and its building into Room.',outline:'Identify the dependency and show both relations.',refs:[{page:p.id,quote:'Relational normalization'}]}
        return Response.json({message:{content:JSON.stringify({subject:'Synthetic DBMS check',topics:[topic]})}})
      })
      await route.fulfill({json:data})
    }catch(e){await route.fulfill({status:400,json:{error:e.message}})}
  })
  await button('Build my study pack').click()
  await page.getByRole('alert').filter({hasText:/Model missing/}).waitFor()
  failure='malformed'
  await button('Retry analysis').click()
  await page.getByRole('alert').filter({hasText:/incomplete JSON/}).waitFor()
  assert.equal(await page.getByText('Synthetic DBMS check',{exact:true}).count(),0)
  failure=''
  await button('Retry analysis').click()
  await page.getByText('Synthetic DBMS check',{exact:true}).waitFor()
  assert.deepEqual(acceptedKinds.at(-1),['syllabus'])
  await materials()
  await page.getByLabel('Choose Notes & slides PDFs').setInputFiles(files[1])
  await page.getByText('Notes & slides · 6/6 pages read').waitFor()
  const papers=page.getByLabel('Choose Previous-year papers PDFs')
  await papers.setInputFiles([files[2],files[3],{...files[2],name:'Renamed 2023 - synthetic.pdf'}])
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('.sources summary')).filter(el=>el.textContent.includes('Previous-year papers')).length===2)
  await page.getByText('Extraction finished. Review the source pages below.',{exact:true}).last().waitFor()
  await button('Build my study pack').click()
  await page.getByText('Synthetic DBMS check',{exact:true}).waitFor()
  assert.equal(acceptedKinds.at(-1).filter(k=>k==='pyq').length,2)
  assert.ok(acceptedKinds.at(-1).includes('notes'))
  await page.reload()
  await page.getByText('Synthetic DBMS check',{exact:true}).waitFor()
  await materials()
  assert.equal(await button('Delete pack Synthetic DBMS check').count(),2)
  page.once('dialog',dialog=>dialog.accept())
  await button('Delete pack Synthetic DBMS check').last().click()
  await page.reload()
  await page.getByRole('heading',{name:'Study materials'}).waitFor()
  assert.equal(await button('Delete pack Synthetic DBMS check').count(),1)
  assert.equal(await page.locator('.sources').first().locator('summary').count(),4)
  assert.equal(requests,4)
  console.log('Native Edge: four real synthetic PDFs, renamed duplicate, unreadable PDF, syllabus-only input, missing-model and malformed-output recovery, reload and single-pack deletion passed using protocol fixtures.')
  if(process.env.BACHAO_TRY_LIVE){
    await page.unroute('**/api/generate')
    const started=performance.now()
    await button('Build my study pack').click()
    const failed=page.getByRole('alert')
    const ready=page.getByRole('button',{name:'Start studying'})
    await failed.or(ready).first().waitFor({timeout:250000})
    if(await failed.isVisible()) console.log('Genuine four-file inference attempt: '+await failed.innerText())
    else console.log('Genuine first study block ready in '+Math.round((performance.now()-started)/1000)+' seconds.')
  }
} finally {await browser?.close();await new Promise(resolve=>server.httpServer.close(resolve))}

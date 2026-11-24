import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {resolve} from 'node:path'
import {preview} from 'vite'
import {testBrowser} from './edge.mjs'
import {reelFiles} from './demo-files.mjs'

const server=await preview({preview:{host:'127.0.0.1',port:5277,strictPort:false},logLevel:'error'})
let browser
try {
  browser=await testBrowser({width:390,height:844})
  const page=await browser.newPage()
  const calls=[]
  page.on('request',r=>{if(r.url().endsWith('/api/generate'))calls.push(r.url())})
  const button=name=>page.getByRole('button',{name,exact:true})
  async function capture(name){
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
    if(process.env.BACHAO_CAPTURE){
      await mkdir('.cache/qa',{recursive:true})
      await page.screenshot({path:'.cache/qa/'+name+'.png'})
    }
  }
  await page.goto(server.resolvedUrls.local[0])
  await button('Add materials').click()
  const paths=reelFiles().map(file=>resolve('.cache/reel',file.name))
  await page.getByLabel('Choose Syllabus PDFs').setInputFiles(paths[0])
  await page.getByLabel('Choose Notes & slides PDFs').setInputFiles(paths[1])
  await page.getByLabel('Choose Previous-year papers PDFs').setInputFiles(paths.slice(2))
  await page.waitForFunction(()=>document.querySelectorAll('.sources summary').length===4)
  await button('Start fresh recording sample').click()
  await page.getByText('Pre-generated sample',{exact:true}).waitFor()
  assert.equal(await page.locator('.timeline details').count(),10)
  await page.getByRole('img',{name:'Bachao'}).waitFor()
  await capture('reel-ten-days')
  await button('90 min').click()
  await page.getByRole('heading',{name:'Deferred topics'}).waitFor()
  await page.evaluate(()=>scrollTo(0,0))
  await capture('reel-sprint')
  await button('Read compact notes').click()
  await page.getByRole('link',{name:'Jump to Test Me'}).click()
  await button('Quick Check · 3').click()
  await page.getByLabel('Make building part of every key').check()
  await page.getByLabel('A room determines its building').check()
  await page.getByRole('textbox',{name:'Outline the decomposition of Booking.'}).fill('Use separate Booking and Room tables.')
  await button('Submit answers').click()
  await page.getByText('1 / 2 correct').waitFor()
  await button('Met the marking points').click()
  await page.locator('#test-result').evaluate(el=>el.scrollIntoView({block:'start'}))
  await capture('reel-feedback')
  await button('Show my next block').click()
  await page.getByText(/Your last check flagged this topic. Room stores one building for each room/).waitFor()
  await button('PYQ insights').click()
  const first=page.locator('.reading section').first()
  await first.getByText('2 distinct papers').waitFor()
  const question=first.locator('.response').first()
  await question.locator('summary').click()
  await first.evaluate(el=>el.scrollIntoView({block:'start'}))
  assert.equal(await question.locator('mark').innerText(),await question.locator('blockquote').innerText())
  await capture('reel-source')
  await button('Materials').click()
  page.once('dialog',d=>d.accept())
  await button('Start fresh recording sample').click()
  await button('Start studying').waitFor()
  assert.equal(await page.locator('.timeline details').count(),10)
  assert.deepEqual(calls,[])
  console.log('Portrait reel passed from four synthetic file uploads through a fresh ten-day sample, sprint, missed answer, next block, highlighted source and repeat take. Zero inference requests.')
} finally {await browser?.close();await new Promise(resolve=>server.httpServer.close(resolve))}

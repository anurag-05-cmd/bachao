import {chromium} from 'playwright-core'
import {mkdir,mkdtemp,rm} from 'node:fs/promises'
import {resolve} from 'node:path'
export async function testBrowser(viewport) {
  const root=resolve('.cache/browser-checks')
  await mkdir(root,{recursive:true})
  const profile=await mkdtemp(resolve(root,'profile-'))
  const context=await chromium.launchPersistentContext(profile,{channel:process.env.BACHAO_BROWSER || 'msedge',headless:true,viewport})
  return {newPage:()=>context.newPage(),close:async()=>{
    await context.close()
    await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200})
  }}
}

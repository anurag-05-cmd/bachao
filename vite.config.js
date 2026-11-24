import {defineConfig} from 'vite'
import {localApi} from './server/local.js'
const middleware=server=>{server.middlewares.use(localApi)}
export default defineConfig({
  plugins:[{name:'bachao-local-api',configureServer:middleware,configurePreviewServer:middleware}],
  server:{host:'127.0.0.1',port:5173,strictPort:true},
  preview:{host:'127.0.0.1',port:5173,strictPort:true}
})

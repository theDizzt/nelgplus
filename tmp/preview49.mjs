import { createServer } from 'vite';
import { chromium } from 'file:///C:/Users/eorhk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const server=await createServer({server:{host:'127.0.0.1',port:5194}});await server.listen();
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:900,height:700}});
 await page.route('**/preview49',r=>r.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px"></section>'}));
 await page.goto('http://127.0.0.1:5194/preview49');
 for(let scene=2;scene<=9;scene++){
  await page.evaluate(async scene=>{
   const {level49}=await import('/src/levels/level49.ts');const {LevelScope}=await import('/src/core/LevelScope.ts');
   window.scope49?.dispose();window.scope49=new LevelScope({screen:document.querySelector('#screen'),levelNumber:49,initialScene:String(scene),audio:{}});
   window.scope49.setCustomCleanup(level49.mount(window.scope49.context));
   await document.fonts.ready;await document.querySelector('.level-49__sheet-music img').decode();
  },scene);
  if(scene===2||scene===6)await page.locator('#screen').screenshot({path:`tmp/level49-scene${scene}.png`});
  const fits=await page.locator('.level-49__sheet-music').evaluate(el=>{const b=el.getBoundingClientRect(),s=document.querySelector('#screen').getBoundingClientRect();return b.bottom<=s.bottom&&b.left>=s.left&&b.right<=s.right;});
  if(!fits)throw Error(`Scene ${scene} overflows`);
 }
 console.log('PASS all eight sheet images load and fit');
}finally{await browser.close();await server.close();}

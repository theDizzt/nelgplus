import { createServer } from 'vite';
import { chromium } from 'file:///C:/Users/eorhk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const server = await createServer({server:{host:'127.0.0.1',port:5193}});
await server.listen();
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
 const page = await browser.newPage({viewport:{width:900,height:700}});
 await page.route('**/preview63',r=>r.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px"></section>'}));
 await page.goto('http://127.0.0.1:5193/preview63');
 await page.evaluate(async()=>{
  const {level63}=await import('/src/levels/level63.ts'); const {LevelScope}=await import('/src/core/LevelScope.ts');
  window.done63=0; const scope=new LevelScope({screen:document.querySelector('#screen'),levelNumber:63,audio:{},complete:()=>window.done63++});
  scope.setCustomCleanup(level63.mount(scope.context)); await document.fonts.ready; await document.querySelector('img').decode();
 });
 await page.locator('#screen').screenshot({path:'tmp/level63-retro.png'});
 console.log(await page.locator('.level-63__copy').evaluate(el=>({bottom:el.getBoundingClientRect().bottom,statusTop:document.querySelector('.level-63__status').getBoundingClientRect().top,cursor:getComputedStyle(document.querySelector('#screen')).cursor})));
 await page.locator('input').pressSequentially('asterisk'); await page.locator('button').click();
 if(await page.evaluate(()=>window.done63)!==1) throw Error('Password failed');
 console.log('PASS password and render');
} finally {await browser.close();await server.close();}

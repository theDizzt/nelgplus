import { createServer } from 'vite';
import { chromium } from 'file:///C:/Users/eorhk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const server=await createServer({server:{host:'127.0.0.1',port:5192}});await server.listen();
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:900,height:700}});
 await page.route('**/preview62',r=>r.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px"></section>'}));
 await page.goto('http://127.0.0.1:5192/preview62');
 await page.evaluate(async()=>{document.body.innerHTML='<img id="sheet" src="/assets/handwriting/sheet.png" style="background:white">';await document.querySelector('img').decode();});
 await page.locator('#sheet').screenshot({path:'tmp/handwriting-sheet.png'});
 await page.reload();
 await page.evaluate(async()=>{
  const {level62}=await import('/src/levels/level62.ts');const {LevelScope}=await import('/src/core/LevelScope.ts');
  window.scope62=new LevelScope({screen:document.querySelector('#screen'),levelNumber:62,initialScene:'2',audio:{playMusic:async()=>{},stopMusic:()=>{},playEffect:()=>{}}});
  window.scope62.setCustomCleanup(level62.mount(window.scope62.context));await document.fonts.ready;
 });
 await page.mouse.move(850,650);
 await page.locator('#screen').screenshot({path:'tmp/level62-flash.png'});
 for(let i=0;i<30;i++)await page.locator(`[data-answer="${i%4}"]`).click();
 if(await page.locator('#screen').getAttribute('data-scene')!=='3')throw Error('Progression failed');
 if(await page.locator('#screen').getAttribute('data-score')!=='43'||await page.locator('#screen').getAttribute('data-result')!=='curious')throw Error('Mixed score failed');
 await page.locator('#screen').screenshot({path:'tmp/level62-result.png'});
 for(const [choice,score,result] of [[0,0,'careful'],[3,90,'fearless']]){
  await page.locator('.level-62__retry').click();
  for(let i=0;i<30;i++)await page.locator(`[data-answer="${choice}"]`).click();
  if(await page.locator('#screen').getAttribute('data-score')!==String(score)||await page.locator('#screen').getAttribute('data-result')!==result)throw Error('Score/reset/branch failed');
 }
 await page.evaluate(async()=>{
  const {LEVEL62_QUESTIONS,getLevel62Result}=await import('/src/levels/level62Questions.ts');
  if(LEVEL62_QUESTIONS.length!==30||LEVEL62_QUESTIONS.some(q=>q.choices.length!==4||q.image!==null))throw Error('Question defaults failed');
  for(const [score,id] of [[-1,'careful'],[29,'careful'],[30,'curious'],[59,'curious'],[60,'fearless'],[100,'fearless']])if(getLevel62Result(score).id!==id)throw Error('Boundary failed');
  LEVEL62_QUESTIONS[0].image='level106.png';
  LEVEL62_QUESTIONS[0].imageAlt='Sample question picture';
 });
 await page.locator('.level-62__retry').click();
 await page.locator('.level-62__question-image').evaluate(img=>img.decode());
 await page.locator('#screen').screenshot({path:'tmp/level62-question-image.png'});
 await page.locator('[data-answer="0"]').click();
 if(await page.locator('.level-62__question-image').isVisible()||await page.locator('.level-62__question-image').getAttribute('src')!==null)throw Error('Previous image not cleared');
 await page.evaluate(async()=>{
  const {setHandwritingText}=await import('/src/core/HandwritingText.ts');
  const {HANDWRITING_GLYPHS}=await import('/src/core/handwritingGlyphs.ts');
  if(Object.keys(HANDWRITING_GLYPHS).length!==43)throw Error('Expected 43 glyphs');
  const sample=document.createElement('div');sample.id='glyph-sample';sample.style.cssText='position:absolute;inset:0 auto auto 0;width:780px;padding:20px;background:white;color:black;font:64px/1.5 Arial';
  document.body.append(sample);setHandwritingText(sample,'ABCDEFGH\nIJKLMNOP\nQRSTUVWX\nYZ0123456\n789?!.()-,');
  if(sample.querySelectorAll('[data-glyph]').length!==43)throw Error('Missing glyphs');
 });
 await page.locator('#glyph-sample').screenshot({path:'tmp/handwriting-extracted.png'});
 await page.evaluate(async()=>{
  const {setHandwritingText}=await import('/src/core/HandwritingText.ts');
  const sample=document.querySelector('#glyph-sample');
  setHandwritingText(sample,"It's a test, isn't it?");
  const glyphs=[...sample.querySelectorAll('[data-glyph]')];
  if(glyphs.map(g=>g.dataset.glyph).join('')!=="IT'SATEST,ISN'TIT?")throw Error('Lowercase/apostrophe mapping failed');
  const apostrophe=glyphs.find(g=>g.dataset.glyph==="'");
  const comma=glyphs.find(g=>g.dataset.glyph===',');
  if(apostrophe.style.getPropertyValue('--glyph-y')!==comma.style.getPropertyValue('--glyph-y'))throw Error('Apostrophe must reuse comma');
  if(parseFloat(apostrophe.style.verticalAlign)<=parseFloat(comma.style.verticalAlign))throw Error('Apostrophe must be raised');
 });
 await page.locator('#glyph-sample').screenshot({path:'tmp/handwriting-apostrophe.png'});
 await page.evaluate(()=>window.scope62.dispose());
 console.log('PASS 30 questions, scoring, branch boundaries, retry reset, images and handwriting');
}finally{await browser.close();await server.close();}

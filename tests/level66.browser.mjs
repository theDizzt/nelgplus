import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({server:{host:'127.0.0.1',port:5186,strictPort:true}});
await server.listen();
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1000,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/level66-harness',route=>route.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px"></section>'}));
  await page.goto('http://127.0.0.1:5186/level66-harness');
  await page.evaluate(async()=>{
    const {level66}=await import('/src/levels/level66.ts');
    window.raf=null;window.time=0;
    window.requestAnimationFrame=cb=>(window.raf=cb,1);window.cancelAnimationFrame=()=>{window.raf=null};
    let dispose,abort;window.destinations=[];
    window.mount66=scene=>{dispose?.();abort?.abort();abort=new AbortController();dispose=level66.mount({screen:document.querySelector('#screen'),initialScene:scene,listen:(el,type,cb,opts)=>el.addEventListener(type,cb,{...opts,signal:abort.signal}),wrongAnswer:()=>false,goToLevel:n=>window.destinations.push(n)});};
    window.advance66=seconds=>{for(let i=0;i<seconds*120;i++){window.time+=1000/120;window.raf?.(window.time);}};
    window.mount66('1');
  });
  await page.evaluate(()=>document.fonts.ready);
  mkdirSync('tmp/level66',{recursive:true});
  await page.locator('#screen').screenshot({path:'tmp/level66/main.png'});
  assert.equal(await page.locator('.level-66__rules li').count(),8);
  await page.locator('[data-begin]').click();
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'2');
  for(const scale of [1,.65]){
    await page.evaluate(scale=>{window.mount66('2');document.querySelector('#screen').style.transform=`scale(${scale})`;document.querySelector('#screen').style.transformOrigin='top left';},scale);
    const obj=page.locator('[data-object="1"]');const b=await obj.boundingBox();
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2-30*scale,b.y+b.height/2,{steps:4});await page.mouse.up();
    assert.ok(Math.abs(await obj.evaluate(el=>parseFloat(el.style.left))-235)<1);
  }
  await page.evaluate(()=>{window.mount66('2');document.querySelector('#screen').style.transform='none'});
  const staticBefore=await page.locator('[data-object="6"]').getAttribute('style');
  const hot=await page.locator('[data-object="6"]').boundingBox();await page.mouse.move(hot.x+10,hot.y+10);await page.mouse.down();await page.mouse.move(hot.x+80,hot.y+10);await page.mouse.up();
  assert.equal(await page.locator('[data-object="6"]').getAttribute('style'),staticBefore);
  // Continuous path built by keyboard dragging; all five portals advance in order.
  for(let scene=2;scene<=6;scene++){
    for(const [index,steps] of [[1,6],[2,13]]) {await page.locator(`[data-object="${index}"]`).focus();for(let n=0;n<steps;n++)await page.keyboard.press('ArrowLeft');}
    await page.locator('.level-66__form button').click();
    await page.evaluate(()=>window.advance66(.25));
    assert.match(await page.locator('.level-66__runner').getAttribute('src'),/red_[23]\.png/);
    await page.evaluate(()=>window.advance66(6));
    assert.equal(await page.locator('#screen').getAttribute('data-scene'),String(scene+1));
  }
  assert.match(await page.locator('.level-66__finish').textContent(),/redguy must GO!!!/);
  await page.evaluate(()=>window.mount66('4'));
  // Remove the starting floor so redguy falls; retry preserves the placement.
  await page.locator('[data-object="0"]').focus();for(let i=0;i<12;i++)await page.keyboard.press('Shift+ArrowRight');
  const saved=await page.locator('[data-object="0"]').evaluate(el=>el.style.cssText);
  await page.locator('.level-66__form button').click();await page.evaluate(()=>window.advance66(1));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'8');
  await page.locator('#screen').screenshot({path:'tmp/level66/failed.png'});
  assert.equal(await page.locator('.level-66__sinking').evaluate(el=>getComputedStyle(el).animationIterationCount),'1');
  await page.locator('[data-retry]').click();assert.equal(await page.locator('#screen').getAttribute('data-scene'),'4');
  assert.equal(await page.locator('[data-object="0"]').evaluate(el=>el.style.cssText),saved);
  await page.locator('.level-66__form button').click();await page.evaluate(()=>window.advance66(1));
  assert.ok(await page.locator('.level-66__sinking').evaluate(el=>el.getAnimations()[0].currentTime)<1000);
  // Every password form accepts exact mixed-case punctuation.
  for(let scene=2;scene<=7;scene++){
    await page.evaluate(scene=>window.mount66(String(scene)),scene);
    await page.locator('input').focus();await page.keyboard.type('redguy must GO!!!');await page.keyboard.press('Enter');
  }
  assert.deepEqual(await page.evaluate(()=>window.destinations),[67,67,67,67,67,67]);
  await page.evaluate(()=>window.mount66('2'));
  await page.locator('#screen').screenshot({path:'tmp/level66/puzzle.png'});
  const checks = await page.evaluate(async () => {
    const input = document.querySelector('.level-66__form input');
    const measure = el => { const s = getComputedStyle(el); return [s.width, s.height, s.padding, s.borderWidth, s.boxSizing, s.fontSize]; };
    const original = document.createElement('div');
    original.innerHTML = '<form class="level-08__form"><input class="nelg-password-input"><button>GO</button></form>';
    document.body.append(original);
    const sizes = [measure(input), measure(original.querySelector('input'))];
    const tabBlocked = target => [false, true].every(shiftKey => {
      target.focus();
      const e = new KeyboardEvent('keydown', {key:'Tab', shiftKey, bubbles:true, cancelable:true});
      target.dispatchEvent(e); return e.defaultPrevented;
    });
    const blocked66 = tabBlocked(input);
    original.remove();
    // Dispose Level 66 listeners before testing Level 65 in isolation.
    window.mount66('1');
    const {level65} = await import('/src/levels/level65.ts');
    const screen = document.createElement('section'); document.body.append(screen);
    const controller = new AbortController();
    // Capture listener registration so this test can isolate the Level 65 handler.
    const keyListeners = [];
    const cleanup = level65.mount({screen, initialScene:'equation', session:{hasFlag:()=>false},
      listen:(el,type,cb,options)=>{ if(el===document && type==='keydown') keyListeners.push(cb); else el.addEventListener(type,cb,{...options,signal:controller.signal}); },
      timeout:()=>0, goToMenu:()=>{}, complete:()=>{}, wrongAnswer:()=>false});
    const blocked65 = [false,true].every(shiftKey=>{
      const e = new KeyboardEvent('keydown',{key:'Tab',shiftKey,cancelable:true});
      keyListeners.forEach(cb=>cb(e)); return e.defaultPrevented;
    });
    controller.abort(); cleanup?.(); screen.remove();
    return {sizes,blocked65,blocked66};
  });
  assert.deepEqual(checks.sizes[0],checks.sizes[1], 'Level 66 input matches Level 8 dimensions');
  assert.ok(checks.blocked65 && checks.blocked66, 'Tab and Shift+Tab blocked on both levels');
  assert.deepEqual(errors,[]);
  console.log('Level 66 browser checks passed: scenes, scale-aware drag, fixed hazards, five clears, retry, animation replay, six password forms.');
}finally{await browser.close();await server.close();}

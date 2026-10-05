import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({server:{host:'127.0.0.1',port:5186,strictPort:true}});
await server.listen();
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1000,height:800}});
  page.setDefaultTimeout(5000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/level66-harness',route=>route.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/src/styles/global.css"><section id="screen" style="position:relative;width:800px;height:600px"></section>'}));
  await page.goto('http://127.0.0.1:5186/level66-harness');
  await page.evaluate(async()=>{
    const {level66}=await import('/src/levels/level66.ts');
    window.raf=null;window.time=0;
    window.requestAnimationFrame=cb=>(window.raf=cb,1);window.cancelAnimationFrame=()=>{window.raf=null};
    let dispose,abort;window.destinations=[];window.effects66=[];
    window.mount66=scene=>{dispose?.();abort?.abort();abort=new AbortController();dispose=level66.mount({screen:document.querySelector('#screen'),initialScene:scene,audio:{playMusic:async()=>{},stopMusic:()=>{},playEffect:source=>window.effects66.push(source)},listen:(el,type,cb,opts)=>el.addEventListener(type,cb,{...opts,signal:abort.signal}),wrongAnswer:()=>false,goToLevel:n=>window.destinations.push(n)});};
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
    await page.evaluate(scale=>{window.mount66('5');document.querySelector('#screen').style.transform=`scale(${scale})`;document.querySelector('#screen').style.transformOrigin='top left';},scale);
    const obj=page.locator('[data-object="1"]');const b=await obj.boundingBox();
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2-30*scale,b.y+b.height/2,{steps:4});await page.mouse.up();
    assert.ok(Math.abs(await obj.evaluate(el=>parseFloat(el.style.left))-178)<1);
  }
  await page.evaluate(()=>{window.mount66('2');document.querySelector('#screen').style.transform='none'});
  for(const hazard of [6,7]){
    await page.evaluate(()=>window.mount66('5'));
    const box=await page.locator(`[data-object="${hazard}"]`).boundingBox();
    const before=await page.evaluate(()=>window.effects66.length);
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
    assert.equal(await page.locator('#screen').getAttribute('data-scene'),'9');
    assert.equal(await page.locator('.level-66__perished').textContent(),'PERISHED');
    assert.equal(await page.locator('.level-66__cursor-explosion i').count(),16);
    assert.deepEqual(await page.evaluate(n=>window.effects66.slice(n),before),['sounds/explosion.mp3']);
    await page.mouse.move(780,580);
    assert.equal(await page.evaluate(()=>window.effects66.length),before+1);
    await page.locator('[data-retry]').click();
    assert.equal(await page.locator('#screen').getAttribute('data-scene'),'5');
  }
  // Admin preview includes the new scene and plays the same effect.
  await page.evaluate(()=>window.mount66('9'));
  await page.locator('.level-66__cursor-explosion').evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=180;}));
  await page.locator('#screen').screenshot({path:'tmp/level66/cursor-perished.png'});
  await page.evaluate(()=>window.mount66('2'));
  assert.ok(await page.locator('.level-32__portal').evaluate(el=>{
    const outer=el.getBoundingClientRect();
    return [...el.children].every(child=>{const r=child.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=outer.left&&r.right<=outer.right&&r.top>=outer.top&&r.bottom<=outer.bottom;});
  }),'Portal rings remain positive and inside the frame');
  const fixed=page.locator('.level-66__fixed-floor');
  assert.equal(await fixed.getAttribute('data-allow-drag'),null);
  const fixedStyle=await fixed.getAttribute('style');
  await fixed.dispatchEvent('keydown',{key:'ArrowRight',bubbles:true});
  assert.equal(await fixed.getAttribute('style'),fixedStyle);
  const floorBox=await fixed.boundingBox();
  const runnerBox=await page.locator('.level-66__runner').boundingBox();
  assert.ok(Math.abs(runnerBox.y+runnerBox.height-floorBox.y)<1,'Red guy starts on blue floor');
  // Arrange Scene 2 with real pointer drags, keeping the cursor away from the red wall.
  for(const [index,dx,dy] of [[0,288,-32],[1,-329.6,24],[4,32,6.4],[5,-198.4,-51.2]]){
    await page.mouse.move(950,750);
    const box=await page.locator(`[data-object="${index}"]`).boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+3);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width/2+dx,box.y+3+dy,{steps:8});
    await page.mouse.up();
    assert.equal(await page.locator('#screen').getAttribute('data-scene'),'2');
  }
  await page.locator('#screen').screenshot({path:'tmp/level66/scene2-solved.png'});
  await page.mouse.move(950,750);
  await page.locator('.level-66__form button').click();
  await page.evaluate(()=>window.advance66(15));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'3');
  await page.locator('#screen').screenshot({path:'tmp/level66/scene3.png'});
  assert.equal(await page.locator('.level-66__ladder').count(),2);
  assert.equal(await page.locator('.level-66__spring').count(),4);
  const pieces=await page.locator('[data-allow-drag]').evaluateAll(els=>els.map(el=>({index:el.dataset.object,x:parseFloat(el.style.left),y:parseFloat(el.style.top),floor:el.classList.contains('level-32__platform')&&!el.classList.contains('level-66__spring')})));
  let floorIndex=0;
  for(const piece of pieces){
    const target=piece.floor?{x:200+70*floorIndex++,y:240}:{x:20,y:440};
    await page.locator(`[data-object="${piece.index}"]`).focus();
    for(const [delta,negative,positive] of [[target.x-piece.x,'ArrowLeft','ArrowRight'],[target.y-piece.y,'ArrowUp','ArrowDown']]){
      const key=delta<0?negative:positive;
      for(let n=0;n<Math.floor(Math.abs(delta)/20);n++)await page.keyboard.press(`Shift+${key}`);
      for(let n=0;n<Math.round(Math.abs(delta)%20/5);n++)await page.keyboard.press(key);
    }
  }
  await page.locator('.level-66__form button').click();
  await page.evaluate(()=>window.advance66(15));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'4');
  await page.evaluate(()=>window.mount66('4'));
  await page.mouse.move(950,750);
  await page.locator('#screen').screenshot({path:'tmp/level66/scene4.png'});
  const steveStart=await page.locator('[data-object="5"]').evaluate(el=>parseFloat(el.style.left));
  await page.evaluate(()=>window.advance66(1));
  const steveMoved=await page.locator('[data-object="5"]').evaluate(el=>parseFloat(el.style.left));
  assert.ok(steveMoved<steveStart-35,'Steve patrols before GO');
  assert.equal(await page.locator('.level-66__rising-lava').evaluate(el=>parseFloat(el.style.top)),590,'Lava waits for GO');
  // Put the mouse ahead of Steve and keep it still: movement must trigger Scene 9.
  const screenBox=await page.locator('#screen').boundingBox();
  await page.mouse.move(screenBox.x+130,screenBox.y+260);
  await page.evaluate(()=>window.advance66(3));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'9');
  await page.locator('[data-retry]').click();
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'4');
  assert.ok(Math.abs(await page.locator('[data-object="5"]').evaluate(el=>parseFloat(el.style.left))-steveStart)<1,'Retry resets patrol');
  await page.locator('.level-66__form button').click();
  await page.mouse.move(screenBox.x+780,screenBox.y+588);
  await page.evaluate(()=>window.advance66(.25));
  assert.ok(await page.locator('.level-66__rising-lava').evaluate(el=>parseFloat(el.style.top))<590,'Lava rises after GO');
  await page.evaluate(()=>window.advance66(.5));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'9','Rising lava hits stationary cursor');
  await page.locator('[data-retry]').click();
  assert.equal(await page.locator('.level-66__rising-lava').evaluate(el=>parseFloat(el.style.top)),590,'Retry resets lava');
  await page.mouse.move(950,750);
  await page.locator('.level-66__form button').click();
  await page.mouse.move(950,750);
  await page.evaluate(()=>window.advance66(5));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'8','Unsolved runner falls into lava');
  await page.locator('[data-retry]').click();
  await page.mouse.move(950,750);
  const fourthPieces=await page.locator('[data-allow-drag]').evaluateAll(els=>els.map(el=>({index:Number(el.dataset.object),x:parseFloat(el.style.left),y:parseFloat(el.style.top)})));
  const fourthDrawing=[[294,215],[508,300],[666,252],[121,472],[589,361],[787,130],[199,269],[433,300],[288,578],[520,510],[710,253]];
  const fourthTargets=Object.fromEntries(fourthDrawing.map(([x,y],i)=>[i+9,{x:100+x*.62,y:120+y*.62}]));
  for(const piece of fourthPieces){
    const target=fourthTargets[piece.index]??{x:20,y:195};
    await page.locator(`[data-object="${piece.index}"]`).focus();
    for(const [delta,negative,positive] of [[target.x-piece.x,'ArrowLeft','ArrowRight'],[target.y-piece.y,'ArrowUp','ArrowDown']]){
      const key=delta<0?negative:positive;
      for(let n=0;n<Math.floor(Math.abs(delta)/20);n++)await page.keyboard.press(`Shift+${key}`);
      for(let n=0;n<Math.round(Math.abs(delta)%20/5);n++)await page.keyboard.press(key);
    }
    // Finish fractional diagram coordinates with a small, real pointer drag.
    await page.mouse.move(950,750);
    const el=page.locator(`[data-object="${piece.index}"]`);
    const current=await el.evaluate(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top)}));
    const box=await el.boundingBox();
    await page.mouse.move(box.x+3,box.y+3);
    await page.mouse.down();
    await page.mouse.move(box.x+3+target.x-current.x,box.y+3+target.y-current.y);
    await page.mouse.up();
    assert.equal(await page.locator('#screen').getAttribute('data-scene'),'4');
  }
  await page.locator('#screen').screenshot({path:'tmp/level66/scene4-route.png'});
  await page.mouse.move(950,750);
  await page.locator('.level-66__form button').click();
  await page.mouse.move(950,750);
  await page.evaluate(()=>window.advance66(20));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'5');
  // Continuous path built by keyboard dragging; all five portals advance in order.
  for(let scene=5;scene<=6;scene++){
    for(const [index,steps] of [[1,4],[2,8]]) {await page.locator(`[data-object="${index}"]`).focus();for(let n=0;n<steps;n++)await page.keyboard.press('ArrowLeft');}
    await page.locator('.level-66__form button').click();
    await page.evaluate(()=>window.advance66(.25));
    assert.match(await page.locator('.level-66__runner').getAttribute('src'),/red_[23]\.png/);
    await page.evaluate(()=>window.advance66(6));
    assert.equal(await page.locator('#screen').getAttribute('data-scene'),String(scene+1));
  }
  assert.match(await page.locator('.level-66__finish').textContent(),/redguy must GO!!!/);
  await page.evaluate(()=>window.mount66('5'));
  // Remove the starting floor so redguy falls; retry preserves the placement.
  await page.locator('[data-object="0"]').focus();for(let i=0;i<12;i++)await page.keyboard.press('Shift+ArrowRight');
  const saved=await page.locator('[data-object="0"]').evaluate(el=>el.style.cssText);
  await page.locator('.level-66__form button').click();await page.evaluate(()=>window.advance66(1));
  assert.equal(await page.locator('#screen').getAttribute('data-scene'),'8');
  await page.locator('#screen').screenshot({path:'tmp/level66/failed.png'});
  assert.equal(await page.locator('.level-66__sinking').evaluate(el=>getComputedStyle(el).animationIterationCount),'1');
  await page.locator('[data-retry]').click();assert.equal(await page.locator('#screen').getAttribute('data-scene'),'5');
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

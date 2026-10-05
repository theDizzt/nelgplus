import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const {outputText}=ts.transpileModule(readFileSync(new URL('../src/levels/level66Physics.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
const {createRunner,stepRunner,draggable,PUZZLES,scalePuzzle,MINIGAME_SCALE,updatePatrol,lavaSurface}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const portal={x:740,y:420,width:50,height:90};
const floor={kind:'floor',x:0,y:510,width:800,height:24};
const wall={kind:'wall',x:180,y:300,width:24,height:210};
function advance(p, objects, seconds=1, target=portal) {let result='running';for(let i=0;i<seconds*120&&result==='running';i++)result=stepRunner(p,objects,target,1/120);return result;}
test('starts right, lands on floors and turns at black walls',()=>{const p=createRunner({x:100,y:438});assert.equal(advance(p,[floor,wall],.7),'running');assert.equal(p.direction,-1);assert.equal(p.y,438);assert.ok(p.x<142);});
test('jump pad launches through black walls, ordinary landing ends immunity',()=>{const p=createRunner({x:100,y:438});const spring={kind:'spring',x:90,y:510,width:64,height:24};advance(p,[floor,spring,wall],.7);assert.equal(p.direction,1);assert.ok(p.x>180);assert.equal(p.boosted,true);advance(p,[floor],1);assert.equal(p.boosted,false);assert.equal(p.grounded,true);});
test('boosted player still dies on hot walls and Steve',()=>{for(const kind of ['hot','steve']){const p=createRunner({x:140,y:360});p.boosted=true;assert.equal(advance(p,[{...wall,kind}],.1),'dead');}});
test('ladder always climbs upward and releases at the top',()=>{const p=createRunner({x:100,y:438});const ladder={kind:'ladder',x:100,y:340,width:46,height:170};advance(p,[floor,ladder],.5);assert.equal(p.mode,'climbing');assert.ok(p.y<438);advance(p,[floor,ladder],1.3);assert.equal(p.ladder,null);assert.ok(p.x>=146);});
test('leaving any screen edge kills player',()=>{for(const start of [{x:-1,y:300},{x:763,y:300},{x:30,y:-1},{x:30,y:529}])assert.equal(advance(createRunner(start),[]),'dead');});
test('portal clears only when reached alive',()=>{const p=createRunner({x:710,y:438});assert.equal(advance(p,[floor]),'clear');assert.equal(advance(createRunner({x:710,y:438}),[{kind:'hot',...portal}]),'dead');});
test('only construction pieces can move and provisional maps are independent',()=>{assert.deepEqual(['floor','wall','ladder','spring','hot','steve'].map(kind=>draggable({kind})),[true,true,true,true,false,false]);assert.equal(PUZZLES.length,5);assert.notEqual(PUZZLES[0].objects[0],PUZZLES[1].objects[0]);});

test('walking into a jump pad resting on a floor triggers a launch',()=>{const p=createRunner({x:100,y:438});advance(p,[floor,{kind:'spring',x:145,y:486,width:64,height:24}],.2);assert.equal(p.boosted,true);assert.ok(p.vy<0);});

test('Scene 2 diagram route clears after arranging pieces; blue floor is fixed',()=>{
  const layout=structuredClone(PUZZLES[0]);
  for(const [index,x,y] of [[0,424,230],[1,148,510],[4,110,398],[5,352,356]])Object.assign(layout.objects[index],{x,y});
  assert.equal(draggable(layout.objects[2]),false);
  const scaled=scalePuzzle(layout,MINIGAME_SCALE);
  const p=createRunner(scaled.start,MINIGAME_SCALE);
  assert.equal(advance(p,scaled.objects,15,scaled.portal),'clear');
  const unsolved=scalePuzzle(PUZZLES[0],MINIGAME_SCALE);
  assert.equal(advance(createRunner(unsolved.start,MINIGAME_SCALE),unsolved.objects,15,unsolved.portal),'dead');
});

test('Scene 3 fixed diagram, scattered inventory and a buildable route',()=>{
  const layout=scalePuzzle(PUZZLES[1],MINIGAME_SCALE);
  assert.equal(layout.objects.filter(o=>o.kind==='hot').length,6);
  assert.equal(layout.objects.filter(o=>o.kind==='ladder').length,2);
  assert.equal(layout.objects.filter(o=>o.kind==='spring').length,4);
  const blue=layout.objects.find(o=>o.fixed);
  assert.ok(Math.abs(layout.start.y+72*MINIGAME_SCALE-blue.y)<.001);
  assert.equal(advance(createRunner(layout.start,MINIGAME_SCALE),layout.objects,15,layout.portal),'dead');
  let floorIndex=0;
  for(const object of layout.objects){
    assert.ok(object.x>=0&&object.y>=175&&object.x+object.width<=800&&object.y+object.height<=540);
    if(!draggable(object))continue;
    if(object.kind==='floor'){object.x=200+70*floorIndex++;object.y=240;}
    else{object.x=20;object.y=440;}
  }
  assert.equal(advance(createRunner(layout.start,MINIGAME_SCALE),layout.objects,15,layout.portal),'clear');
});

test('Scene 4 diagram route clears with patrolling Steve and rising lava',()=>{
  const layout=scalePuzzle(PUZZLES[2],MINIGAME_SCALE);
  const steve=layout.objects.find(o=>o.patrol);
  const duration=(steve.patrol.maxX-steve.patrol.minX)/steve.patrol.speed;
  assert.equal(updatePatrol(steve,0),-1);
  assert.equal(steve.x,steve.patrol.maxX);
  assert.equal(updatePatrol(steve,duration),1);
  assert.ok(Math.abs(steve.x-steve.patrol.minX)<.001);
  const drawing=[[294,215],[508,300],[666,252],[121,472],[589,361],[787,130],[199,269],[433,300],[288,578],[520,510],[710,253]];
  const movable=layout.objects.filter(draggable);
  drawing.forEach(([x,y],i)=>Object.assign(movable[i],{x:100+x*.62,y:120+y*.62}));
  assert.equal(layout.objects.filter(o=>o.fixed).length,4);
  assert.equal(lavaSurface(layout,0),590);
  assert.equal(lavaSurface(layout,10),560);
  const p=createRunner(layout.start,MINIGAME_SCALE);
  let result='running';
  for(let i=0;i<20*120&&result==='running';i++){
    updatePatrol(steve,i/120);
    assert.ok(steve.x>=steve.patrol.minX&&steve.x<=steve.patrol.maxX);
    result=stepRunner(p,layout.objects,layout.portal,1/120);
    if(p.y+p.height>=lavaSurface(layout,i/120))result='dead';
  }
  assert.equal(result,'clear');
});

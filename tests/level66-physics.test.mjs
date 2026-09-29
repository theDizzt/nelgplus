import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const {outputText}=ts.transpileModule(readFileSync(new URL('../src/levels/level66Physics.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
const {createRunner,stepRunner,draggable,PUZZLES}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
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

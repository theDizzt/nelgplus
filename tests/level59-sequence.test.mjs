import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/levels/level59Sequence.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { bombTouchesEdge, CORRECT_SHAPES, createSequence, nextPath, scoreFor, failureScene, meteorHits } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("fast meteor collision covers its full swept path and excludes misses", () => {
  assert.equal(meteorHits(400,300,100,300,700,300),true);
  assert.equal(meteorHits(400,328,100,300,700,300),true);
  assert.equal(meteorHits(400,329,100,300,700,300),false);
  assert.equal(meteorHits(400,300,100,0,700,600),true);
  assert.equal(meteorHits(740,300,100,300,700,300),false);
  assert.equal(meteorHits(100,100,100,100,100,100),true);
});

test("25 unique answers include thinking face and reach exactly 100%, without duplicate credit", () => {
  assert.equal(CORRECT_SHAPES.length, 25);
  assert.equal(new Set(CORRECT_SHAPES).size, 25);
  assert.deepEqual(CORRECT_SHAPES.slice(-4), [47,48,53,55]);
  const found = new Set(CORRECT_SHAPES);
  found.add(48); found.add(2);
  assert.equal(scoreFor(found), 100);
  assert.equal(scoreFor(new Set(CORRECT_SHAPES.slice(0,21))), 84);
});

test("shuffled answers and all 30 distractors repeat in their chosen order; gaps stay within 0–3", () => {
  let seed = 591;
  const random = () => ((seed = (seed*1664525+1013904223) >>> 0) / 2**32);
  const next = createSequence(random);
  const stream = Array.from({length:1500},next);
  const correct = stream.filter(id => CORRECT_SHAPES.includes(id));
  assert.deepEqual([...correct.slice(0,25)].sort((a,b) => a-b), [...CORRECT_SHAPES]);
  assert.notDeepEqual(correct.slice(0,25), [...CORRECT_SHAPES]);
  correct.forEach((id,i) => assert.equal(id,correct[i%25]));
  const nextAttempt = createSequence(random);
  const nextAnswers = Array.from({length:150},nextAttempt).filter(id => CORRECT_SHAPES.includes(id)).slice(0,25);
  assert.notDeepEqual(nextAnswers, correct.slice(0,25));
  const wrong = stream.filter(id => !CORRECT_SHAPES.includes(id));
  assert.equal(new Set(wrong.slice(0,30)).size,30);
  wrong.forEach((id,i) => assert.equal(id,wrong[i%30]));
  let gap = 0;
  for (const id of stream) {
    if (CORRECT_SHAPES.includes(id)) gap = 0;
    else assert.ok(++gap <= 3);
  }
});

test("penalty decoys share the shuffled repeating wrong pool and the 0–3 gap limit", () => {
  let seed = 59;
  const random = () => ((seed = (seed*1664525+1013904223) >>> 0) / 2**32);
  const decoys = [101,104,107,109,113,117];
  const stream = Array.from({length:1500},createSequence(random,decoys));
  const wrong = stream.filter(id => !CORRECT_SHAPES.includes(id));
  const pool = wrong.slice(0,36);
  assert.equal(new Set(pool).size,36);
  decoys.forEach(id => assert.ok(pool.includes(id)));
  wrong.forEach((id,i) => assert.equal(id,pool[i%36]));
  let gap = 0;
  for (const id of stream) {
    if (CORRECT_SHAPES.includes(id)) gap = 0;
    else assert.ok(++gap <= 3);
  }
});

test("all eight paths enter and exit off-screen without repeating the previous direction", () => {
  const directions = new Set();
  for (let previous = -1; previous < 8; previous++) {
    for (let i=0; i<80; i++) {
      const path = nextPath(previous, () => i/80);
      assert.notEqual(path.direction,previous);
      directions.add(path.direction);
      const [x1,y1,x2,y2] = path.points;
      assert.ok(x1<0 || x1>800 || y1<0 || y1>600);
      assert.ok(x2<0 || x2>800 || y2<0 || y2>600);
    }
  }
  assert.equal(directions.size,8);
});

test("the 84% reward takes precedence over every failure cause", () => {
  assert.equal(failureScene(80,"shape"),"3");
  assert.equal(failureScene(80,"mine"),"4");
  assert.equal(failureScene(80,"bomb"),"4");
  for (const cause of ["shape","mine","bomb"]) assert.equal(failureScene(84,cause),"5");
});

test("bombs are removed on contact with any edge, without leaving the viewport", () => {
  for (const [x,y] of [[32,300],[768,300],[400,32],[400,568],[0,0],[800,600]]) {
    assert.equal(bombTouchesEdge(x,y,800,600),true);
  }
  for (const [x,y] of [[33,300],[767,300],[400,33],[400,567],[400,300]]) {
    assert.equal(bombTouchesEdge(x,y,800,600),false);
  }
});

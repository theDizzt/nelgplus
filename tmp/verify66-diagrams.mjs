import {readFileSync,writeFileSync} from 'node:fs';
import ts from 'typescript';
const {outputText}=ts.transpileModule(readFileSync('src/levels/level66Physics.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
const {createRunner,stepRunner,draggable,PUZZLES,scalePuzzle,MINIGAME_SCALE,updatePatrol,overlaps}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const placements={
  3:[[126,552],[201,307],[284,456],[406,458],[454,335],[504,214],[612,602],[258,107],[438,107],[685,111],[302,228],[84,472],[525,355],[388,480],[567,480],[685,358],[897,356],[266,583],[732,602],[820,479],[800,316],[468,336],[516,215]],
  4:[[90,336],[214,145],[470,146],[592,146],[368,334],[173,581],[564,454],[503,578],[51,215],[689,332],[302,144],[296,334],[492,453],[295,581],[171,146],[579,454]],
};
const reports=[];
for(const scene of [3,4]){
  for(const phase of scene===4?[0,1,2,3,4,5,6]:[0]){
    const layout=scalePuzzle(PUZZLES[scene-2],MINIGAME_SCALE);
    const movable=layout.objects.filter(draggable);
    placements[scene].forEach(([x,y],i)=>Object.assign(movable[i],{x:100+x*.62,y:120+y*.62}));
    const p=createRunner(layout.start,MINIGAME_SCALE);
    let result='running',time=0;const events=[];let last='';
    for(let i=0;i<120*60&&result==='running';i++){
      time=i/120;
      layout.objects.forEach(o=>updatePatrol(o,time+phase));
      result=stepRunner(p,layout.objects,layout.portal,1/120);
      const state=`${p.mode}:${p.direction}`;
      if(state!==last){events.push({time:+time.toFixed(3),state,x:+p.x.toFixed(2),y:+p.y.toFixed(2)});last=state;}
    }
    const hit=layout.objects.map((o,index)=>({...o,index})).filter(o=>(o.kind==='hot'||o.kind==='steve')&&overlaps(p,o));
    const report={scene,phase,result,time:+time.toFixed(3),runner:{x:p.x,y:p.y,width:p.width,height:p.height},hit:hit.map(o=>({kind:o.kind,index:o.index,drawingX:(o.x-100)/.62,drawingY:(o.y-120)/.62})),events};
    reports.push(report);
    console.log(JSON.stringify(report));
  }
}
writeFileSync('tmp/level66/diagram-verification.json',JSON.stringify(reports,null,2));

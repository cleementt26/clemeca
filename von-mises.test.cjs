/* Independent reference cases: MIT 22.312 note L.4 §1.4–1.5, §6.8, §6.12;
 * MIT 2.017J p.5 (circular bending and torsion), MIT 2.72 p.14 (tube inertias).
 * https://ocw.mit.edu/courses/22-312-engineering-of-nuclear-reactors-fall-2015/eb49bc4f3e701be60ca651c5a109312f_MIT22_312F15_note_L4.pdf
 * https://ocw.mit.edu/courses/2-017j-design-of-electromechanical-robotic-systems-fall-2009/16cb0f850752422026a85d838f30e340_MIT2_017JF09_machines.pdf
 * https://ocw.mit.edu/courses/2-72-elements-of-mechanical-design-spring-2009/36eed65f96add829d317d8d83b80bf30_MIT2_72s09_lec03.pdf
 * Literal reference outputs and physical invariants are intentionally independent
 * of the product's expressions. No browser or UI assertions in this file.
 */
'use strict';
const assert = require('node:assert/strict');
const C = require('./von-mises.js');
let count = 0;
function near(actual, expected, label) {
  assert.ok(Number.isFinite(actual), `${label}: result is not finite (${actual})`);
  assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), `${label}: ${actual} != ${expected}`);
  count++;
}
function equal(actual, expected, label) { assert.deepEqual(actual, expected, label); count++; }
function throws(fn, label) { assert.throws(fn, undefined, label); count++; }

const references = [
  {input:[100,0,0], vm:100, principal:[100,0,0], tau:50},
  {input:[-100,0,0], vm:100, principal:[0,0,-100], tau:50},
  {input:[0,0,100], vm:173.20508075688772, principal:[100,0,-100], tau:100},
  {input:[100,100,0], vm:100, principal:[100,100,0], tau:50},
  {input:[-100,-100,0], vm:100, principal:[0,-100,-100], tau:50},
  {input:[100,-100,0], vm:173.20508075688772, principal:[100,0,-100], tau:100},
  {input:[150,-20,70], vm:201.49441679609885, principal:[175.1135777277262,0,-45.11357772772621], tau:110.11357772772621},
  {input:[0,0,0], vm:0, principal:[0,0,0], tau:0}
];
for (const [i, ref] of references.entries()) {
  const r=C.plane(...ref.input);
  near(r.vm,ref.vm,`reference ${i}: VM`);
  ref.principal.forEach((value,j)=>near(r.principal[j],value,`reference ${i}: principal ${j}`));
  near(r.tauMax3,ref.tau,`reference ${i}: absolute shear`);
}

// Rotate the same stress tensor rather than comparing two equivalent formulas.
const original=C.plane(150,-20,70);
for (const deg of [15,33,45,90,137,187]) {
  const t=deg*Math.PI/180,c=Math.cos(t),s=Math.sin(t);
  const rotated=C.plane(150*c*c-20*s*s+140*c*s,150*s*s-20*c*c-140*c*s,-170*s*c+70*(c*c-s*s));
  near(rotated.vm,original.vm,`rotation ${deg}: VM`);
  original.principal.forEach((value,j)=>near(rotated.principal[j],value,`rotation ${deg}: principal ${j}`));
  near(rotated.tauMax3,original.tauMax3,`rotation ${deg}: absolute shear`);
}
for (const scale of [.1,2,1000]) {
  const r=C.plane(150*scale,-20*scale,70*scale);
  near(r.vm,original.vm*scale,`scale ${scale}: VM`);
  original.principal.forEach((value,j)=>near(r.principal[j],value*scale,`scale ${scale}: principal ${j}`));
}
const reversed=C.plane(-150,20,-70);
near(reversed.vm,original.vm,'sign reversal: VM');
original.principal.toReversed().forEach((value,j)=>near(reversed.principal[j],-value,`sign reversal: principal ${j}`));
const shearReversed=C.plane(150,-20,-70);
near(shearReversed.vm,original.vm,'shear sign: VM');
original.principal.forEach((value,j)=>near(shearReversed.principal[j],value,`shear sign: principal ${j}`));
const swapped=C.plane(-20,150,70);
near(swapped.vm,original.vm,'coordinate swap: VM');
original.principal.forEach((value,j)=>near(swapped.principal[j],value,`coordinate swap: principal ${j}`));

// A circular tube with independently tabulated reference stresses.
const shaft=C.shaft(40,20,10000,200,100);
near(shaft.vm,46.925974234178746,'tube: worst VM');
near(shaft.opposite,27.58685680259519,'tube: other fibre VM');
near(shaft.A,942.4777960769379,'tube: area');
near(shaft.I,117809.72450961724,'tube: bending inertia');
near(shaft.J,235619.44901923448,'tube: polar inertia');
near(shaft.axial,10.61032953945969,'tube: axial stress');
near(shaft.bending,33.953054526271,'tube: bending amplitude');
near(shaft.tau,8.48826363156775,'tube: torsional shear');
near(shaft.sx,44.563384065730695,'tube: governing normal stress');
const compression=C.shaft(40,20,-10000,200,100);
near(compression.vm,shaft.vm,'axial compression: same worst VM');
near(compression.opposite,shaft.opposite,'axial compression: same other fibre VM');
near(compression.sx,-shaft.sx,'axial compression: opposite fibre governs');
near(C.shaft(40,20,10000,200,-100).vm,shaft.vm,'torque sign: worst VM');
near(C.shaft(40,20,20000,400,200).vm,shaft.vm*2,'double all loads');
const bendingTorsion=C.shaft(40,20,0,200,100);
near(C.shaft(80,40,0,200,100).vm,bendingTorsion.vm/8,'geometry doubled: bending/torsion stresses /8');
near(C.shaft(80,40,10000,0,0).vm,C.shaft(40,20,10000,0,0).vm/4,'geometry doubled: axial stress /4');
near(C.shaft(40,20,0,0,0).vm,0,'zero shaft loads');
near(C.shaft(40,0,0,0,100).vm,13.783222385544801,'solid pure torsion');

for (const [i,args] of [[0,0,0,0,0],[-40,0,0,0,0],[40,-1,0,0,0],[40,40,0,0,0],[40,41,0,0,0],[40,0,0,-1,0],[40,0,Infinity,0,0],[40,0,0,0,NaN],[40,0,'',0,0]].entries()) throws(()=>C.shaft(...args),`invalid shaft ${i}`);
for (const value of ['',null,undefined,NaN,Infinity,-Infinity,'nope']) throws(()=>C.plane(value,0,0),`invalid plane ${String(value)}`);
near(C.plane('150,0','-20','70').vm,original.vm,'French numeric input');

const assessed=C.assess(original,440,1);
near(assessed.factor,2.1836833347360467,'MIT worked example: factor');
near(assessed.limit,440,'unit target: threshold equals yield');
near(assessed.usage,.4579418563547701,'yield utilization');
equal(assessed.ok,true,'below yield');
const stricter=C.assess(original,440,3);
near(stricter.limit,146.66666666666666,'target 3: threshold');
near(stricter.factor,assessed.factor,'target changes threshold, not achieved factor');
equal(stricter.ok,false,'target 3 not met');
equal(C.assess(C.plane(100,0,0),200,2).ok,true,'exact threshold');
equal(C.assess(C.plane(100.001,0,0),200,2).ok,false,'just above threshold');
const idle=C.assess(C.plane(0,0,0),200,2);
near(idle.usage,0,'zero stress: zero utilization');
equal(idle.factor,null,'zero stress: no finite factor');
equal(idle.ok,true,'zero stress: threshold met');
for (const missing of ['',null,undefined]) {
  const r=C.assess(original,missing,1);
  equal(r.factor,null,'yield omitted: factor');
  equal(r.limit,null,'yield omitted: threshold');
  equal(r.ok,null,'yield omitted: no verdict');
}
for (const bad of [0,-1,NaN,Infinity,'nope']) throws(()=>C.assess(original,bad,1),`invalid yield ${String(bad)}`);
for (const bad of [0,-1,.9,'',NaN,Infinity]) throws(()=>C.assess(original,440,bad),`invalid target ${String(bad)}`);
throws(()=>C.plane(1e308,-1e308,1e308),'numerical overflow rejected');
throws(()=>C.shaft(1e100,0,0,0,0),'geometry numerical overflow rejected');

console.log(`${count} independent Von Mises model checks passed`);

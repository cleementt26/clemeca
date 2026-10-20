'use strict';
const assert=require('node:assert/strict');
const S=require('./screening-models.js');
let count=0;
function close(actual,expected,eps=1e-10){assert.ok(Math.abs(actual-expected)<=eps*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);count++;}
function rejects(fn){assert.throws(fn);count++;}
const distance={K:2000,deviceMs:20,relayMs:10,stopMs:120,intrusion:100,margin:25};
let r=S.safetyDistance(distance);close(r.totalMs,150);close(r.totalSeconds,.15);close(r.approachDistance,300);close(r.distance,425);
r=S.safetyDistance({K:'1600',deviceMs:'0',relayMs:'0',stopMs:'0',intrusion:'0',margin:'0'});close(r.distance,0);
r=S.safetyDistance({...distance,K:'1,5',deviceMs:0,relayMs:0,stopMs:1000,intrusion:0,margin:0});close(r.distance,1.5);
for(const key of ['K','deviceMs','relayMs','stopMs','intrusion','margin']){
 rejects(()=>S.safetyDistance({...distance,[key]:''}));
 rejects(()=>S.safetyDistance({...distance,[key]:NaN}));
 rejects(()=>S.safetyDistance({...distance,[key]:-1}));
}
rejects(()=>S.safetyDistance({...distance,K:0}));
rejects(()=>S.safetyDistance({...distance,K:1e308,stopMs:1e308}));
const ring={ringCapacity:10000,diameter:40,edgeDistance:3,shearStress:80,engagement:1,bearingPressure:60,safetyFactor:2,appliedForce:1000};
r=S.retainingRing(ring);close(r.shearArea,120*Math.PI);close(r.bearingArea,40*Math.PI);close(r.grooveShearCapacity,9600*Math.PI);close(r.grooveBearingCapacity,2400*Math.PI);close(r.rawLimit,2400*Math.PI);close(r.allowable,1200*Math.PI);close(r.utilization,1000/(1200*Math.PI));assert.match(r.limitingModes,/appui/);count++;
r=S.retainingRing({...ring,ringCapacity:2000,appliedForce:0});close(r.allowable,1000);close(r.utilization,0);assert.match(r.limitingModes,/fabricant/);count++;
r=S.retainingRing({...ring,edgeDistance:.01,safetyFactor:1});close(r.rawLimit,Math.PI*40*.01*80);assert.match(r.limitingModes,/Cisaillement/);count++;
for(const key of ['ringCapacity','diameter','edgeDistance','shearStress','engagement','bearingPressure','safetyFactor']){
 rejects(()=>S.retainingRing({...ring,[key]:0}));rejects(()=>S.retainingRing({...ring,[key]:''}));rejects(()=>S.retainingRing({...ring,[key]:Infinity}));
}
rejects(()=>S.retainingRing({...ring,safetyFactor:.9}));rejects(()=>S.retainingRing({...ring,engagement:20}));rejects(()=>S.retainingRing({...ring,appliedForce:-1}));rejects(()=>S.retainingRing({...ring,diameter:1e308,edgeDistance:1e308}));
console.log(`${count} assertions : budgets de distance et contrôles élémentaires de gorge.`);

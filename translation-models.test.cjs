'use strict';
const assert=require('node:assert/strict');
const M=require('./translation-models.js');let assertions=0;
function close(actual,expected,tolerance=1e-10){assert.ok(Math.abs(actual-expected)<=tolerance*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);assertions++;}
function equal(a,b){assert.deepEqual(a,b);assertions++;}
function throws(fn){assert.throws(fn);assertions++;}
const ball={force:1000,lead:10,efficiency:.9,velocity:100,stroke:500,dynamicRating:10000,lifeLoad:1000};
let r=M.ballScrew(ball);
close(r.torque,1000*.01/(2*Math.PI*.9));close(r.rpm,600);close(r.mechanicalPower,100);close(r.inputPower,100/.9);close(r.strokeSeconds,5);close(r.lifeRevolutions,1e9);close(r.lifeKm,10000);close(r.lifeHours,1e9/36000);close(r.roundTrips,1e7);
close(r.inputPower,r.torque*2*Math.PI*r.rpm/60);
close(M.ballScrew({...ball,lifeLoad:2000}).lifeRevolutions,r.lifeRevolutions/8);
r=M.ballScrew({...ball,velocity:0,lifeLoad:0});equal(r.lifeRevolutions,null);equal(r.lifeKm,null);equal(r.lifeHours,null);equal(r.roundTrips,null);equal(r.strokeSeconds,null);close(r.rpm,0);close(r.inputPower,0);
throws(()=>M.ballScrew({...ball,efficiency:0}));throws(()=>M.ballScrew({...ball,efficiency:90}));throws(()=>M.ballScrew({...ball,lead:0}));throws(()=>M.ballScrew({...ball,stroke:-1}));throws(()=>M.ballScrew({...ball,force:''}));throws(()=>M.ballScrew({...ball,lifeLoad:-1}));
const trap={force:1000,meanDiameter:20,lead:4,halfAngle:0,friction:.1};r=M.trapezoidalScrew(trap);
const t=4/(Math.PI*20);
close(r.torqueRaise,10*(t+.1)/(1-.1*t));close(r.torqueLower,10*(.1-t)/(1+.1*t));close(r.efficiency,t*(1-.1*t)/(t+.1));equal(r.selfLocking,true);close(r.leadAngle,Math.atan(t)*180/Math.PI);
const noFriction=M.trapezoidalScrew({...trap,friction:0,halfAngle:15});close(noFriction.torqueRaise,1000*.004/(2*Math.PI));close(noFriction.torqueLower,-noFriction.torqueRaise);close(noFriction.efficiency,1);equal(noFriction.selfLocking,false);
const real=M.trapezoidalScrew({...trap,halfAngle:15});assert.ok(real.torqueRaise>r.torqueRaise);assertions++;
const neutral=M.trapezoidalScrew({...trap,friction:t});equal(neutral.selfLocking,false);equal(neutral.neutralLocking,true);close(neutral.torqueLower,0);
throws(()=>M.trapezoidalScrew({...trap,halfAngle:90}));throws(()=>M.trapezoidalScrew({...trap,friction:-1}));throws(()=>M.trapezoidalScrew({...trap,meanDiameter:0}));throws(()=>M.trapezoidalScrew({...trap,lead:1e9,friction:100}));
const guide={forceZ:4000,momentX:0,momentY:0,railSpacing:200,blockSpacing:400,dynamicRating:10000,exponent:3,referenceKm:50,staticRating:20000};r=M.linearGuide(guide);equal(r.loads,[1000,1000,1000,1000]);close(r.maxLoad,1000);close(r.lifeKm,50000);close(r.staticSafety,20);equal(r.hasReversedLoad,false);
r=M.linearGuide({...guide,momentX:100,momentY:200});equal(r.loads,[1000,1500,500,1000]);close(r.maxLoad,1500);
const xy=[[-1,-1],[-1,1],[1,-1],[1,1]];close(r.loads.reduce((a,x)=>a+x,0),4000);close(r.loads.reduce((a,x,i)=>a+xy[i][1]*.1*x,0),100);close(r.loads.reduce((a,x,i)=>a-xy[i][0]*.2*x,0),200);
close(M.linearGuide({...guide,referenceKm:100}).lifeKm,100000);
close(M.linearGuide({...guide,exponent:10/3}).lifeKm,50*10**(10/3));
r=M.linearGuide({...guide,forceZ:0,momentX:0,momentY:0,staticRating:''});close(r.maxLoad,0);equal(r.lifeKm,null);equal(r.staticSafety,null);
equal(M.linearGuide({...guide,forceZ:-4000}).hasReversedLoad,true);
throws(()=>M.linearGuide({...guide,railSpacing:0}));throws(()=>M.linearGuide({...guide,blockSpacing:-1}));throws(()=>M.linearGuide({...guide,referenceKm:1}));throws(()=>M.linearGuide({...guide,exponent:2}));throws(()=>M.linearGuide({...guide,forceZ:Infinity}));
console.log(`${assertions} translation model assertions passed.`);

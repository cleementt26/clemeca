const assert=require('node:assert/strict'),X=require('./extensions.js');let count=0;
function near(a,b,t=1e-8){assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} ≠ ${b}`);count++;}
function fails(f){assert.throws(f);count++;}
// Pressure x active area; 50 mm bore, 20 mm rod, 6 bar.
let r=X.cylinder(50,20,6,0,0,'out');near(r.force,1178.0972450961724);
r=X.cylinder(50,20,6,1,50,'in');near(r.force,743.2521450314227);
near(X.cylinder(50,20,0,1,0,'out').force,-164.93361431346415);
fails(()=>X.cylinder(20,20,6,0,0,'out'));fails(()=>X.cylinder(50,20,-1,0,0,'out'));fails(()=>X.cylinder(50,20,6,0,0,'bad'));
// Laminar Hagen–Poiseuille independently predicts pressure drop 128 μ L Q/(πD⁴).
r=X.pipe(.036,10,2,1000,1,0,0);near(r.pressure,81.48733086305042);near(r.Re,1273.2395447351626);near(r.factor,64/r.Re);
// Colebrook published standard reference case Re=100000, ε/D=.0001.
const Q=100000*.001*.1*Math.PI/(4*1000)*3600;
r=X.pipe(Q,100,20,1000,1,.01,2);near(r.factor,.018513866077471,1e-10);near(r.pressure,2851.3866077471,1e-9);near(r.head,r.pressure/9810);
for(const Re of [2300,3000,3999])fails(()=>X.pipe(Re*.001*.1*Math.PI/(4*1000)*3600,100,20,1000,1,0,0));
near(X.pipe(0,25,10,1000,1,0,0).pressure,0);fails(()=>X.pipe(1,25,1,1000,0,0,0));fails(()=>X.pipe(1,25,1,1000,1,2,0));
// 1 L/s at 10 m: 98.1 W hydraulic, ηpump=.5, ηmotor=.8.
r=X.pump(3.6,10,1000,50,80);near(r.hydraulic,98.1);near(r.shaft,196.2);near(r.electric,245.25);near(r.overall,40);near(r.pressure,98100);
fails(()=>X.pump(3.6,10,1000,0,80));fails(()=>X.pump(3.6,10,1000,101,80));fails(()=>X.pump(3.6,-10,1000,50,80));
// Course vibration exercise: k1=10000, k2=20000 in parallel, m=1.
r=X.vibration(1,30000,0,1,0);near(r.fn,27.566444771089603);near(r.period,.036275987284684355);near(r.amplitude,1/30000);
// At natural frequency: X=F/(c ω0), lag 90 degrees.
r=X.vibration(1,100,2,10,10/(2*Math.PI));near(r.amplitude,.5);near(r.phase,90);near(r.zeta,.1);near(r.fd,1.583571689298549);
assert.equal(X.vibration(1,100,20,1,1).regime,'Critique');count++;
assert.equal(X.vibration(1,100,30,1,1).fd,null);count++;
fails(()=>X.vibration(1,100,0,1,10/(2*Math.PI)));near(X.vibration(1,100,0,0,10/(2*Math.PI)).amplitude,0);
for(const bad of ['',NaN,Infinity,'abc',-1])fails(()=>X.vibration(bad,100,2,1,1));
near(X.pump('3,6',10,1000,50,80).hydraulic,98.1);
console.log(count+' extension numerical and boundary assertions passed');

const assert=require('node:assert/strict'),C=require('./calculations.js');let count=0;
function near(actual,expected,tol=1e-8){assert.ok(Math.abs(actual-expected)<=tol*Math.max(1,Math.abs(expected)),`${actual} ≠ ${expected}`);count++;}
function rejects(f){assert.throws(f);count++;}
const g=C.gear(2,20,40,1500);near(g.a,60);near(g.n2,750);near(g.df1,35);rejects(()=>C.gear(0,20,40,1500));rejects(()=>C.gear(2,20.5,40,1500));
const k=C.key(100,25,8,7,40,80,100);near(k.F,8000);near(k.tau,25);near(k.pressure,400/7);near(C.key(-100,25,8,7,40,'','').tau,25);assert.equal(C.key(100,25,8,7,40,'','').okTau,null);count++;rejects(()=>C.key(100,0,8,7,40,80,100));
const t=C.torsion(100,25,300,80,80);near(t.tau,32.594932345);near(t.theta,.00977847970357);near(C.torsion(-100,25,300,80,80).tau,t.tau);near(C.torsion(-100,25,300,80,80).theta,-t.theta);near(C.torsion(100,'',300,80,80).dmin,18.5336109,1e-6);rejects(()=>C.torsion(100,0,300,80,80));rejects(()=>C.torsion(100,25,300,0,80));
near(C.bearing(25,5,1500,'ball').hours,1388.888888888889);near(C.bearing(1,1,100,'roller').hours,166.666666666667);rejects(()=>C.bearing(25,0,1500,'ball'));
near(C.beltLength(100,50,300),837.702782352568);near(C.beltCenter(100,50,837.702782352568),300);near(C.beltCenter(100,100,600+100*Math.PI),300);rejects(()=>C.beltCenter(100,50,100));rejects(()=>C.beltLength(100,50,70));
for(const D of [50,100,250])for(const d of [25,50])for(const c of [300,500,1500]){if(c>(D+d)/2)near(C.beltCenter(D,d,C.beltLength(D,d,c)),c);}
near(C.tap(8,1.25).drill,6.75);near(C.tap(8,1.25).inch,6.75/25.4);rejects(()=>C.tap(8,8));rejects(()=>C.tap(8,-1));
const val={L:500,E:210,I:1e6,F:1000,w:2,allow:''};near(C.beam('cant_end','EI',val).delta,.1984126984126984);near(C.beam('cant_udl','EI',val).delta,.0744047619047619);near(C.beam('ss_mid','EI',val).delta,.01240079365079365);near(C.beam('ss_udl','EI',val).delta,.007750496031746032);near(C.beam('cant_end','rect',{...val,b:40,h:60}).sigma,20.8333333333333);near(C.beam('cant_end','rect',{...val,F:-1000,b:40,h:60}).sigma,20.8333333333333);rejects(()=>C.beam('cant_end','EI',{...val,E:0}));rejects(()=>C.beam('cant_end','rect',{...val,b:-1,h:60}));
near(C.heat(2,4180,20,80).kJ,501.6);near(C.heat(2,4180,80,20).kJ,-501.6);rejects(()=>C.heat(2,4180,-274,20));
const gas=C.gas('p',{n:1,R:8.314462618,T:300,V:10});near(gas.p,249.43387854);for(const unknown of ['p','V','n','T']){const r=C.gas(unknown,gas);near(r[unknown],gas[unknown]);}rejects(()=>C.gas('p',{n:1,R:8.314462618,T:300,V:0}));
const bolt=C.bolt(8,1.25,'10.9',.18,.7,2,5000);near(bolt.As,36.60846,1e-6);near(bolt.F,23063.331295557,1e-6);near(bolt.T,33.2111970656,1e-6);rejects(()=>C.bolt(8,1.25,'10.9',.18,1.1,2,5000));rejects(()=>C.bolt(8,1.25,'10.9',.18,.7,1.5,5000));
for(const [D,H,h] of [[3,.010,-.006],[6,.012,-.008],[10,.015,-.009],[18,.018,-.011],[30,.021,-.013],[50,.025,-.016],[80,.030,-.019],[120,.035,-.022],[180,.040,-.025],[250,.046,-.029],[315,.052,-.032],[400,.057,-.036],[500,.063,-.040]]){near(C.deviation(D,'H',7).upper,H);near(C.deviation(D,'h',6).lower,h);}
near(C.deviation(30.0001,'H',7).upper,.025);near(C.deviation(20,'g',6).upper,-.007);near(C.deviation(20,'g',6).lower,-.020);near(C.deviation(20,'G',7).lower,.007);rejects(()=>C.deviation(501,'H',7));rejects(()=>C.deviation(20,'G',8));rejects(()=>C.deviation(0,'H',7));
const fit=C.fit(20,0,.021,-.013,0);near(fit.min,0);near(fit.max,.034);assert.equal(C.fit(20,0,.021,.03,.04).nature,'Avec serrage');count++;rejects(()=>C.fit(20,.03,.02,0,0));
for(const bad of ['',NaN,Infinity,'2oops'])rejects(()=>C.gear(bad,20,40,1500));near(C.num('1,25','Test'),1.25);rejects(()=>C.num('1,2,3','Test'));
console.log(count+' numerical assertions passed');

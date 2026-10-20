/* Independent engineering utility models. Inputs stay unrounded until display.
 * Sources: NIST SP 811; NIST TN 1297 Appendix A; Thorlabs BSC20x manual.
 * No supplier tables or h7g6 implementation are included.
 */
(function(root){
'use strict';
const C=typeof module==='object'&&module.exports?require('./calculations.js'):root.Calculations;
const unit=(id,label,factor,offset=0)=>Object.freeze({id,label,factor,offset});
const units=Object.freeze({
 length:[unit('mm','mm',.001),unit('cm','cm',.01),unit('m','m',1),unit('km','km',1000),unit('in','in',.0254),unit('ft','ft',.3048),unit('um','µm',1e-6)],
 area:[unit('mm2','mm²',1e-6),unit('cm2','cm²',1e-4),unit('m2','m²',1),unit('in2','in²',.0254**2),unit('ft2','ft²',.3048**2)],
 volume:[unit('mm3','mm³',1e-9),unit('cm3','cm³',1e-6),unit('L','L',.001),unit('m3','m³',1),unit('in3','in³',.0254**3)],
 mass:[unit('mg','mg',1e-6),unit('g','g',.001),unit('kg','kg',1),unit('t','t',1000),unit('lb','lb',.45359237)],
 force:[unit('N','N',1),unit('kN','kN',1000),unit('daN','daN',10),unit('kgf','kgf',9.80665),unit('lbf','lbf',4.4482216152605)],
 pressure:[unit('Pa','Pa',1),unit('kPa','kPa',1000),unit('MPa','MPa',1e6),unit('bar','bar',1e5),unit('mbar','mbar',100),unit('psi','psi',6894.757293168361),unit('atm','atm',101325)],
 torque:[unit('Nm','N·m',1),unit('Nmm','N·mm',.001),unit('kNm','kN·m',1000),unit('lbfft','lbf·ft',1.3558179483314004),unit('lbfin','lbf·in',.1129848290276167)],
 power:[unit('W','W',1),unit('kW','kW',1000),unit('MW','MW',1e6),unit('ch','ch métrique',735.49875),unit('hp','hp mécanique',745.6998715822702)],
 angle:[unit('deg','°',Math.PI/180),unit('rad','rad',1),unit('rev','tour',2*Math.PI),unit('gon','gon',Math.PI/200)],
 angularSpeed:[unit('rpm','tr/min',2*Math.PI/60),unit('rps','tr/s',2*Math.PI),unit('rad_s','rad/s',1),unit('deg_s','°/s',Math.PI/180)],
 speed:[unit('mm_s','mm/s',.001),unit('m_s','m/s',1),unit('m_min','m/min',1/60),unit('km_h','km/h',1/3.6),unit('ft_s','ft/s',.3048)],
 time:[unit('ms','ms',.001),unit('s','s',1),unit('min','min',60),unit('h','h',3600),unit('day','jour',86400)],
 temperature:[unit('C','°C',1,273.15),unit('K','K',1),unit('F','°F',5/9,273.15-32*5/9)]
});
function finite(o){for(const value of Object.values(o)){if(typeof value==='number'&&!Number.isFinite(value))throw Error('Résultat hors du domaine numérique.');if(Array.isArray(value)&&value.some(x=>typeof x==='number'&&!Number.isFinite(x)))throw Error('Résultat hors du domaine numérique.');}return o;}
function convert(category,value,from,to){
 if(!Object.hasOwn(units,category))throw Error('Famille d’unités inconnue.');
 const list=units[category],a=list.find(u=>u.id===from),b=list.find(u=>u.id===to);
 if(!a||!b)throw Error('Ces unités ne font pas partie de la famille choisie.');
 const input=C.num(value,'La valeur à convertir');let baseValue=input*a.factor+a.offset;
 if(category==='temperature'){if(baseValue< -1e-10)throw Error('La température ne peut pas être inférieure au zéro absolu.');baseValue=Math.max(0,baseValue);}
 return finite({value:(baseValue-b.offset)/b.factor,baseValue,from,to});
}
function mass(shape,density,dimensions){
 const rho=C.pos(density,'La masse volumique');if(!dimensions||typeof dimensions!=='object')throw Error('Renseignez les dimensions.');
 const p=k=>C.pos(dimensions[k],'La dimension '+k);let volumeMm3;
 if(shape==='box')volumeMm3=p('L')*p('W')*p('H');
 else if(shape==='cylinder')volumeMm3=Math.PI*p('D')**2*p('L')/4;
 else if(shape==='tube'){const D=p('D'),d=C.pos(dimensions.d,'Le diamètre intérieur',true),L=p('L');if(d>=D)throw Error('Le diamètre intérieur doit être inférieur au diamètre extérieur.');volumeMm3=Math.PI*(D*D-d*d)*L/4;}
 else if(shape==='sphere')volumeMm3=Math.PI*p('D')**3/6;
 else throw Error('Forme inconnue.');
 const volumeM3=volumeMm3*1e-9,massKg=rho*volumeM3;
 if(!(volumeM3>0&&massKg>0))throw Error('Dimensions ou masse trop petites pour ce calcul numérique.');
 return finite({volumeMm3,volumeM3,massKg,weightN:massKg*9.80665});
}
function cycle(distance,vmax,accel,decel,dwell=0,repetitions=1){
 const d=C.pos(distance,'La distance',true),v=C.pos(vmax,'La vitesse maximale'),a=C.pos(accel,'L’accélération'),b=C.pos(decel,'La décélération'),wait=C.pos(dwell,'Le temps d’attente',true),count=C.integer(repetitions,'Le nombre de répétitions');
 if(!Number.isSafeInteger(count))throw Error('Le nombre de répétitions est trop grand.');
 // Motion starts and ends at rest; constant acceleration/deceleration, no jerk limit.
 const rampDistance=v*v/(2*a)+v*v/(2*b),triangular=d<=rampDistance;
 const peakSpeed=d===0?0:triangular?Math.sqrt(2*d/(1/a+1/b)):v;
 const accelerationTime=peakSpeed/a,decelerationTime=peakSpeed/b;
 const accelerationDistance=peakSpeed*peakSpeed/(2*a),decelerationDistance=peakSpeed*peakSpeed/(2*b);
 const cruiseDistance=triangular?0:Math.max(0,d-accelerationDistance-decelerationDistance);
 const cruiseTime=peakSpeed===0?0:cruiseDistance/peakSpeed,motionTime=accelerationTime+cruiseTime+decelerationTime,cycleTime=motionTime+wait;
 if(d>0&&!(peakSpeed>0&&motionTime>0))throw Error('Valeurs trop extrêmes pour calculer un déplacement non nul.');
 return finite({profile:d===0?'Sans déplacement':triangular?'Triangulaire':'Trapézoïdal',peakSpeed,accelerationTime,cruiseTime,decelerationTime,motionTime,cycleTime,totalTime:cycleTime*count,accelerationDistance,cruiseDistance,decelerationDistance});
}
function distribute(total,weightsOrCount,method='worst'){
 const target=C.pos(total,'La demi-tolérance disponible',true);let weights;
 if(Array.isArray(weightsOrCount)){if(weightsOrCount.length<1||weightsOrCount.length>1000)throw Error('Prévoyez entre 1 et 1 000 cotes.');weights=weightsOrCount.map(x=>C.pos(x,'Chaque poids'));}
 else{const count=C.integer(weightsOrCount,'Le nombre de cotes');if(count>1000)throw Error('Prévoyez au plus 1 000 cotes.');weights=Array(count).fill(1);}
 if(!['worst','rss'].includes(method))throw Error('Méthode de répartition inconnue.');
 // Rescale first: prevents overflow when users supply large but finite weights.
 const max=Math.max(...weights),normalized=weights.map(w=>w/max);
 const denominator=method==='worst'?normalized.reduce((sum,x)=>sum+x,0):Math.hypot(...normalized);
 const shares=normalized.map(w=>target*w/denominator);
 if(method==='worst')shares[shares.length-1]=Math.max(0,target-shares.slice(0,-1).reduce((sum,x)=>sum+x,0));
 if(target>0&&shares.some(x=>x===0))throw Error('Les poids sont trop disproportionnés pour attribuer chaque tolérance.');
 return finite({shares,totalWorst:shares.reduce((sum,x)=>sum+x,0),totalRSS:Math.hypot(...shares),method});
}
function angular(mode,L,value){
 const length=C.pos(L,'La longueur de référence'),input=C.num(value,mode==='offset'?'L’angle':'Le décalage');let angleDeg,offset;
 if(mode==='offset'){angleDeg=input;if(Math.abs(angleDeg)>=90)throw Error('L’angle doit être strictement compris entre −90° et 90°.');offset=length*Math.tan(angleDeg*Math.PI/180);}
 else if(mode==='angle'){offset=input;angleDeg=Math.atan(offset/length)*180/Math.PI;if(Math.abs(angleDeg)>=90)throw Error('Rapport trop grand pour représenter un angle strictement inférieur à 90°.');}
 else throw Error('Mode de calcul inconnu.');
 return finite({angleDeg,offset,L:length});
}
function bushPlay(values){
 if(!values||typeof values!=='object')throw Error('Renseignez les dimensions des guidages.');
 const count=C.integer(values.count??1,'Le nombre de bagues');if(![1,2].includes(count))throw Error('Choisissez une ou deux bagues.');
 const shaft=C.pos(values.shaftMin,'Le diamètre minimal de l’arbre'),D1=C.pos(values.bore1Max,'Le diamètre maximal de la première bague'),e1=C.pos(values.length1,'La longueur de la première bague'),H=C.pos(values.overhang,'La distance de mesure',true);
 if(D1<shaft)throw Error('La première bague doit conserver un jeu diamétral positif ou nul.');
 const c1=(D1-shaft)/2,points=[{x:-e1/2,c:c1},{x:e1/2,c:c1}],clearances=[c1];
 if(count===2){const D2=C.pos(values.bore2Max,'Le diamètre maximal de la seconde bague'),e2=C.pos(values.length2,'La longueur de la seconde bague'),L=C.pos(values.spacing,'L’entraxe des bagues');if(D2<shaft)throw Error('La seconde bague doit conserver un jeu diamétral positif ou nul.');if(L<(e1+e2)/2)throw Error('L’entraxe doit être au moins égal à la demi-somme des longueurs de bagues.');const c2=(D2-shaft)/2;points.push({x:L-e2/2,c:c2},{x:L+e2/2,c:c2});clearances.push(c2);}
 // Rigid straight shaft. Each end plane of each bush bounds |y(x)| by its radial play.
 // bmax is the greatest feasible line slope; offset maximizes the concave upper envelope
 // min_i(c_i+b(H-x_i)) over all feasible b, including every envelope breakpoint.
 let slope=Infinity;
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const dx=Math.abs(points[j].x-points[i].x);if(dx>0)slope=Math.min(slope,(points[i].c+points[j].c)/dx);}
 const candidates=[-slope,0,slope];
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const dx=points[i].x-points[j].x;if(dx===0)continue;const b=(points[i].c-points[j].c)/dx;if(b>=-slope&&b<=slope)candidates.push(b);}
 let offsetMax=0,offsetSlope=0;
 for(const b of candidates){const offset=Math.min(...points.map(p=>p.c+b*(H-p.x)));if(offset>offsetMax){offsetMax=offset;offsetSlope=b;}}
 return finite({angleDeg:Math.atan(slope)*180/Math.PI,slope,offsetMax,offsetSlope,clearances});
}
const api=Object.freeze({units,convert,mass,cycle,distribute,angular,bushPlay});root.H7Utilities=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);

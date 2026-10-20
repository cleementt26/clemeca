/* Independent preliminary models. Units: N, mm, mm/s, N·m, W, km.
 * No commercial product selection, preload, acceleration, lubrication or safety validation.
 */
(function(root){
'use strict';
const C=typeof module==='object'&&module.exports?require('./calculations.js'):root.Calculations;
const deg=x=>x*180/Math.PI;
function finite(result){for(const x of Object.values(result)){if(typeof x==='number'&&!Number.isFinite(x))throw Error('Résultat hors du domaine numérique.');if(Array.isArray(x)&&x.some(v=>!Number.isFinite(v)))throw Error('Résultat hors du domaine numérique.');}return result;}
function optionalPositive(value,label){return value===undefined||value===null||String(value).trim()===''?null:C.pos(value,label);}

function ballScrew(input){
 const force=C.pos(input.force,'L’effort axial',true),lead=C.pos(input.lead,'L’avance par tour'),efficiency=C.pos(input.efficiency,'Le rendement');
 if(efficiency>1)throw Error('Le rendement doit être compris entre 0 et 1 (0 exclu).');
 const velocity=C.pos(input.velocity,'La vitesse de translation',true),stroke=C.pos(input.stroke,'La course');
 const dynamicRating=C.pos(input.dynamicRating,'La capacité dynamique Ca'),lifeLoad=C.pos(input.lifeLoad,'La charge équivalente pour la durée',true);
 const torque=force*lead/(2000*Math.PI*efficiency),rpm=60*velocity/lead,mechanicalPower=force*velocity/1000,inputPower=mechanicalPower/efficiency;
 const lifeRevolutions=lifeLoad===0?null:1e6*(dynamicRating/lifeLoad)**3;
 const lifeKm=lifeRevolutions===null?null:lifeRevolutions*lead/1e6;
 const lifeHours=lifeRevolutions===null||rpm===0?null:lifeRevolutions/(60*rpm);
 const roundTrips=lifeRevolutions===null?null:lifeRevolutions*lead/(2*stroke);
 return finite({torque,rpm,mechanicalPower,inputPower,strokeSeconds:velocity===0?null:stroke/velocity,lifeRevolutions,lifeKm,lifeHours,roundTrips});
}

function trapezoidalScrew(input){
 const force=C.pos(input.force,'L’effort axial',true),meanDiameter=C.pos(input.meanDiameter,'Le diamètre moyen'),lead=C.pos(input.lead,'L’avance par tour'),halfAngle=C.pos(input.halfAngle,'Le demi-angle axial du filet',true),friction=C.pos(input.friction,'Le coefficient de frottement',true);
 if(halfAngle>=90)throw Error('Le demi-angle axial du filet doit rester inférieur à 90°.');
 const lambda=Math.atan(lead/(Math.PI*meanDiameter));
 // Roton: normal-plane half-angle phi_n = atan(cos(lambda) tan(phi)).
 const normalHalfAngle=Math.atan(Math.cos(lambda)*Math.tan(halfAngle*Math.PI/180));
 const rho=Math.atan(friction/Math.cos(normalHalfAngle));
 if(lambda+rho>=Math.PI/2-1e-12)throw Error('La combinaison avance/frottement ne permet pas un entraînement direct dans ce modèle.');
 const radius=meanDiameter/2000,raiseFactor=Math.tan(lambda+rho),lowerFactor=Math.tan(rho-lambda);
 const torqueRaise=force*radius*raiseFactor,torqueLower=force*radius*lowerFactor;
 const efficiency=Math.tan(lambda)/raiseFactor;
 const margin=rho-lambda;
 return finite({torqueRaise,torqueLower,leadAngle:deg(lambda),frictionAngle:deg(rho),normalHalfAngle:deg(normalHalfAngle),efficiency,selfLocking:margin>1e-12,lockingMargin:deg(margin),neutralLocking:Math.abs(margin)<=1e-12});
}

function linearGuide(input){
 const forceZ=C.num(input.forceZ,'La force normale Fz'),momentX=C.num(input.momentX,'Le moment Mx'),momentY=C.num(input.momentY,'Le moment My');
 const railSpacing=C.pos(input.railSpacing,'L’entraxe des rails b'),blockSpacing=C.pos(input.blockSpacing,'L’entraxe longitudinal des patins a');
 const dynamicRating=C.pos(input.dynamicRating,'La capacité dynamique C'),exponent=C.num(input.exponent,'L’exposant de durée'),referenceKm=C.num(input.referenceKm,'La distance de référence');
 if(exponent!==3&&Math.abs(exponent-10/3)>1e-12)throw Error('Choisissez l’exposant 3 (billes) ou 10/3 (rouleaux).');
 if(referenceKm!==50&&referenceKm!==100)throw Error('La distance de référence doit être 50 ou 100 km, selon la capacité du fabricant.');
 const staticRating=optionalPositive(input.staticRating,'La capacité statique C0');
 // x = travel, y = rail spacing. Equal stiffness at corners (sx*a/2, sy*b/2).
 // Sum R=Fz, sum yR=Mx, sum -xR=My. The values are transmitted normal loads.
 const corners=[[-1,-1],[-1,1],[1,-1],[1,1]];
 const loads=corners.map(([sx,sy])=>forceZ/4+sy*momentX*1000/(2*railSpacing)-sx*momentY*1000/(2*blockSpacing));
 const maxLoad=Math.max(...loads.map(Math.abs));
 return finite({loads,maxLoad,lifeKm:maxLoad===0?null:referenceKm*(dynamicRating/maxLoad)**exponent,staticSafety:staticRating===null||maxLoad===0?null:staticRating/maxLoad,hasReversedLoad:loads.some(x=>x<0)});
}

const api={ballScrew,trapezoidalScrew,linearGuide};
root.TranslationModels=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

/* Preliminary arithmetic only. No standard/product selection or safety certification. */
(function(root){
'use strict';
const C=typeof module==='object'?require('./calculations.js'):root.Calculations;
function finite(values){for(const x of Object.values(values))if(typeof x==='number'&&!Number.isFinite(x))throw Error('Valeurs hors du domaine numérique.');return values;}

/**
 * All distances in mm, K in mm/s, component times in ms.
 * User must determine K, intrusion and margin from the applicable current standard,
 * device documentation and risk assessment. This function supplies no coefficients.
 * It only evaluates the entered arithmetic budget, not machine compliance.
 */
function safetyDistance(values){
 const K=C.pos(values.K,'La vitesse d’approche K');
 const deviceMs=C.pos(values.deviceMs,'Le temps du dispositif',true);
 const relayMs=C.pos(values.relayMs,'Le temps de la logique de sécurité',true);
 const stopMs=C.pos(values.stopMs,'Le temps maximal d’arrêt mesuré',true);
 const intrusion=C.pos(values.intrusion,'La distance additionnelle',true);
 const margin=C.pos(values.margin,'La distance supplémentaire',true);
 const totalMs=deviceMs+relayMs+stopMs,totalSeconds=totalMs/1000;
 const approachDistance=K*totalSeconds;
 return finite({totalMs,totalSeconds,approachDistance,intrusion,margin,distance:approachDistance+intrusion+margin});
}

/**
 * Elementary axisymmetric groove checks: forces N, dimensions mm, stresses MPa.
 * ringCapacity is entered from the manufacturer's applicable rating, NOT derived
 * from DIN 471/472. Geometry/tolerances, edge bending, ring dish/expulsion, fatigue,
 * impact, centrifugal force and eccentric/nonuniform loading are not evaluated.
 * safetyFactor is an ADDITIONAL factor applied to all three entered/calculated limits;
 * the catalogue rating can already include its own manufacturer safety factor.
 */
function retainingRing(values){
 const ringCapacity=C.pos(values.ringCapacity,'La capacité axiale fabricant de l’anneau');
 const diameter=C.pos(values.diameter,'Le diamètre moyen de la surface cisaillée');
 const edgeDistance=C.pos(values.edgeDistance,'La distance axiale au bord libre');
 const shearStress=C.pos(values.shearStress,'La contrainte de cisaillement saisie');
 const engagement=C.pos(values.engagement,'La hauteur radiale d’appui');
 const bearingPressure=C.pos(values.bearingPressure,'La pression d’appui saisie');
 const safetyFactor=C.pos(values.safetyFactor,'Le facteur de marge supplémentaire');
 const appliedForce=C.pos(values.appliedForce,'La charge axiale appliquée',true);
 if(safetyFactor<1)throw Error('Le facteur de marge supplémentaire doit être supérieur ou égal à 1.');
 if(engagement>=diameter/2)throw Error('La hauteur radiale d’appui doit rester inférieure à la moitié du diamètre moyen.');
 const shearArea=Math.PI*diameter*edgeDistance,bearingArea=Math.PI*diameter*engagement;
 const grooveShearCapacity=shearArea*shearStress,grooveBearingCapacity=bearingArea*bearingPressure;
 const rawLimit=Math.min(ringCapacity,grooveShearCapacity,grooveBearingCapacity);
 const allowable=rawLimit/safetyFactor;
 const limitingModes=[];
 if(ringCapacity===rawLimit)limitingModes.push('Capacité fabricant saisie');
 if(grooveShearCapacity===rawLimit)limitingModes.push('Cisaillement cylindrique simplifié de la gorge');
 if(grooveBearingCapacity===rawLimit)limitingModes.push('Pression d’appui moyenne simplifiée de la gorge');
 return finite({ringCapacity,shearArea,bearingArea,grooveShearCapacity,grooveBearingCapacity,rawLimit,safetyFactor,allowable,appliedForce,utilization:appliedForce/allowable,limitingModes:limitingModes.join(' / ')});
}

const sources=Object.freeze({
 safety:'https://www.leuze.com/en-us/contact-and-support/specialist-knowledge/safety-at-work/calculation-wizards',
 safetyEdition:'https://www.sick.com/cz/en/from-theory-to-safe-implementation-/w/blog-separation-distance-iso-138552024-interview',
 retaining:'https://www.smalley.com/ring-design/load-capacity'
});
const api={safetyDistance,retainingRing,sources};
root.ScreeningModels=api;if(typeof module==='object')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

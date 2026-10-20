/* Integration with CléMéca's existing results, reports, presets and theme. */
'use strict';
Object.entries(LibraryTools).forEach(([key,t])=>{info[key]=[t.title,t.formula,t.limit,...t.source];});
function libraryValue(key){return v('lib_'+key);}
function libraryInputs(){return Object.fromEntries(LibraryTools[slug].fields.map(f=>[f.id,libraryValue(f.id)]));}
function syncLibrary(){
 if(!LibraryTools[slug])return;
 if(slug==='conversion'){
  const category=libraryValue('category'),units=H7Utilities.units[category],from=$('lib_from'),to=$('lib_to');if(!units)return;
  if(from.dataset.category!==category){const old=[from.value,to.value];for(const [i,el] of [from,to].entries()){el.innerHTML=units.map(u=>'<option value="'+u.id+'">'+escapeHTML(u.label)+'</option>').join('');el.dataset.category=category;const fallback=typeof defaults!=='undefined'&&defaults.lib_category===category?defaults[i===0?'lib_from':'lib_to']:null;el.value=units.some(u=>u.id===old[i])?old[i]:units.some(u=>u.id===fallback)?fallback:units[Math.min(i,units.length-1)].id;}}
 }
 if(slug==='masse'||slug==='cycle'){
  const count=Number(libraryValue('count'));document.querySelectorAll('.library-repeat').forEach(row=>{row.hidden=Number(row.dataset.row)>count;row.querySelectorAll('input,select').forEach(el=>el.disabled=row.hidden);});
  document.querySelectorAll('.library-repeat:not([hidden])').forEach(row=>{const i=row.dataset.row;
   if(slug==='masse'){const shape=libraryValue(i+'_shape'),keys={box:['L','W','H'],cylinder:['D','L'],tube:['D','d','L'],sphere:['D']}[shape];row.querySelectorAll('[data-dimension]').forEach(w=>{w.hidden=!keys.includes(w.dataset.dimension);w.querySelector('input').disabled=w.hidden;});}
   else{const mode=libraryValue(i+'_type'),pause=mode==='pause';row.querySelectorAll('[data-motion]').forEach(w=>{w.hidden=pause;w.querySelector('input').disabled=pause;});row.querySelector('[data-pause]').hidden=!pause;row.querySelector('[data-pause] input').disabled=!pause;for(const [key,label] of [['distance','Déplacement'],['speed','Vitesse maximale'],['accel','Accélération'],['decel','Décélération']]){const unit=mode==='rotation'?({distance:'°',speed:'°/s',accel:'°/s²',decel:'°/s²'}[key]):({distance:'mm',speed:'mm/s',accel:'mm/s²',decel:'mm/s²'}[key]);row.querySelector('label[for="lib_'+i+'_'+key+'"]').textContent=label+' ('+unit+')';}}
  });
 }
 if(slug==='jeuangulaire'){for(const key of ['bore2Max','length2','spacing']){const el=$('lib_'+key);el.disabled=libraryValue('count')==='1';el.closest('.col-6').hidden=el.disabled;}}
}
window.syncLibrary=syncLibrary;
window.calcLibrary=function(){run('out_library',()=>{syncLibrary();
 const x=libraryInputs(),U=window.H7Utilities,T=window.TranslationModels,S=window.ScreeningModels;let r,rows=[],note=LibraryTools[slug].limit;
 const out=(label,value,unit='',digits=5)=>rows.push([label,value===null?'Non déterminé':typeof value==='number'?fmt(value,digits):value,unit]);
 if(slug==='conversion'){r=U.convert(x.category,x.value,x.from,x.to);const units=U.units[x.category];out('Valeur convertie',r.value,units.find(u=>u.id===x.to).label,8);out('Valeur de départ',C.num(x.value,'La valeur'),units.find(u=>u.id===x.from).label,8);}
 else if(slug==='masse'){
  const count=C.integer(x.count,'Le nombre de lignes');if(count>10)throw Error('Choisissez au plus 10 lignes.');let total=0,volume=0,weight=0;for(let i=1;i<=count;i++){const g=k=>libraryValue(i+'_'+k),quantity=C.integer(g('quantity'),'La quantité de la pièce '+i);if(!Number.isSafeInteger(quantity))throw Error('Quantité trop grande.');const dims=Object.fromEntries(['L','W','H','D','d'].map(k=>[k,g(k)]));r=U.mass(g('shape'),g('density'),dims);total+=r.massKg*quantity;volume+=r.volumeMm3*quantity;weight+=r.weightN*quantity;out('Ligne '+i+' · '+quantity+' pièce(s)',r.massKg*quantity,'kg');}
  rows.unshift(['Masse totale',fmt(total,6),'kg'],['Volume total',fmt(volume/1000,4),'cm³'],['Poids total',fmt(weight,4),'N']);
 }
 else if(slug==='cycle'){
  const count=C.integer(x.count,'Le nombre d’étapes'),gap=C.pos(x.gap,'Le délai entre étapes',true),repeat=C.integer(x.repetitions,'Le nombre de cycles');if(count>12)throw Error('Choisissez au plus 12 étapes.');if(!Number.isSafeInteger(repeat))throw Error('Nombre de cycles trop grand.');let time=0;
  for(let i=1;i<=count;i++){const g=k=>libraryValue(i+'_'+k),type=g('type');if(!['translation','rotation','pause'].includes(type))throw Error('Type de mouvement inconnu.');if(type==='pause'){const t=C.pos(g('pause'),'La durée de pause',true);time+=t;out('Étape '+i+' · pause',t,'s');}else{r=U.cycle(g('distance'),g('speed'),g('accel'),g('decel'));time+=r.motionTime;out('Étape '+i+' · '+(type==='rotation'?'rotation':'translation')+' · '+r.profile,r.motionTime,'s');out('Étape '+i+' · vitesse atteinte',r.peakSpeed,type==='rotation'?'°/s':'mm/s');}}
  const waits=Math.max(0,count-1)*gap,perCycle=time+waits,total=perCycle*repeat;rows.unshift(['Temps d’un cycle',fmt(perCycle,5),'s'],['Temps total · '+repeat+' cycle(s)',fmt(total,5),'s'],['Temps total',fmt(total/60,5),'min']);out('Délais inter-étapes par cycle',waits,'s');
 }
 else if(slug==='repartition'){const weights=x.weights.split(';').map(w=>w.trim());r=U.distribute(x.total,weights,x.method);r.shares.forEach((share,i)=>out('Cote '+(i+1)+' · demi-intervalle ±',share,'mm',8));out('Demi-intervalle cumulé · pire des cas',r.totalWorst,'mm',8);out('Demi-intervalle cumulé · RSS',r.totalRSS,'mm',8);if(x.method==='rss')rows.unshift(['Méthode','Allocation statistique, sans garantie au pire des cas','']);}
 else if(slug==='jeuangulaire'){r=U.bushPlay(x);out('Angle maximal dans le modèle',r.angleDeg,'°',7);out('Déplacement au point H · amplitude ±',r.offsetMax,'mm',7);out('Battement total au point H',2*r.offsetMax,'mm',7);r.clearances.forEach((c,i)=>out('Jeu radial maximal · bague '+(i+1),c,'mm',7));}
 else if(slug==='securite'){r=S.safetyDistance(x);out('Budget de distance calculé · étude seule',r.distance,'mm',4);out('Temps total de réponse et d’arrêt',r.totalMs,'ms');out('Parcours pendant T',r.approachDistance,'mm');out('Distance additionnelle D_DS',r.intrusion,'mm');out('Distance supplémentaire Z',r.margin,'mm');}
 else if(slug==='anneaux'){r=S.retainingRing({ringCapacity:x.ringCapacity,diameter:x.diameter,edgeDistance:x.edgeDistance,shearStress:x.allowShear,engagement:x.engagement,bearingPressure:x.allowBearing,safetyFactor:x.safety,appliedForce:x.force});out('Limite réduite du modèle',r.allowable,'N');out('Taux de charge du modèle',r.utilization*100,'%');out('Capacité fabricant saisie',r.ringCapacity,'N');out('Limite idéale · cisaillement de gorge',r.grooveShearCapacity,'N');out('Limite idéale · appui de gorge',r.grooveBearingCapacity,'N');out('Mode limitant dans ce modèle',r.limitingModes);}
 else if(slug==='visbilles'){r=T.ballScrew(x);out('Couple d’entraînement, hors inerties',r.torque,'N·m');out('Vitesse de rotation',r.rpm,'tr/min');out('Puissance d’entrée mécanique',r.inputPower,'W');out('Puissance axiale utile',r.mechanicalPower,'W');out('Temps à vitesse constante pour une course',r.strokeSeconds,'s');out('Durée nominale L₁₀ · distance',r.lifeKm,'km');out('Durée nominale L₁₀ · déplacement continu',r.lifeHours,'h');out('Allers-retours nominaux',r.roundTrips,'',0);}
 else if(slug==='vistrapezoidale'){r=T.trapezoidalScrew(x);out('Couple de montée',r.torqueRaise,'N·m');out('Couple de descente',r.torqueLower,'N·m');out('Rendement théorique de montée',r.efficiency*100,'%');out('Angle d’hélice',r.leadAngle,'°');out('Angle de frottement corrigé',r.frictionAngle,'°');out('Comportement théorique du filet',r.neutralLocking?'À la limite de réversibilité':r.selfLocking?'Autoblocage théorique':'Charge entraînante — réversible');}
 else if(slug==='guidages'){r=T.linearGuide(x);r.loads.forEach((F,i)=>out('Patin '+(i+1)+' · '+['−x, −y','−x, +y','+x, −y','+x, +y'][i],F,'N'));out('Charge normale maximale en valeur absolue',r.maxLoad,'N');out('Durée nominale L₁₀ estimée',r.lifeKm,'km');out('Rapport C₀ / charge maximale',r.staticSafety);if(r.hasReversedLoad)note='Certaines réactions changent de sens : vérifier les capacités fabricant dans les deux sens. '+note;}
 else throw Error('Outil inconnu.');
 show('out_library',rows,note);
 });};
document.addEventListener('DOMContentLoaded',()=>{
 const nav=document.querySelector('nav[aria-label="Calculateurs"]');if(nav){const end=nav.querySelector('.nav-bottom');for(const [key,t] of Object.entries(LibraryTools)){if(nav.querySelector('a[href="'+key+'.html"]'))continue;const a=document.createElement('a');a.href=key+'.html';a.innerHTML='<span class="nav-number">'+t.number+'</span>'+escapeHTML(t.title);if(key===slug){a.className='active';a.setAttribute('aria-current','page');}nav.insertBefore(a,end);}}
 const tiles=document.querySelector('main.home .tiles');if(tiles){for(const [key,t] of Object.entries(LibraryTools)){if(tiles.querySelector('a[href="'+key+'.html"]'))continue;const a=document.createElement('a');a.className='tile';a.href=key+'.html';a.innerHTML='<div class="icon">'+t.number+'</div><div class="title">'+escapeHTML(t.title)+'</div><div class="desc">'+escapeHTML(t.description)+'</div>';tiles.append(a);}}
 if(!LibraryTools[slug])return;
 const main=document.querySelector('main');main.addEventListener('change',syncLibrary);main.addEventListener('input',syncLibrary);syncLibrary();
 document.addEventListener('click',e=>{if(e.target.id==='preset-load'){syncLibrary();if(slug==='conversion'&&typeof readStore==='function'){const saved=readStore('clemeca_presets')[slug]?.[v('preset-list')];if(saved)for(const key of ['lib_from','lib_to'])if([...$(key).options].some(o=>o.value===saved[key]))$(key).value=saved[key];}}});
 const ref=document.querySelector('.reference');if(ref){const p=document.createElement('p');p.textContent='Fonction inspirée du catalogue h7g6, implémentation indépendante. Les résultats protégés et les sélections de références commerciales ne sont pas reproduits.';ref.append(p);const a=document.createElement('a');a.href='https://www.h7g6.fr/tools';a.textContent='Catalogue des fonctions de référence h7g6 ↗';a.target='_blank';a.rel='noopener';ref.append(a);}
});
// Build unit options before initialize() records defaults and applies URL values.
if(slug==='conversion')syncLibrary();

/* Static plane stress and circular shafts. mm, N, N·m, MPa. */
(function(root){
'use strict';
const C=typeof module==='object'?require('./calculations.js'):root.Calculations;
function finite(r){for(const x of Object.values(r).flat())if(typeof x==='number'&&!Number.isFinite(x))throw Error('Valeurs hors du domaine numérique.');return r;}
function plane(sx,sy,tau){
 sx=C.num(sx,'σx');sy=C.num(sy,'σy');tau=C.num(tau,'τxy');
 const center=sx/2+sy/2,half=sx/2-sy/2,radius=Math.hypot(half,tau),planePlus=center+radius,planeMinus=center-radius;
 const principal=[planePlus,planeMinus,0].sort((a,b)=>b-a);
 return finite({sx,sy,tau,center,radius,planePlus,planeMinus,principal,tauMax3:principal[0]/2-principal[2]/2,vm:Math.hypot((sx-sy)/Math.SQRT2,sx/Math.SQRT2,sy/Math.SQRT2,Math.sqrt(3)*tau)});
}
function shaft(D,d,N,M,T){
 D=C.pos(D,'Le diamètre extérieur');d=C.pos(d,'Le diamètre intérieur',true);
 if(d>=D)throw Error('Le diamètre intérieur doit être inférieur au diamètre extérieur.');
 N=C.num(N,'L’effort axial');M=C.pos(M,'Le moment de flexion résultant',true);T=C.num(T,'Le couple de torsion');
 const A=Math.PI*(D*D-d*d)/4,I=Math.PI*(D**4-d**4)/64,J=2*I;
 const axial=N/A,bending=M*1000*(D/2)/I,tau=T*1000*(D/2)/J;
 const plus=plane(axial+bending,0,tau),minus=plane(axial-bending,0,tau),r=plus.vm>=minus.vm?plus:minus;
 return finite({...r,A,I,J,axial,bending,opposite:plus.vm>=minus.vm?minus.vm:plus.vm});
}
function assess(r,Re,target){
 target=C.pos(target,'Le coefficient visé');if(target<1)throw Error('Le coefficient visé doit être supérieur ou égal à 1.');
 if(!String(Re??'').trim())return {...r,limit:null,factor:null,usage:null,ok:null,target};
 Re=C.pos(Re,'La limite élastique');const limit=Re/target;
 return finite({...r,limit,factor:r.vm===0?null:Re/r.vm,usage:r.vm/limit,ok:r.vm<=limit,target});
}
root.VonMises={plane,shaft,assess};if(typeof module==='object')module.exports=root.VonMises;
})(typeof window==='undefined'?globalThis:window);

if(typeof window!=='undefined'){
info.contraintes=['Contraintes combinées · Von Mises',
 'État plan : σVM=√(σx²−σxσy+σy²+3τxy²). c=(σx+σy)/2 ; R=√[((σx−σy)/2)²+τxy²] ; contraintes principales du plan=c±R. La troisième valeur hors plan vaut 0 ; les trois valeurs sont triées σ₁≥σ₂≥σ₃. τmax,3D=(σ₁−σ₃)/2. Arbre : A=π(D²−d²)/4 ; I=π(D⁴−d⁴)/64 ; J=2I ; σ=N/A±MR/I ; τ=TR/J, avec R=D/2 et M,T convertis en N·mm. Les deux fibres extrêmes sont comparées. Seuil=Re/n visé ; n obtenu=Re/σVM.',
 'Contraintes en un même point, état de contraintes planes (σz=τxz=τyz=0). Traction positive, compression négative ; τxy est la composante suivant y sur la face de normale +x. Von Mises estime le début de plastification d’un matériau ductile isotrope, sous charge statique. La comparaison utilise la limite élastique et le coefficient que vous saisissez. Arbre circulaire idéal plein ou creux : flexion résultante positive, effort axial et torsion signés ; maximum à la périphérie dans ce modèle. Effort tranchant transversal, rainures, entailles, concentrations, fatigue et flambement non inclus. Les contraintes calculées au-delà de Re restent des valeurs élastiques théoriques. σVM nul : le rapport Re/σVM n’a pas de valeur finie.',
 'MIT — Yield criteria and Mohr’s circle',
 'https://ocw.mit.edu/courses/22-312-engineering-of-nuclear-reactors-fall-2015/eb49bc4f3e701be60ca651c5a109312f_MIT22_312F15_note_L4.pdf'];
window.syncVM=function(){
 const shaft=v('vm_mode')==='shaft';document.querySelectorAll('[data-vm-mode]').forEach(el=>el.hidden=el.dataset.vmMode!==(shaft?'shaft':'plane'));
 $('vm_inner').hidden=!shaft||v('vm_section')!=='tube';
 $('vm_mode_help').textContent=shaft?'Les moments sont ceux de la section étudiée. M est la valeur résultante positive de flexion ; N est positif en traction.':'Saisissez les trois contraintes au même point, dans les mêmes axes. Traction positive, compression négative.';
};
function mohr(r){
 const figure=$('vm_mohr');figure.hidden=false;
 let lo=Math.min(0,r.planeMinus),hi=Math.max(0,r.planePlus),span=hi-lo;
 if(span===0){lo=-1;hi=1;span=2;}
 const unit=Math.max(span/360,r.radius/86),mid=lo/2+hi/2,x=s=>250+(s-mid)/unit,y=t=>125-t/unit,rad=r.radius/unit;
 const axisX=x(0),axisY=y(0);
 figure.querySelector('svg').innerHTML=`<title>Cercle de Mohr dans le plan. Contrainte principale supérieure ${fmt(r.planePlus,3)} MPa, inférieure ${fmt(r.planeMinus,3)} MPa.</title><g class="vm-axis"><path d="M45 ${axisY}H465M${axisX} 22V224"/><text x="465" y="${axisY-9}" text-anchor="end">σ (MPa)</text><text x="${Math.min(440,axisX+12)}" y="23">τ</text></g><circle class="vm-circle" cx="${x(r.center)}" cy="125" r="${rad}"/><path class="vm-diameter" d="M${x(r.sx)} ${y(r.tau)}L${x(r.sy)} ${y(-r.tau)}"/><circle class="vm-point" cx="${x(r.sx)}" cy="${y(r.tau)}" r="4.5"/><circle class="vm-point secondary" cx="${x(r.sy)}" cy="${y(-r.tau)}" r="4.5"/><text class="vm-end" x="${x(r.planeMinus)-5}" y="151" text-anchor="end">σ−</text><text class="vm-end" x="${x(r.planePlus)+5}" y="151">σ+</text>`;
 figure.querySelector('figcaption').textContent=r.radius===0?'Cercle réduit à un point. Cisaillement maximal dans le plan : 0 MPa.':'Cercle de Mohr dans le plan · rayon = '+fmt(r.radius,4)+' MPa. Bleu : (σx, τxy) ; violet : (σy, −τxy).';
}
window.calcVM=function(){
 syncVM();$('vm_mohr').hidden=true;
 run('out_vm',()=>{
  const shaft=v('vm_mode')==='shaft',x=id=>v('vm_'+id);
  let r=shaft?VonMises.shaft(x('D'),v('vm_section')==='tube'?x('d'):0,x('N'),x('M'),x('T')):VonMises.plane(x('sx'),x('sy'),x('tau'));
  r=VonMises.assess(r,x('Re'),x('target'));
  const verdict=r.ok===null?'Limite élastique non renseignée':r.ok?'Sous le seuil saisi':'Seuil saisi dépassé';
  const rows=[['Contrainte équivalente de Von Mises',fmt(r.vm,5),'MPa'],['Comparaison au seuil Re / n visé',verdict],['Seuil saisi',r.limit===null?'Non renseigné':fmt(r.limit,4),r.limit===null?'':'MPa'],['Coefficient obtenu Re / σVM',r.limit===null?'Non vérifié':r.vm===0?'Non défini · contraintes nulles':fmt(r.factor,4)],['Contrainte principale σ₁',fmt(r.principal[0],5),'MPa'],['Contrainte principale σ₂',fmt(r.principal[1],5),'MPa'],['Contrainte principale σ₃',fmt(r.principal[2],5),'MPa'],['Cisaillement maximal · 3D',fmt(r.tauMax3,5),'MPa'],['Contrainte normale σx',fmt(r.sx,5),'MPa'],['Contrainte normale σy',fmt(r.sy,5),'MPa'],['Cisaillement τxy',fmt(r.tau,5),'MPa']];
  if(shaft)rows.push(['Contrainte axiale N / A',fmt(r.axial,5),'MPa'],['Flexion · amplitude à la périphérie',fmt(r.bending,5),'MPa']);
  show('out_vm',rows,(shaft?'Résultats au point périphérique où Von Mises est maximal dans ce modèle. ':'Résultats au point saisi. ')+'Comparaison statique selon Re et le coefficient visé ; les trois contraintes principales incluent la valeur hors plan nulle.');mohr(r);
 });
};
document.addEventListener('DOMContentLoaded',()=>{
 syncVM();
 const card=document.querySelector('main .card');for(const event of ['input','change'])card.addEventListener(event,()=>{$('vm_mohr').hidden=true;});
 document.addEventListener('click',e=>{if(e.target.id==='preset-load'){syncVM();$('vm_mohr').hidden=true;}});
 const ref=document.querySelector('.reference');
 for(const [title,url] of [['Duke University — transformation des contraintes','https://people.duke.edu/~hpgavin/egr201/CourseNotes/stress-transformation.pdf'],['MIT — arbres en flexion et torsion','https://ocw.mit.edu/courses/2-017j-design-of-electromechanical-robotic-systems-fall-2009/16cb0f850752422026a85d838f30e340_MIT2_017JF09_machines.pdf'],['MIT — sections circulaires creuses','https://ocw.mit.edu/courses/2-72-elements-of-mechanical-design-spring-2009/36eed65f96add829d317d8d83b80bf30_MIT2_72s09_lec03.pdf']]){const a=document.createElement('a');a.textContent=title+' ↗';a.href=url;a.target='_blank';a.rel='noopener';a.style.display='block';ref.append(a);}
});
}

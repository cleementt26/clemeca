/* Shared presentation. Input IDs, calculation handlers and reporting stay intact. */
document.addEventListener('DOMContentLoaded',()=>{
 document.body.classList.add('site-studio');
 // Decoration only; the user's motion preference takes precedence.
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false;try{paused=localStorage.getItem('clemeca_ambient_paused')==='true';}catch{}
 const motionButton=document.createElement('button');motionButton.type='button';motionButton.className='ambient-toggle';
 function syncMotion(){document.body.classList.toggle('ambient-paused',paused||motion.matches);motionButton.textContent=motion.matches?'Fond fixe':paused?'Animer le fond':'Figer le fond';motionButton.disabled=motion.matches;motionButton.setAttribute('aria-label',motion.matches?'Animation désactivée selon votre préférence de réduction des mouvements':paused?'Activer l’animation du fond':'Mettre en pause l’animation du fond');}
 motionButton.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('clemeca_ambient_paused',String(paused));}catch{}syncMotion();});
 motion.addEventListener('change',syncMotion);syncMotion();document.querySelector('footer')?.append(motionButton);
 const mark=document.querySelector('.brand-mark');if(mark){mark.replaceChildren();const logo=document.createElement('img');logo.src='clemeca-icon.svg';logo.alt='';logo.width=38;logo.height=38;mark.append(logo);}
 const main=document.querySelector('main');
 if(!main||main.classList.contains('home')||/report/.test(location.pathname)||document.body.classList.contains('vibration-studio'))return;
 const heading=main.querySelector('.page-heading');
 const cards=main.querySelectorAll(':scope > .card');
 cards.forEach(card=>{
  const title=card.querySelector(':scope > h2');const description=card.querySelector(':scope > .subtle');
  card.classList.add('studio-calculator');
  const intro=document.createElement('div');intro.className='studio-card-intro';if(title)intro.append(title);if(description)intro.append(description);
  const inputs=document.createElement('div');inputs.className='studio-inputs';
  const label=document.createElement('p');label.className='studio-overline';label.textContent='01 / LES PARAMÈTRES';inputs.append(label);
  const output=document.createElement('div');output.className='studio-output';
  const figure=card.querySelector('.calc-diagram');if(figure)output.append(figure);
  const results=[...card.querySelectorAll('[id^="out_"]')];
  const captions={out_th_heat:'Énergie thermique',out_th_ig:'Gaz parfaits'};
  results.forEach(result=>{if(captions[result.id]){const h=document.createElement('h3');h.className='studio-result-title';h.textContent=captions[result.id];output.append(h);}output.append(result);});
  const zones=card.querySelector('#fit-zones');if(zones)output.append(zones);
  for(const node of [...card.childNodes])inputs.append(node);
  card.append(intro,inputs,output);
  if(!figure)output.classList.add('without-diagram');
 });
 const reference=main.querySelector('.reference');if(reference){reference.classList.add('studio-reference');reference.querySelector('summary').textContent='Comprendre les formules et les limites du modèle';}
 if(heading){const p=document.createElement('p');p.className='studio-page-note';p.textContent='Paramétrez. Explorez. Vérifiez.';heading.append(p);}
});

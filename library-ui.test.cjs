/* DOM integration tests. Install jsdom as a development-only dependency to run. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require(process.env.CLEMECA_JSDOM_PATH||'jsdom');
const root=__dirname;let assertions=0;
function check(value,message){assert.ok(value,message);assertions++;}
async function page(file,query=''){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://cleementt26.github.io/clemeca/'+file+query,runScripts:'dangerously',virtualConsole:vc});
 const w=dom.window;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};
 const scripts=[...w.document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'));
 for(const script of scripts){if(/^https?:/.test(script))continue;const el=w.document.createElement('script');el.textContent=fs.readFileSync(path.join(root,script),'utf8')+'\n//# sourceURL='+script;w.document.head.appendChild(el);}
 await new Promise(resolve=>w.document.addEventListener('DOMContentLoaded',()=>setTimeout(resolve,0),{once:true}));
 check(errors.length===0,file+' runtime errors: '+errors.join('; '));return {dom,w,errors};
}
(async()=>{
 const registry=require('./library-data.js');
 for(const key of Object.keys(registry)){
  const {dom,w,errors}=await page(key+'.html');const doc=w.document,out=doc.getElementById('out_library');
  check(doc.querySelectorAll('nav[aria-label="Calculateurs"] a').length===32,key+' complete navigation');
  check(doc.querySelector('.reference')?.textContent.includes('h7g6'),key+' formulas/reference');
  check(doc.querySelector('nav a[aria-current="page"]')?.getAttribute('href')===key+'.html',key+' current navigation');
  if(['securite','anneaux'].includes(key)){
   check(out.dataset.valid==='false',key+' no automatic incomplete calculation');
   if(key==='securite')for(const [name,value] of Object.entries({K:1600,deviceMs:20,relayMs:10,stopMs:200,intrusion:100,margin:50}))doc.getElementById('lib_'+name).value=value;
   else for(const [name,value] of Object.entries({ringCapacity:10000,diameter:20,edgeDistance:3,engagement:1,allowShear:100,allowBearing:150}))doc.getElementById('lib_'+name).value=value;
   doc.querySelector('button[onclick="calcLibrary()"]').click();
  }
  check(out.dataset.valid==='true',key+' valid editable example: '+out.textContent);
  check(!out.textContent.match(/NaN|Infinity|undefined/),key+' finite readable output');
  check(w.eval('reportSnapshot()').blocks.length===1,key+' report integration');
  if(key==='conversion'){
   check(doc.getElementById('lib_to').value==='m','initial mm → m preserved');
   doc.getElementById('lib_category').value='pressure';w.syncLibrary();doc.getElementById('lib_from').value='bar';doc.getElementById('lib_to').value='MPa';doc.getElementById('lib_value').value='10';w.calcLibrary();
   check(out.querySelector('strong').textContent.trim()==='1 MPa','10 bar → 1 MPa');
   doc.getElementById('preset-name').value='Pression';doc.getElementById('preset-save').click();
   doc.getElementById('lib_category').value='temperature';w.syncLibrary();
   doc.getElementById('preset-list').value='Pression';doc.getElementById('preset-load').click();w.calcLibrary();
   check(doc.getElementById('lib_from').value==='bar'&&doc.getElementById('lib_to').value==='MPa','preset unit restoration');
   doc.querySelector('button[onclick^="resetAll"]').click();w.calcLibrary();check(doc.getElementById('lib_category').value==='length'&&doc.getElementById('lib_to').value==='m','conversion reset');
  }
  if(key==='masse'||key==='cycle'){
   doc.getElementById('lib_count').value='1';w.syncLibrary();w.calcLibrary();
   const snap=w.eval('reportSnapshot()');check(!snap.blocks[0].inputs.some(x=>/lib_2_/.test(x.label)),key+' hidden row excluded from report');
   doc.getElementById('lib_count').value='';w.calcLibrary();check(out.dataset.valid==='false',key+' invalid count rejected');
  }
  if(key==='jeuangulaire'){
   doc.getElementById('lib_count').value='1';w.syncLibrary();w.calcLibrary();check(doc.getElementById('lib_bore2Max').disabled,'single bush ignores second geometry');check(out.dataset.valid==='true','single bush valid');
  }
  check(errors.length===0,key+' no errors after interactions: '+errors.join('; '));dom.window.close();
 }
 const restored=await page('conversion.html','?lib_category=pressure&lib_from=psi&lib_to=bar&lib_value=100');
 check(restored.w.document.getElementById('lib_from').value==='psi'&&restored.w.document.getElementById('lib_to').value==='bar','query unit restoration');check(restored.w.document.getElementById('out_library').dataset.valid==='true','query calculates');restored.dom.window.close();
 const home=await page('index.html');check(home.w.document.querySelectorAll('.tile').length===31,'home has 31 tools');check([...home.w.document.querySelectorAll('.tile')].every(t=>t.dataset.group&&t.dataset.group!=='undefined'),'all tiles categorized');
 home.w.document.getElementById('tool-search').value='billes';home.w.document.getElementById('tool-search').dispatchEvent(new home.w.Event('input',{bubbles:true}));check([...home.w.document.querySelectorAll('.tile:not([hidden])')].some(t=>t.getAttribute('href')==='visbilles.html'),'new tools searchable');home.dom.window.close();
 for(const file of ['ajustements.html','vissage.html','engrenages.html','torsion.html','clavette.html','roulements.html','courroie.html','taraudage.html','rdm.html','thermo.html','verins.html','fluides.html','pompes.html','vibrations.html','puissance.html','dilatation.html','chaines.html','sections.html','flambement.html','ressorts.html','contraintes.html']){
  const original=await page(file);check(original.w.document.querySelectorAll('nav[aria-label="Calculateurs"] a').length===32,file+' links new catalogue');original.dom.window.close();
 }
 console.log(assertions+' DOM integration checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});

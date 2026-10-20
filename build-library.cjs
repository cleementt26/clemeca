/* Regenerate only the ten library pages; shared original pages are not overwritten. */
const fs=require('node:fs');
const tools=require('./library-data.js');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const home=fs.readFileSync('index.html','utf8');
const nav=home.match(/<nav aria-label="Calculateurs">[\s\S]*?<\/nav>/)[0].replace('class="active" aria-current="page"','class=""');
const footer=home.match(/<footer>[\s\S]*?<\/footer>/)[0];
function field(f,prefix='lib_',className='col-6',attributes=''){
 const id=prefix+f.id,label=esc(f.label);let control;
 if(f.options)control='<select id="'+id+'" onchange="syncLibrary()">'+f.options.map(([v,l])=>'<option value="'+esc(v)+'"'+(String(v)===String(f.value)?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select>';
 else control='<input id="'+id+'" type="text"'+(!f.text?' inputmode="decimal"':'')+' value="'+esc(f.value)+'" autocomplete="off">';
 return '<div class="'+className+'" '+attributes+'><label for="'+id+'">'+label+'</label>'+control+'</div>';
}
const shapeOptions=[['box','Pavé rectangulaire'],['cylinder','Cylindre plein'],['tube','Tube cylindrique'],['sphere','Sphère']];
function repeated(kind){let out='';const max=kind==='mass'?10:12;for(let i=1;i<=max;i++){
 const prefix='lib_'+i+'_';out+='<section class="library-repeat" data-row="'+i+'"'+(i>2?' hidden':'')+'><h3>'+(kind==='mass'?'Pièce ':'Étape ')+i+'</h3><div class="row">';
 if(kind==='mass'){
  out+=field({id:'shape',label:'Forme',options:shapeOptions,value:i===2?'cylinder':'box'},prefix);
  out+=field({id:'quantity',label:'Quantité',value:1},prefix);
  out+=field({id:'density',label:'Masse volumique (kg/m³)',value:i===2?2700:7850},prefix,'col-12');
  for(const [id,label,value] of [['L','Longueur L (mm)',100],['W','Largeur l (mm)',50],['H','Hauteur h (mm)',20],['D','Diamètre extérieur D (mm)',30],['d','Diamètre intérieur d (mm)',20]])out+=field({id,label,value},prefix,'col-4','data-dimension="'+id+'"');
 }else{
  out+=field({id:'type',label:'Type de mouvement',options:[['translation','Translation'],['rotation','Rotation'],['pause','Pause']],value:i===2?'pause':'translation'},prefix,'col-12');
  for(const [id,label,value] of [['distance','Déplacement (mm)',500],['speed','Vitesse maximale (mm/s)',100],['accel','Accélération (mm/s²)',500],['decel','Décélération (mm/s²)',500]])out+=field({id,label,value},prefix,'col-6','data-motion');
  out+=field({id:'pause',label:'Durée de pause (s)',value:1},prefix,'col-12','data-pause');
 }
 out+='</div></section>';
 }return out;}
function diagram(key){
 const line='<g class="drawing">',end='</g>';
 const bodies={
 conversion:'<path d="M50 60H190V145H50ZM310 60H450V145H310ZM210 90H290l-10-8m10 8-10 8M290 125H210l10-8m-10 8 10 8"/><text x="120" y="110">A</text><text x="380" y="110">B</text>',
 masse:'<path d="M95 65 230 35 360 70 225 105Z M95 65V150l130 40 135-45V70M225 105v85"/><text x="240" y="225">m = ρ × V</text>',
 cycle:'<path d="M45 180V30M45 180H460M50 180 130 55H340L430 180"/><text x="75" y="30">v</text><text x="463" y="205">t</text><text x="235" y="85">vitesse</text><text x="240" y="155">aire = déplacement</text>',
 repartition:'<path d="M50 80H450M50 65V95M450 65V95M50 160H180M180 160H310M310 160H450M50 145V175M180 145V175M310 145V175M450 145V175"/><text x="250" y="55">Budget ±T</text><text x="110" y="205">±t₁</text><text x="245" y="205">±t₂</text><text x="380" y="205">±t₃</text>',
 jeuangulaire:'<path d="M85 65H150V170H85ZM265 65H330V170H265ZM45 135 445 95M45 145 445 105M115 205H300"/><text x="205" y="225">Entraxe des centres</text><text x="412" y="75">±y(H)</text>',
 securite:'<path d="M70 50V185M410 50V185M90 145H390M90 135V155M390 135V155"/><text x="250" y="115">S = K·T + D_DS + Z</text><text x="250" y="205">Budget de distance — étude</text>',
 anneaux:'<path d="M50 70H240V100H260V70H430M50 165H240V135H260V165H430M238 60H263V175H238Z"/><text x="135" y="205">arbre</text><text x="325" y="205">gorge & anneau</text>',
 visbilles:'<path d="M45 110H455M50 95H450V125H50ZM90 95l30 30m0-30 30 30m0-30 30 30m0-30 30 30m0-30 30 30m0-30 30 30m0-30 30 30M225 65H315V155H225Z"/><text x="250" y="205">avance = mm par tour</text>',
 vistrapezoidale:'<path d="M50 125 85 125 100 95H120L135 125H155L170 95H190L205 125H225L240 95H260L275 125H295L310 95H330L345 125H365L380 95H400L415 125H450"/><text x="250" y="205">avance · frottement · couple</text>',
 guidages:'<path d="M60 60H440M60 165H440M110 45H165V75H110ZM335 45H390V75H335ZM110 150H165V180H110ZM335 150H390V180H335Z M250 20V115l-7-12m7 12 7-12"/><text x="275" y="25">Fz</text><text x="140" y="101">−x, −y</text><text x="360" y="101">+x, −y</text><text x="250" y="220">4 patins · 2 rails</text>'};
 return '<figure class="calc-diagram"><svg viewBox="0 0 500 245" role="img" aria-label="'+esc(tools[key].title)+' : schéma de principe">'+line+bodies[key]+end+'</svg><figcaption>'+esc(tools[key].title)+'<span>Schéma de principe · non à l’échelle</span></figcaption></figure>';
}
for(const [key,t] of Object.entries(tools)){
 let warning=['anneaux','securite','guidages','visbilles','vistrapezoidale'].includes(key)?'<p class="library-warning">'+esc(t.limit)+'</p>':'';
 const scripts=['calculations.js','app.js','h7-utilities.js','translation-models.js','screening-models.js','library-data.js','library-tools.js','experience.js','studio.js'];
 const head=scripts.map(src=>'<script defer src="'+src+(['app.js','experience.js'].includes(src)?'?v=20261020-h7':'')+'"></script>').join('');
 const html='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(t.title)+' – CléMéca</title><meta name="description" content="'+esc(t.description)+'"><link rel="icon" href="clemeca-icon.svg">'+['style.css','experience.css','studio.css','library-tools.css'].map(h=>'<link rel="stylesheet" href="'+h+'">').join('')+head+'</head><body><a class="skip" href="#main">Aller au calculateur</a><header><a class="brand" href="index.html"><span class="brand-mark">c<span>m</span></span><span>CléMéca</span></a><span class="header-note">Mécanique & thermique</span></header><div class="container">'+nav+'<main class="grid" id="main"><div class="page-heading"><div class="eyebrow">'+esc(t.group)+' <span>/ '+t.number+'</span></div><h1>'+esc(t.title)+'</h1></div>'+warning+'<section class="card"><h2>'+esc(t.title)+'</h2><p class="subtle">'+esc(t.description)+'</p>'+diagram(key)+'<div class="row">'+t.fields.map(f=>field(f)).join('')+(t.repeat?repeated(t.repeat):'')+'<div class="col-12"><button type="button" class="btn" onclick="calcLibrary()">Calculer</button><button type="button" class="btn secondary" onclick="resetAll();syncLibrary()">Réinitialiser</button></div></div><div id="out_library" class="muted-box" aria-live="polite"></div></section></main></div>'+footer+'<script defer src="reporting.js"></script></body></html>\n';
 fs.writeFileSync(key+'.html',['anneaux','securite'].includes(key)?html.replace('onclick="calcLibrary()"','data-no-auto onclick="calcLibrary()"'):html);
}
console.log('10 pages de calcul régénérées.');

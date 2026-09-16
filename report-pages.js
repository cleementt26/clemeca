'use strict';
function reportPage(){
 const id=new URLSearchParams(location.search).get('id'),builder=location.pathname.includes('report_builder'),data=builder?readStore('clemeca_drafts')[id]:readStore('clemeca_reports',[]).find(r=>r.id===id),main=document.querySelector('main');
 if(!data){main.innerHTML='<h1>Rapport introuvable</h1><p class="subtle">Ce rapport est enregistré dans le navigateur où il a été créé.</p><a class="btn" href="index.html">Revenir aux calculateurs</a>';return;}
 if(builder){
  $('b_title').value=data.title;
  for(const field of ['project','client','operator','date','location','notes','signature'])$('b_'+field).value=data.meta?.[field]||'';
  $('b_inc_inputs').checked=data.include?.inputs!==false;$('b_inc_outputs').checked=data.include?.outputs!==false;
  $('b_preview').textContent=snapshotText(data,true);
  function collect(){data.title=v('b_title').trim()||'Rapport de calcul';data.meta={};for(const field of ['project','client','operator','date','location','notes','signature'])data.meta[field]=v('b_'+field);data.include={inputs:$('b_inc_inputs').checked,outputs:$('b_inc_outputs').checked};return data;}
  $('save').onclick=()=>{const drafts=readStore('clemeca_drafts');drafts[id]=collect();if(writeStore('clemeca_drafts',drafts))notify('Brouillon enregistré.');};
  $('finalize').onclick=()=>{if(!v('b_title').trim()){notify('Renseignez un titre.');$('b_title').focus();return;}const records=readStore('clemeca_reports',[]).filter(r=>r.id!==id);records.unshift(collect());if(writeStore('clemeca_reports',records))location.href='report.html?id='+encodeURIComponent(id);};
 }else{
  $('report-title').textContent=data.title;$('report-date').textContent='CléMéca · '+new Date(data.createdAt).toLocaleString('fr-FR');$('report-content').textContent=snapshotText(data);$('report-download').onclick=()=>downloadText(snapshotText(data),'clemeca-rapport.txt');$('report-copy').onclick=()=>copyText(snapshotText(data));
 }
}
document.addEventListener('DOMContentLoaded',reportPage);

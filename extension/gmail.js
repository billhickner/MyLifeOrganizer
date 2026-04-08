// Max Gmail Extension - Content Script (gmail.js) V2
// Filters out internal blob rows from project picker
const PROJ_API='https://billhickner-organizer.netlify.app/.netlify/functions/get-projects';
const SAVE_API='https://billhickner-organizer.netlify.app/.netlify/functions/save-email';
let lastUrl='';
function poll(){if(location.href!==lastUrl){lastUrl=location.href;tryInject();}}
setInterval(poll,1500);
new MutationObserver(poll).observe(document.body,{childList:true,subtree:true});
tryInject();

function tryInject(){
  if(document.getElementById('max-save-btn'))return;
  var s=document.querySelector('h2.hP');
  if(!s)return;
  var bar=s.closest('.ha')||s.parentElement;
  if(!bar)return;
  var btn=document.createElement('div');
  btn.id='max-save-btn';
  btn.style.cssText='display:inline-flex;align-items:center;gap:6px;padding:6px 14px;margin-left:10px;background:#1e40af;color:white;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;font-family:system-ui;box-shadow:0 1px 3px rgba(0,0,0,0.2);user-select:none;vertical-align:middle';
  btn.textContent='\ud83d\udcc1 Save to Max';
  btn.title='Save this email to a PulsAIO project';
  btn.addEventListener('click',function(e){e.stopPropagation();openModal();});
  bar.appendChild(btn);
}

function getEmailInfo(){
  var s=(document.querySelector('h2.hP')||{}).textContent||'';
  var sender='',sn='';
  var se=document.querySelector('.gD');
  if(se){sn=se.getAttribute('name')||se.textContent||'';sender=se.getAttribute('email')||'';}
  var body='';var be=document.querySelector('.a3s.aiL');
  if(be)body=be.innerText.substring(0,2000);
  return{subject:s,sender:sender,senderName:sn,body:body,url:location.href};
}
function openModal(){
  var old=document.getElementById('max-modal-overlay');if(old)old.remove();
  var em=getEmailInfo();window._em=em;
  var o=document.createElement('div');o.id='max-modal-overlay';
  o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:system-ui';
  var html='<div style="background:white;border-radius:16px;padding:28px;width:420px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.3)">';
  html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
  html+='<div style="font-size:18px;font-weight:700;color:#1e293b">Save to Max</div>';
  html+='<button id="mclose" style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8">x</button></div>';
  html+='<div style="background:#f1f5f9;border-radius:10px;padding:12px;margin-bottom:16px">';
  html+='<div style="font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+em.subject+'</div>';
  html+='<div style="font-size:12px;color:#64748b;margin-top:4px">From: '+em.senderName+'</div></div>';
  html+='<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:6px">Select Project</div>';
  html+='<select id="mps" style="width:100%;padding:10px;border:1px solid #dde3f0;border-radius:8px;font-size:14px;font-family:inherit;color:#1e293b;background:white"><option>Loading...</option></select>';
  html+='<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-top:12px;margin-bottom:6px">Note (optional)</div>';
  html+='<textarea id="mnote" placeholder="Add a note..." rows="2" style="width:100%;padding:10px;border:1px solid #dde3f0;border-radius:8px;font-size:13px;font-family:inherit;color:#1e293b;resize:vertical;box-sizing:border-box"></textarea>';
  html+='<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">';
  html+='<button id="mcancel" style="padding:8px 16px;border:1px solid #dde3f0;border-radius:8px;background:white;cursor:pointer;font-size:13px;font-family:inherit;color:#64748b">Cancel</button>';
  html+='<button id="msb" style="padding:8px 20px;border:none;border-radius:8px;background:#1e40af;color:white;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit">Save to Project</button></div>';
  html+='<div id="mst" style="text-align:center;font-size:12px;margin-top:10px;min-height:16px"></div></div>';
  o.innerHTML=html;
  o.onclick=function(e){if(e.target===o)o.remove();};
  document.body.appendChild(o);
  document.getElementById('mclose').onclick=function(){o.remove();};
  document.getElementById('mcancel').onclick=function(){o.remove();};
  document.getElementById('msb').onclick=function(){doSave();};
  // Fetch projects - server filters blobs by default, extra client-side filter for safety
  fetch(PROJ_API).then(function(r){return r.json();}).then(function(d){
    var ps=(d.projects||[]).filter(function(p){return !String(p.id).startsWith('_');});
    var sel=document.getElementById('mps');if(!sel)return;
    sel.innerHTML=ps.length?'<option value="">Pick a project...</option>'+ps.map(function(p){return '<option value="'+p.id+'">['+p.biz+'] '+p.name+'</option>';}).join(''):'<option>No projects yet</option>';
  }).catch(function(){var sel=document.getElementById('mps');if(sel)sel.innerHTML='<option>Error loading projects</option>';});
}

async function doSave(){
  var pid=document.getElementById('mps')?document.getElementById('mps').value:'';
  var note=document.getElementById('mnote')?document.getElementById('mnote').value.trim():'';
  var st=document.getElementById('mst');var btn=document.getElementById('msb');
  if(!pid){if(st){st.textContent='Pick a project first';st.style.color='#ef4444';}return;}
  if(btn){btn.textContent='Saving...';btn.disabled=true;}
  try{
    var r=await fetch(SAVE_API,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(Object.assign({},window._em,{projectId:pid,note:note}))});
    if(r.ok){if(st){st.textContent='Saved!';st.style.color='#16a34a';}
      setTimeout(function(){var m=document.getElementById('max-modal-overlay');if(m)m.remove();},1200);}
    else{throw new Error('fail');}
  }catch(e){if(st){st.textContent='Error - try again';st.style.color='#ef4444';}
    if(btn){btn.textContent='Save to Project';btn.disabled=false;}}
}

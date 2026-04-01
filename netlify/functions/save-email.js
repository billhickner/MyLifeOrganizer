import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const h = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
  if (req.method === 'OPTIONS') return new Response('',{status:200,headers:h});
  if (req.method !== 'POST') return new Response('Method not allowed',{status:405,headers:h});
  try {
    const data = await req.json();
    const {projectId,subject,sender,senderName,date,body,url,note,savedAt} = data;
    if (!projectId) return new Response(JSON.stringify({error:'projectId required'}),{status:400,headers:h});
    const store = getStore('project-emails');
    let emails = [];
    try { emails = await store.get('project-'+projectId,{type:'json'}) || []; } catch {}
    const newEmail = {id:Date.now(),projectId,subject:subject||'(No subject)',sender:sender||'',senderName:senderName||'Unknown',date:date||'',body:(body||'').substring(0,2000),url:url||'',note:note||'',savedAt:savedAt||new Date().toISOString()};
    emails.unshift(newEmail);
    await store.set('project-'+projectId, JSON.stringify(emails.slice(0,100)));
    return new Response(JSON.stringify({success:true,email:newEmail}),{status:200,headers:h});
  } catch(err) {
    return new Response(JSON.stringify({error:err.message}),{status:500,headers:h});
  }
};

export const config = { path: '/api/save-email' };

// get-events.js — GET/POST calendar events to Supabase
const SUPA_URL = 'https://akyadzfkpseyxlhahoej.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreWFkemZrcHNleXhsaGFob2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE1OTAyMCwiZXhwIjoyMDkwNzM1MDIwfQ.B2Y1YwFCiM4drsvGTARUl9kjpr50s6gO1OeL8JpLMyg';
const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Content-Type':'application/json'};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:CORS,body:''};

  try {
    if (event.httpMethod === 'GET') {
      const res = await fetch(SUPA_URL+'/rest/v1/events?select=*&order=date.asc', {
        headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY}
      });
      const data = await res.json();
      return {statusCode:200,headers:CORS,body:JSON.stringify({events:Array.isArray(data)?data:[]})};
    }

    if (event.httpMethod === 'POST') {
      const {events} = JSON.parse(event.body||'{}');
      if (!events?.length) return {statusCode:400,headers:CORS,body:JSON.stringify({error:'events required'})};

      const res = await fetch(SUPA_URL+'/rest/v1/events', {
        method:'POST',
        headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'},
        body:JSON.stringify(events)
      });
      if (!res.ok) {const e=await res.text();return {statusCode:res.status,headers:CORS,body:e};}
      return {statusCode:200,headers:CORS,body:JSON.stringify({success:true,count:events.length})};
    }

    return {statusCode:405,headers:CORS,body:'Method not allowed'};
  } catch(e) {
    return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
  }
};

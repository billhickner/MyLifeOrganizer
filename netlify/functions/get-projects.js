// get-projects.js — Supabase persistent storage
const SUPA_URL = 'https://akyadzfkpseyxlhahoej.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreWFkemZrcHNleXhsaGFob2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE1OTAyMCwiZXhwIjoyMDkwNzM1MDIwfQ.B2Y1YwFCiM4drsvGTARUl9kjpr50s6gO1OeL8JpLMyg';

const hdrs = {
  'apikey': SUPA_KEY,
  'Authorization': 'Bearer ' + SUPA_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const projects = body.projects;
      if (!projects) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'no projects' }) };
      // Upsert all projects
      const rows = projects.map(p => ({ id: String(p.id), name: p.name, biz: p.biz || 'general', status: p.status || 'active', notes: p.notes || '', updated: new Date().toISOString() }));
      const res = await fetch(SUPA_URL + '/rest/v1/projects', { method: 'POST', headers: hdrs, body: JSON.stringify(rows) });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, count: rows.length }) };
    }

    // GET
    const res = await fetch(SUPA_URL + '/rest/v1/projects?select=*&order=updated.desc', { headers: hdrs });
    const projects = await res.json();
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ projects: Array.isArray(projects) ? projects : [] }) };
  } 

  // DELETE: Remove a project by ID
  if (event.httpMethod === "DELETE") {
    try {
      const { ids } = JSON.parse(event.body);
      if (!ids || !Array.isArray(ids)) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "ids array required" }) };
      }
      for (const id of ids) {
        await fetch(`${SUPA_URL}/rest/v1/projects?id=eq.${id}`, { method: "DELETE", headers: HEADERS });
      }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true, deleted: ids.length }) };
    } catch (e) {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
    }
  }
catch(e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message, projects: [] }) };
  }
};
 

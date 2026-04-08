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
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  // GET: Fetch all projects
  if (event.httpMethod === "GET") {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/projects?order=updated.desc`, { headers: hdrs });
      let data = await r.json();
      // Filter out internal blob rows by default. Pass ?all=true to include them.
      var includeAll = event.queryStringParameters && event.queryStringParameters.all === 'true';
      if (!includeAll) {
        data = (Array.isArray(data) ? data : []).filter(function(p) { return !String(p.id).startsWith('_'); });
      }
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ projects: data }) };
    } catch (e) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }
  }

  // DELETE: Remove projects by IDs
  if (event.httpMethod === "DELETE") {
    try {
      const { ids } = JSON.parse(event.body);
      if (!ids || !Array.isArray(ids)) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "ids array required" }) };
      }
      for (const id of ids) {
        await fetch(`${SUPA_URL}/rest/v1/projects?id=eq.${id}`, { method: "DELETE", headers: hdrs });
      }
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, deleted: ids.length }) };
    } catch (e) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }
  }

  // POST: Upsert projects
  if (event.httpMethod === "POST") {
    try {
      const { projects } = JSON.parse(event.body);
      // NOTE: sync:true REMOVED - it deleted ALL rows (V2.7.8 root cause)
      if (projects && projects.length > 0) {
        const r = await fetch(`${SUPA_URL}/rest/v1/projects`, {
          method: "POST",
          headers: { ...hdrs, "Prefer": "resolution=merge-duplicates" },
          body: JSON.stringify(projects)
        });
        const text = await r.text();
      }
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, count: projects ? projects.length : 0 }) };
    } catch (e) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
};
 
 

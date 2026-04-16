// memory.js — Supabase persistent storage
const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

const headers = {
  'apikey': SUPA_KEY,
  'Authorization': 'Bearer ' + SUPA_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
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
      const { memories } = JSON.parse(event.body || '{}');
      if (!memories) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'no memories' }) };
      // Delete all then insert fresh
      await fetch(SUPA_URL + '/rest/v1/memories?id=gte.0', { method: 'DELETE', headers });
      if (memories.length > 0) {
        const rows = memories.map(m => ({ id: m.id, text: m.text, tag: m.tag || 'fact', created: m.created || new Date().toISOString() }));
        await fetch(SUPA_URL + '/rest/v1/memories', { method: 'POST', headers, body: JSON.stringify(rows) });
      }
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, count: memories.length }) };
    }

    // GET
    const res = await fetch(SUPA_URL + '/rest/v1/memories?select=*&order=created.desc', { headers });
    const memories = await res.json();
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ memories: Array.isArray(memories) ? memories : [] }) };
  } catch(e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};

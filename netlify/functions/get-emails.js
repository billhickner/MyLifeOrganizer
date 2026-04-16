// get-emails.js — Supabase persistent storage
const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  // DELETE: Remove an email by ID
  if (event.httpMethod === 'DELETE') {
    try {
      const { id } = JSON.parse(event.body || '{}');
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'id required' }) };
      await fetch(SUPA_URL + '/rest/v1/emails?id=eq.' + id, {
        method: 'DELETE',
        headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, deleted: id }) };
    } catch(e) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }
  }

  try {
    const projectId = event.queryStringParameters?.projectId;
    const url = projectId
      ? SUPA_URL + '/rest/v1/emails?project_id=eq.' + encodeURIComponent(projectId) + '&select=*&order=saved_at.desc'
      : SUPA_URL + '/rest/v1/emails?select=*&order=saved_at.desc&limit=200';

    const res = await fetch(url, {
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY
      }
    });
    const emails = await res.json();
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ emails: Array.isArray(emails) ? emails : [] }) };
  } catch(e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message, emails: [] }) };
  }
};

// save-email.js — Supabase persistent storage
const SUPA_URL = 'https://akyadzfkpseyxlhahoej.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreWFkemZrcHNleXhsaGFob2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE1OTAyMCwiZXhwIjoyMDkwNzM1MDIwfQ.B2Y1YwFCiM4drsvGTARUl9kjpr50s6gO1OeL8JpLMyg';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod === 'GET') {
    // GET emails by project
    const projectId = event.queryStringParameters?.projectId;
    const url = projectId
      ? SUPA_URL + '/rest/v1/emails?project_id=eq.' + projectId + '&select=*&order=saved_at.desc'
      : SUPA_URL + '/rest/v1/emails?select=*&order=saved_at.desc&limit=100';
    const res = await fetch(url, { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY } });
    const emails = await res.json();
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ emails: Array.isArray(emails) ? emails : [] }) };
  }
  if (event.httpMethod === 'POST') {
    try {
      const d = JSON.parse(event.body || '{}');
      const row = {
        id: Date.now(),
        project_id: String(d.projectId || ''),
        subject: d.subject || '',
        sender: d.sender || '',
        sender_name: d.senderName || '',
        body: (d.body || '').substring(0, 2000),
        url: d.url || '',
        note: d.note || '',
        saved_at: new Date().toISOString()
      };
      await fetch(SUPA_URL + '/rest/v1/emails', {
        method: 'POST',
        headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify([row])
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, id: row.id }) };
    } catch(e) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }
  }
  return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
};

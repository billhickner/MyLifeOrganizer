// save-email.js — saves a Gmail email to a project
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' };

  try {
    const data = JSON.parse(event.body);
    const { projectId, subject, sender, senderName, date, body, url, note, savedAt } = data;

    if (!projectId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'projectId required' }) };

    const store = getStore('project-emails');
    const existing = await store.get('project-' + projectId, { type: 'json' }).catch(() => []);
    const emails = Array.isArray(existing) ? existing : [];

    const newEmail = {
      id: Date.now(),
      projectId,
      subject: subject || '(No subject)',
      sender: sender || '',
      senderName: senderName || sender || 'Unknown',
      date: date || '',
      body: (body || '').substring(0, 2000),
      url: url || '',
      note: note || '',
      savedAt: savedAt || new Date().toISOString()
    };

    emails.unshift(newEmail);
    await store.setJSON('project-' + projectId, emails.slice(0, 100));

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, email: newEmail }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

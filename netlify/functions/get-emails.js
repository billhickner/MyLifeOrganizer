// get-emails.js — retrieves emails for a project
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const projectId = event.queryStringParameters && event.queryStringParameters.projectId;
    if (!projectId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'projectId required' }) };

    const store = getStore('project-emails');
    const emails = await store.get('project-' + projectId, { type: 'json' }).catch(() => []);

    return { statusCode: 200, headers, body: JSON.stringify({ emails: Array.isArray(emails) ? emails : [] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message, emails: [] }) };
  }
};

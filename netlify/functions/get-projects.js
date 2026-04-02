const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const store = getStore('max-data');

    if (event.httpMethod === 'POST') {
      const { projects } = JSON.parse(event.body || '{}');
      await store.set('projects', JSON.stringify(projects || []));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // GET
    const raw = await store.get('projects');
    const projects = raw ? JSON.parse(raw) : [];
    return { statusCode: 200, headers, body: JSON.stringify({ projects }) };
  } catch(e) {
    return { statusCode: 200, headers, body: JSON.stringify({ projects: [], error: e.message }) };
  }
};

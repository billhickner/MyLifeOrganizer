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
    const store = getStore('max-projects');

    if (event.httpMethod === 'POST') {
      const { projects } = JSON.parse(event.body || '{}');
      await store.setJSON('projects', projects || []);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, count: (projects||[]).length }) };
    }

    // GET
    let projects = [];
    try { projects = await store.get('projects', { type: 'json' }) || []; } catch(e) {}
    return { statusCode: 200, headers, body: JSON.stringify({ projects }) };

  } catch(e) {
    return { statusCode: 200, headers, body: JSON.stringify({ projects: [], error: e.message }) };
  }
};

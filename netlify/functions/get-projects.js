const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const store = getStore({ name: 'max-data', siteID: process.env.SITE_ID, token: process.env.NETLIFY_API_TOKEN });

  if (event.httpMethod === 'POST') {
    try {
      const { projects } = JSON.parse(event.body);
      await store.set('projects', JSON.stringify(projects || []));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  try {
    const raw = await store.get('projects');
    const projects = JSON.parse(raw || '[]');
    return { statusCode: 200, headers, body: JSON.stringify({ projects }) };
  } catch(e) {
    return { statusCode: 200, headers, body: JSON.stringify({ projects: [] }) };
  }
};

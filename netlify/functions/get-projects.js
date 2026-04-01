// get-projects.js — returns project list for Gmail extension + syncs from Command Center
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
    const store = getStore('project-emails');

    if (event.httpMethod === 'POST') {
      const { projects } = JSON.parse(event.body);
      await store.setJSON('all-projects', projects || []);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    const projects = await store.get('all-projects', { type: 'json' }).catch(() => []);
    return { statusCode: 200, headers, body: JSON.stringify({ projects: Array.isArray(projects) ? projects : [] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message, projects: [] }) };
  }
};

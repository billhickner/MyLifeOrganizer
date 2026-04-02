// get-projects.js — zero dependencies, uses /tmp for persistence
const fs = require('fs');
const FILE = '/tmp/max-projects.json';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  if (event.httpMethod === 'POST') {
    try {
      const { projects } = JSON.parse(event.body || '{}');
      fs.writeFileSync(FILE, JSON.stringify(projects || []));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, count: (projects||[]).length }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // GET
  try {
    const projects = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : [];
    return { statusCode: 200, headers, body: JSON.stringify({ projects }) };
  } catch(e) {
    return { statusCode: 200, headers, body: JSON.stringify({ projects: [] }) };
  }
};

const fs = require('fs');
const path = require('path');
const FILE = path.join('/tmp', 'max-projects.json');

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
      const { projects } = JSON.parse(event.body);
      fs.writeFileSync(FILE, JSON.stringify(projects || []));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, count: (projects||[]).length }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  try {
    const data = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '[]';
    return { statusCode: 200, headers, body: JSON.stringify({ projects: JSON.parse(data) }) };
  } catch(e) {
    return { statusCode: 200, headers, body: JSON.stringify({ projects: [] }) };
  }
};

// memory.js — Max Memory Bank persistence
const fs = require('fs');
const FILE = '/tmp/max-memory.json';

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
      const { memories } = JSON.parse(event.body || '{}');
      fs.writeFileSync(FILE, JSON.stringify(memories || []));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  try {
    const memories = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : [];
    return { statusCode: 200, headers, body: JSON.stringify({ memories }) };
  } catch(e) {
    return { statusCode: 200, headers, body: JSON.stringify({ memories: [] }) };
  }
};

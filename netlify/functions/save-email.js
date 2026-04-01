// save-email.js — zero dependencies
const emails = [];

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
    // Just confirm receipt — email will be stored in Command Center localStorage via the extension
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id: Date.now(), email: data })
    };
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: e.message }) };
  }
};

// get-projects.js — returns projects list
// Projects are passed directly from the extension's localStorage bridge
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  // Projects come from localStorage in the browser — return empty array as fallback
  return { statusCode: 200, headers, body: JSON.stringify({ projects: [] }) };
};

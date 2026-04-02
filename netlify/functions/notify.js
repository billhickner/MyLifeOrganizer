// notify.js — ntfy.sh push notifications with repeat support
const NTFY_TOPIC = 'pulsaio-max-bill';
const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function toAscii(str) {
  return (str || '').replace(/[^\x00-\x7F]/g, '').trim() || 'Max Reminder';
}

async function sendOne(message, title, priority, delayUnix) {
  const headers = {
    'Title': toAscii(title),
    'Priority': String(priority || 4),
    'Tags': 'bell',
    'Content-Type': 'text/plain; charset=utf-8'
  };
  if (delayUnix) headers['X-Delay'] = String(delayUnix);
  return fetch(NTFY_URL, { method: 'POST', headers, body: message });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' };

  try {
    const { title, message, dueDate, priority, repeat } = JSON.parse(event.body || '{}');
    if (!message) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'message required' }) };

    // repeat = number of times to send (default 1, max 30)
    const repeatCount = Math.min(Math.max(parseInt(repeat) || 1, 1), 30);
    const baseTime = dueDate ? new Date(dueDate) : new Date();
    const promises = [];

    for (let i = 0; i < repeatCount; i++) {
      const fireAt = new Date(baseTime.getTime() + i * 60000); // every 1 minute
      const now = new Date();
      const delayUnix = fireAt > now ? Math.floor(fireAt.getTime() / 1000) : null;
      // Add repeat count suffix if more than 1
      const msg = repeatCount > 1
        ? message + (i > 0 ? ' (reminder ' + (i + 1) + ' of ' + repeatCount + ')' : '')
        : message;
      promises.push(sendOne(msg, title, priority, delayUnix));
    }

    await Promise.all(promises);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, sent: repeatCount, topic: NTFY_TOPIC })
    };
  } catch(e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};

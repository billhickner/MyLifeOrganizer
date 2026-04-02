// notify.js — ntfy.sh push notifications for Max reminders
const NTFY_TOPIC = 'pulsaio-max-bill';
const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Strip emojis from header strings (ntfy headers must be ASCII)
function toAscii(str) {
  return (str || '').replace(/[^\x00-\x7F]/g, '').trim() || 'Max Reminder';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' };

  try {
    const { title, message, dueDate, priority } = JSON.parse(event.body || '{}');
    if (!message) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'message required' }) };

    const ntfyHeaders = {
      'Title': toAscii(title),
      'Priority': String(priority || 4),
      'Tags': 'bell',
      'Content-Type': 'text/plain; charset=utf-8'
    };

    // Schedule if dueDate provided
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      if (due > now) {
        ntfyHeaders['X-Delay'] = String(Math.floor(due.getTime() / 1000));
      }
    }

    const res = await fetch(NTFY_URL, {
      method: 'POST',
      headers: ntfyHeaders,
      body: message
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('ntfy error ' + res.status + ': ' + errText);
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, scheduled: !!dueDate, topic: NTFY_TOPIC })
    };
  } catch(e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};

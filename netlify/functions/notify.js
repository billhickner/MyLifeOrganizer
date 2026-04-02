// notify.js — ntfy.sh push notifications for Max reminders
const NTFY_TOPIC = 'pulsaio-max-bill';
const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' };

  try {
    const { title, message, dueDate, priority } = JSON.parse(event.body || '{}');
    if (!message) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'message required' }) };

    const ntfyHeaders = {
      'Title': title || 'Max Reminder',
      'Priority': String(priority || 4),
      'Tags': 'bell,pulsaio',
      'Content-Type': 'text/plain'
    };

    // If dueDate provided, schedule the notification for that exact time
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const diffMs = due - now;
      if (diffMs > 0) {
        // ntfy supports X-Delay as Unix timestamp
        ntfyHeaders['X-Delay'] = String(Math.floor(due.getTime() / 1000));
      }
    }

    const res = await fetch(NTFY_URL, {
      method: 'POST',
      headers: ntfyHeaders,
      body: message
    });

    if (!res.ok) throw new Error('ntfy error: ' + res.status);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, scheduled: !!dueDate, topic: NTFY_TOPIC })
    };
  } catch(e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};

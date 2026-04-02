// tts.js — ElevenLabs Daniel voice
const ELEVEN_KEY = 'sk_6f8e5205a272394658a45c65b3b07cf4e60bc0207088c271';
const DANIEL_ID  = 'onwK4e9ZLuTAKqWW03F9';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' };

  try {
    const { text, voiceId } = JSON.parse(event.body || '{}');
    if (!text) return { statusCode: 400, headers: CORS, body: 'text required' };

    const res = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/' + (voiceId || DANIEL_ID),
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: res.status, headers: CORS, body: err };
    }

    const buf = await res.arrayBuffer();
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'audio/mpeg' },
      body: Buffer.from(buf).toString('base64'),
      isBase64Encoded: true
    };
  } catch(e) {
    return { statusCode: 500, headers: CORS, body: e.message };
  }
};

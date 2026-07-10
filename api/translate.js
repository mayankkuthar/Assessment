// Vercel serverless function: server-side proxy for Google Cloud Translation.
//
// The API key lives ONLY on the server: it is read from the Vercel project's
// Environment Variable GOOGLE_TRANSLATE_API_KEY (NOT a VITE_ var), so it is
// never bundled into the browser, never sent in a request the browser can see,
// and never visible in the Network tab. The client POSTs { q, target, format }
// with NO key; we attach the key to the upstream Google request here.
//
// This mirrors the dev-only Vite proxy in vite.config.js and returns Google's
// NATIVE v2 response shape ({ data: { translations: [{ translatedText }] } }),
// so src/services/translation.js parses the response identically in dev and prod.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Translation is not configured on the server.' });
  }

  const { q, target, format = 'text' } = req.body || {};
  if (!Array.isArray(q) || q.length === 0 || !target) {
    return res.status(400).json({
      error: 'Request must include a non-empty `q` array and a `target` language.',
    });
  }

  try {
    const googleRes = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, target, format }),
      }
    );

    const data = await googleRes.json().catch(() => ({}));
    if (!googleRes.ok) {
      const detail = data?.error?.message || '';
      console.error(`Translation upstream error (${googleRes.status}): ${detail}`);
      // Don't leak the upstream key/URL to the client; return a clean status.
      return res.status(googleRes.status === 400 ? 400 : 502).json({
        error: `Translation request failed (${googleRes.status}).`,
      });
    }

    // Pass through Google's native shape (see note above).
    return res.status(200).json(data);
  } catch (err) {
    console.error('Translation proxy error:', err.message);
    return res.status(502).json({ error: 'Translation request failed.' });
  }
}

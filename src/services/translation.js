// Client for the assessment page's translation feature.
//
// IMPORTANT: this file runs in the browser, so it must NOT hold the Google
// Translate API key. Instead it calls our own backend proxy (`/api/translate`
// in server-auth-test.js), which attaches the key server-side. The key lives in
// the server-only env var GOOGLE_TRANSLATE_API_KEY and is never shipped to the
// browser or visible in the Network tab.

// Where to reach our translate proxy.
//
// In dev, use a RELATIVE path so Vite's dev-server proxy (see vite.config.js:
// '/api' -> http://127.0.0.1:3001) forwards it to the local Express server that
// holds the key. In production, hit the deployed backend that serves the API.
// The key never appears here either way — the server attaches it.
const ENDPOINT = import.meta.env.DEV
  ? '/api/translate'
  : 'https://constrain-magnifier-circling.ngrok-free.dev/api/translate';

// Google's v2 endpoint accepts many strings per request; we chunk to keep each
// request comfortably within size limits.
const CHUNK_SIZE = 100;

// In-memory cache so re-selecting a language (or re-translating a string that
// appears more than once) never hits the network twice. Key: `${target}::${text}`.
const cache = new Map();

// The key now lives server-side, so the client can't (and shouldn't) check for
// it. We optimistically report configured; if the server has no key it returns
// 503 and callers fall back to English.
export const isTranslationConfigured = () => true;

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// Google may return HTML entities (e.g. &#39; for apostrophes) even with
// format:'text'. Decode them back to plain characters for display.
const decodeEntities = (str) => {
  if (typeof str !== 'string' || str.indexOf('&') === -1) return str;
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
};

/**
 * Translate an array of strings into `target`, preserving order.
 *
 * - Returns a new array the same length as `texts`.
 * - Empty / null entries pass through untouched (and keep their slot).
 * - Results are cached per (target, text) pair.
 * - If `target` is falsy or 'en', the input is returned as-is (we never
 *   translate back into English — English always uses the original text).
 *
 * Throws if a request fails, so callers can surface a friendly error and fall
 * back to English.
 */
export async function translateBatch(texts, target) {
  if (!Array.isArray(texts)) return [];
  if (!target || target === 'en') return texts.slice();

  const results = new Array(texts.length);
  const toFetch = []; // { index, text }

  texts.forEach((text, i) => {
    if (text === null || text === undefined || text === '') {
      results[i] = text;
      return;
    }
    const key = `${target}::${text}`;
    if (cache.has(key)) {
      results[i] = cache.get(key);
    } else {
      toFetch.push({ index: i, text });
    }
  });

  for (const batch of chunk(toFetch, CHUNK_SIZE)) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        q: batch.map((b) => b.text),
        target,
        format: 'text',
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Translation request failed (${res.status}). ${detail}`);
    }

    const data = await res.json();
    const translations = data?.translations || [];
    batch.forEach((b, j) => {
      const translated = decodeEntities(translations[j] ?? b.text);
      cache.set(`${target}::${b.text}`, translated);
      results[b.index] = translated;
    });
  }

  return results;
}

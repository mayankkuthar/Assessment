// Google Cloud Translation (v2 REST) client used by the assessment page.
//
// The API key is read from the Vite env var VITE_GOOGLE_TRANSLATE_API_KEY.
// Add it to your .env file:
//
//   VITE_GOOGLE_TRANSLATE_API_KEY=your_key_here
//
// (Vite only exposes env vars prefixed with VITE_ to the browser, and you must
// restart `npm run dev` after editing .env for the change to take effect.)

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';

// Google's v2 endpoint accepts many strings per request; we chunk to keep each
// request comfortably within size limits.
const CHUNK_SIZE = 100;

// In-memory cache so re-selecting a language (or re-translating a string that
// appears more than once) never hits the network twice. Key: `${target}::${text}`.
const cache = new Map();

export const isTranslationConfigured = () => Boolean(API_KEY);

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
 * Throws if the API key is missing or a request fails, so callers can surface
 * a friendly error and fall back to English.
 */
export async function translateBatch(texts, target) {
  if (!Array.isArray(texts)) return [];
  if (!target || target === 'en') return texts.slice();
  if (!API_KEY) {
    throw new Error(
      'Google Translate API key is not configured. Add VITE_GOOGLE_TRANSLATE_API_KEY to your .env file and restart the dev server.'
    );
  }

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
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const translations = data?.data?.translations || [];
    batch.forEach((b, j) => {
      const translated = decodeEntities(translations[j]?.translatedText ?? b.text);
      cache.set(`${target}::${b.text}`, translated);
      results[b.index] = translated;
    });
  }

  return results;
}

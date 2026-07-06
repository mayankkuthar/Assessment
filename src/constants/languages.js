// Languages offered in the assessment language selector.
//
// `code` must be a valid Google Cloud Translation target language code
// (https://cloud.google.com/translate/docs/languages). `label` is what the
// user sees in the dropdown — shown in the native script where useful.
//
// To add a language, just append a new { code, label } entry here. Nothing
// else needs to change; the selector and translation logic are fully driven
// by this list.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', label: 'অসমীয়া (Assamese)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'ne', label: 'नेपाली (Nepali)' },
  { code: 'si', label: 'සිංහල (Sinhala)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'it', label: 'Italiano (Italian)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'zh', label: '中文 (Chinese Simplified)' },
  { code: 'zh-TW', label: '繁體中文 (Chinese Traditional)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'fa', label: 'فارسی (Persian)' },
  { code: 'tr', label: 'Türkçe (Turkish)' },
  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { code: 'th', label: 'ไทย (Thai)' },
  { code: 'id', label: 'Bahasa Indonesia (Indonesian)' },
];

export const DEFAULT_LANGUAGE = 'en';

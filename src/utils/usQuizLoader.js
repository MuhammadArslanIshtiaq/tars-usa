import manifest from '../../assets/us/data/manifest.json';
import { usQuizMap } from './usQuizMap';

const SUPPORTED_CATEGORIES = ['car', 'motorcycle', 'cdl'];

// IMPORTANT:
// Expo/Metro cannot efficiently bundle tens of thousands of statically-required JSON modules.
// For now we only bundle a small offline subset and can add a download/on-demand strategy later.
export const BUNDLED_STATE_BY_CATEGORY = {
  car: ['Alabama'],
  motorcycle: [],
  cdl: [],
};

const FALLBACK_CATEGORY = 'car';
const FALLBACK_STATE = 'Alabama';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ur', name: 'Urdu' },
];

const normalize = (value) => (typeof value === 'string' ? value.trim() : '');

const shuffleArray = (arr) => {
  const list = Array.isArray(arr) ? [...arr] : [];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

const toBundledState = ({ category, state }) => {
  const cat = normalize(category);
  const st = normalize(state);

  const bundledStates = BUNDLED_STATE_BY_CATEGORY?.[cat];
  if (Array.isArray(bundledStates) && bundledStates.includes(st)) return { category: cat, state: st };

  // If requested category isn't bundled at all, fallback to our bundled sample set.
  return { category: FALLBACK_CATEGORY, state: FALLBACK_STATE };
};

export const getStatesForCategory = (category) => {
  const cat = normalize(category);
  if (!SUPPORTED_CATEGORIES.includes(cat)) return [];
  const bundled = BUNDLED_STATE_BY_CATEGORY?.[cat];
  if (Array.isArray(bundled) && bundled.length > 0) return [...bundled].sort((a, b) => a.localeCompare(b));

  // Fallback: show manifest states (may not be bundled yet)
  const states = Object.keys(manifest?.[cat] || {});
  return states.sort((a, b) => a.localeCompare(b));
};

export const getAllStatesForCategory = (category) => {
  const cat = normalize(category);
  if (!SUPPORTED_CATEGORIES.includes(cat)) return [];
  const states = Object.keys(manifest?.[cat] || {});
  return states.sort((a, b) => a.localeCompare(b));
};

export const getQuizListFor = ({ category, state }) => {
  // For now we always display the same quiz list for all states (sample set),
  // while still allowing the user to pick any of the 50 states.
  const { category: bundledCategory, state: bundledState } = toBundledState({ category, state });
  const list = manifest?.[bundledCategory]?.[bundledState];
  return Array.isArray(list) ? list : [];
};

const getModuleForPath = (relativePath) => usQuizMap[relativePath] || null;

export const loadUsQuizJson = ({ category, state, slug, language }) => {
  const { category: cat, state: st } = toBundledState({ category, state });
  const sl = normalize(slug);
  const lang = normalize(language) || 'en';

  if (!cat || !st || !sl) return null;

  if (lang !== 'en') {
    const translatedPath = `translations/${lang}/${cat}/${st}/${sl}.json`;
    const translatedModule = getModuleForPath(translatedPath);
    if (translatedModule) return translatedModule;
  }

  const englishPath = `${cat}/${st}/${sl}.json`;
  return getModuleForPath(englishPath);
};

const toMobileQuestions = (webQuestions) => {
  const questions = Array.isArray(webQuestions) ? webQuestions : [];

  return questions.map((q, idx) => {
    const options = Array.isArray(q?.options) ? q.options : [];
    const correctLetter = q?.correctAnswerLetter;

    const image = typeof q?.image === 'string' ? q.image.replace(/^\//, '') : null;

    return {
      id: idx + 1,
      question: q?.question || '',
      options: options
        .filter((opt) => opt && typeof opt.text === 'string' && typeof opt.letter === 'string')
        .map((opt) => ({
          text: opt.text,
          is_correct: opt.letter === correctLetter,
        })),
      ...(image ? { image: image } : {}),
      secondary_languages: {},
      explanation: q?.explanation || '',
    };
  });
};

export const loadMobileQuiz = ({ category, state, slug, language }) => {
  const quizJson = loadUsQuizJson({ category, state, slug, language });
  if (!quizJson) return null;

  const title = quizJson.quizName || quizJson.testName || slug;
  const questions = shuffleArray(toMobileQuestions(quizJson.questions)).map((q, idx) => ({
    ...q,
    id: idx + 1,
    options: shuffleArray(q.options),
  }));

  return {
    id: `${category}:${state}:${slug}:${language || 'en'}`,
    title,
    questions,
    meta: {
      category,
      state,
      slug,
      language: language || 'en',
      totalQuestions: quizJson.totalQuestions,
    },
  };
};


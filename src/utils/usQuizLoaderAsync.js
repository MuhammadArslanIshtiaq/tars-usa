import * as FileSystem from 'expo-file-system/legacy';
import { loadMobileQuiz } from './usQuizLoader';
import { getLocalTranslationFilePath } from './languagePacks';

const safeParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const shuffleArray = (arr) => {
  const list = Array.isArray(arr) ? [...arr] : [];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
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

const toMobileQuiz = ({ quizJson, category, state, slug, language }) => {
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

export const loadMobileQuizAsync = async ({ category, state, slug, language }) => {
  const lang = language || 'en';

  // Always try local filesystem first (covers:
  // - downloaded packs for non-bundled languages
  // - bundled en/es zips installed on first launch)
  const tryLoadLocal = async (cat, st) => {
    const localPath = getLocalTranslationFilePath({ language: lang, category: cat, state: st, slug });
    const info = await FileSystem.getInfoAsync(localPath);
    console.log('[i18n] lookup', { lang, cat, st, slug, exists: !!info?.exists, localPath });
    if (!info?.exists) return null;
    const text = await FileSystem.readAsStringAsync(localPath, { encoding: FileSystem.EncodingType.UTF8 });
    const quizJson = safeParseJson(text);
    if (!quizJson) return null;
    return toMobileQuiz({ quizJson, category, state, slug, language: lang });
  };

  const fromSelected = await tryLoadLocal(category, state);
  if (fromSelected) return fromSelected;

  // Fallback: if a pack is missing for the selected state/category (or install failed),
  // fall back to the bundled sample dataset so the quiz always opens.
  const fromFallback = await tryLoadLocal('car', 'Alabama');
  if (fromFallback) return fromFallback;

  // Final fallback: bundled sample JSON requires (small offline subset).
  return loadMobileQuiz({ category, state, slug, language: lang });
};


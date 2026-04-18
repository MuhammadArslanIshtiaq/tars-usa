/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const readJson = (absolutePath) => {
  const raw = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(raw);
};

const writeJson = (absolutePath, data) => {
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
};

const toMobileQuestions = (webQuiz) => {
  const questions = Array.isArray(webQuiz?.questions) ? webQuiz.questions : [];

  return questions.map((q, idx) => {
    const image = typeof q.image === 'string' ? q.image : null;
    const normalizedImagePath = image ? image.replace(/^\//, '') : undefined;

    const options = Array.isArray(q.options) ? q.options : [];
    const correctLetter = q.correctAnswerLetter;

    return {
      id: idx + 1,
      ...(normalizedImagePath ? { image_path: normalizedImagePath } : {}),
      question_en: q.question ?? '',
      options_en: options
        .filter((opt) => opt && typeof opt.text === 'string' && typeof opt.letter === 'string')
        .map((opt) => ({
          text: opt.text,
          is_correct: opt.letter === correctLetter,
        })),
      secondary_languages: {},
    };
  });
};

const generateSingle = ({ source, destination, key }) => {
  const sourceQuiz = readJson(source);
  const questions = toMobileQuestions(sourceQuiz);
  writeJson(destination, { [key]: questions });
  console.log(`✅ Wrote ${questions.length} questions → ${path.relative(process.cwd(), destination)}`);
};

const main = () => {
  const repoRoot = path.resolve(__dirname, '..');
  const webRoot = path.resolve(repoRoot, '..', 'tars-web-us');

  const state = 'Alabama';
  const category = 'car';
  const webCategoryRoot = path.join(webRoot, category, state);
  const outRoot = path.join(repoRoot, 'src', 'data', 'quiz');

  const jobs = [
    // Mock quiz (sign-heavy)
    {
      source: path.join(webCategoryRoot, 'signs-practice-test-1.json'),
      destination: path.join(outRoot, 'mock-quiz-01.json'),
      key: 'mockquiz-01',
    },

    // Sign quizzes
    {
      source: path.join(webCategoryRoot, 'signs-practice-test-2.json'),
      destination: path.join(outRoot, 'quiz-guide-signs.json'),
      key: 'guide-signs-quiz',
    },
    {
      source: path.join(webCategoryRoot, 'regulatory-signs.json'),
      destination: path.join(outRoot, 'quiz-regulatory-signs.json'),
      key: 'regulatory-quiz',
    },
    {
      source: path.join(webCategoryRoot, 'warning-signs.json'),
      destination: path.join(outRoot, 'quiz-warning-signs.json'),
      key: 'warning-quiz',
    },
    {
      source: path.join(webCategoryRoot, 'temporary-traffic-control-signs.json'),
      destination: path.join(outRoot, 'quiz-temporary-signs.json'),
      key: 'temporary-work-quiz',
    },
    // Repurpose road-marking slot to railroad crossings (US-relevant)
    {
      source: path.join(webCategoryRoot, 'railroad-crossing-signs.json'),
      destination: path.join(outRoot, 'quiz-road-marking.json'),
      key: 'road-marking-quiz',
    },

    // Theory quizzes
    {
      source: path.join(webCategoryRoot, 'easy-practice-test-1.json'),
      destination: path.join(outRoot, 'theory-quiz-1.json'),
      key: 'speed-and-distance-quiz',
    },
    {
      source: path.join(webCategoryRoot, 'easy-practice-test-2.json'),
      destination: path.join(outRoot, 'theory-quiz-2.json'),
      key: 'Fines, Points, & Violations Quiz',
    },
    {
      source: path.join(webCategoryRoot, 'intermediate-practice-test-1.json'),
      destination: path.join(outRoot, 'theory-quiz-3.json'),
      key: 'Fines, Points, & Violations Quiz 2 ',
    },
    {
      source: path.join(webCategoryRoot, 'hard-practice-test-1.json'),
      destination: path.join(outRoot, 'theory-quiz-4.json'),
      key: 'Rules, Safety, & Procedures Quiz ',
    },
  ];

  for (const job of jobs) {
    if (!fs.existsSync(job.source)) {
      console.error(`❌ Missing source file: ${job.source}`);
      process.exitCode = 1;
      continue;
    }
    generateSingle(job);
  }
};

main();


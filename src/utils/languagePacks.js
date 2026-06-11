import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import { DATASET_BASE_URL, DATASET_VERSION } from '../config/dataset';
import { Buffer } from 'buffer';

// Bump when changing install/extract logic to avoid stale "downloaded" flags.
const STORAGE_KEY = 'downloadedLanguagePacks:v3';

const normalize = (v) => (typeof v === 'string' ? v.trim() : '');

const getFflate = () => {
  // In Expo/RN, static ESM imports of some libs can behave differently.
  // NOTE: Metro does NOT allow dynamic require() (require(id)).
  // Keep all requires static string literals.
  // eslint-disable-next-line global-require, import/no-commonjs
  let mod = null;
  try {
    // eslint-disable-next-line global-require, import/no-commonjs
    mod = require('fflate');
  } catch {
    mod = null;
  }

  // eslint-disable-next-line global-require, import/no-commonjs
  let umd = null;
  try {
    // eslint-disable-next-line global-require, import/no-commonjs
    umd = require('fflate/umd/index.js');
  } catch {
    umd = null;
  }

  // eslint-disable-next-line global-require, import/no-commonjs
  let browserCjs = null;
  try {
    // eslint-disable-next-line global-require, import/no-commonjs
    browserCjs = require('fflate/lib/browser.cjs');
  } catch {
    browserCjs = null;
  }

  const resolved = mod?.default && Object.keys(mod.default).length ? mod.default : mod;
  if (resolved && Object.keys(resolved).length > 0) return resolved;
  if (umd && Object.keys(umd).length > 0) return umd;
  if (browserCjs && Object.keys(browserCjs).length > 0) return browserCjs;

  return resolved || umd || browserCjs;
};

const getFflateFn = (ff, name) => {
  const direct = ff?.[name];
  if (typeof direct === 'function') return direct;
  const fromDefault = ff?.default?.[name];
  if (typeof fromDefault === 'function') return fromDefault;
  return null;
};

export const isBundledLanguage = (language) => {
  const lang = normalize(language);
  return lang === 'en' || lang === 'es';
};

export const getLocalTranslationsRoot = () => `${FileSystem.documentDirectory}dmv-data/translations/`;

export const getLocalTranslationFilePath = ({ language, category, state, slug }) => {
  const lang = normalize(language);
  const cat = normalize(category);
  const st = normalize(state);
  const sl = normalize(slug);
  return `${getLocalTranslationsRoot()}${lang}/${cat}/${st}/${sl}.json`;
};

const ensureDir = async (dirPath) => {
  await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
};

const runInBatches = async (tasks, batchSize = 25) => {
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(batch.map((task) => task()));
  }
};

const getRegistry = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const setRegistry = async (next) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

const getPackId = ({ language }) => normalize(language);

export const isLanguagePackDownloaded = async ({ language }) => {
  const lang = normalize(language);
  if (!lang || isBundledLanguage(lang)) return true;

  const registry = await getRegistry();
  const packId = getPackId({ language: lang });
  return registry?.[packId] === true;
};

export const getDownloadedLanguageCodes = async () => {
  const registry = await getRegistry();
  return Object.keys(registry || {}).filter((code) => registry?.[code] === true);
};

export const getLanguagePackUrl = ({ language }) => {
  const lang = normalize(language);
  // Expected R2 layout:
  //   {BASE}/packs/{VERSION}/translations/{lang}.zip
  return `${DATASET_BASE_URL}/packs/${DATASET_VERSION}/translations/${lang}.zip`;
};

export const downloadAndInstallLanguagePack = async (
  { language },
  { onProgress } = {}
) => {
  const lang = normalize(language);

  if (!lang) throw new Error('Missing language');
  if (isBundledLanguage(lang)) return { installed: true, skipped: true };
  if (DATASET_BASE_URL.includes('YOUR_R2_PUBLIC_BASE_URL')) throw new Error('DATASET_BASE_URL not configured');

  const url = getLanguagePackUrl({ language: lang });

  const tmpZipPath = `${FileSystem.cacheDirectory}packs/${lang}.zip`;
  await ensureDir(`${FileSystem.cacheDirectory}packs/`);

  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    tmpZipPath,
    {},
    (progress) => {
      const total = progress?.totalBytesExpectedToWrite || 0;
      const written = progress?.totalBytesWritten || 0;
      if (!onProgress || !total) return;
      onProgress(Math.min(1, written / total));
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) throw new Error('Download failed');

  return await installLanguagePackFromZipUri({ language: lang, zipUri: result.uri });
};

const getZipBytesFromUri = async (zipUri) => {
  // Read zip and unzip in JS (Expo Go compatible).
  const zipBase64 = await FileSystem.readAsStringAsync(zipUri, { encoding: FileSystem.EncodingType.Base64 });
  // atob isn't available in all RN runtimes; use Buffer fallback.
  // eslint-disable-next-line no-undef
  return typeof atob === 'function'
    ? Uint8Array.from(atob(zipBase64), (c) => c.charCodeAt(0))
    : Uint8Array.from(Buffer.from(zipBase64, 'base64'));
};

const installLanguagePackEntries = async ({ language, entries, strFromU8Fn }) => {
  const lang = normalize(language);
  const root = getLocalTranslationsRoot();
  await ensureDir(root);

  const writes = [];
  let writtenJsonCount = 0;
  for (const [filename, contentBytes] of Object.entries(entries)) {
    // Only write JSON files.
    if (!filename.toLowerCase().endsWith('.json')) continue;

    // Normalize path separators.
    const clean = filename.replace(/\\/g, '/').replace(/^\/+/, '');
    let normalized = null;

    // Preferred layout:
    //   translations/<lang>/<category>/<State>/<slug>.json
    const idx = clean.indexOf('translations/');
    if (idx !== -1) {
      normalized = clean.slice(idx);
    } else if (clean.startsWith(`${lang}/`)) {
      // Supported alternate layout:
      //   <lang>/<category>/<State>/<slug>.json
      normalized = `translations/${clean}`;
    } else {
      continue;
    }

    const target = `${FileSystem.documentDirectory}dmv-data/${normalized}`;
    const targetDir = target.split('/').slice(0, -1).join('/') + '/';

    writes.push(
      (async () => {
        await ensureDir(targetDir);
        const text = strFromU8Fn(contentBytes);
        await FileSystem.writeAsStringAsync(target, text, { encoding: FileSystem.EncodingType.UTF8 });
        writtenJsonCount += 1;
      })()
    );
  }

  const writeBatchSize = Platform.OS === 'android' ? 20 : 50;
  await runInBatches(writes, writeBatchSize);

  if (writtenJsonCount === 0) {
    throw new Error(
      'Zip extracted 0 translation JSON files. Ensure the zip contains translations/<lang>/<category>/<State>/*.json'
    );
  }

  const registry = await getRegistry();
  registry[getPackId({ language: lang })] = true;
  await setRegistry(registry);

  return { installed: true, files: writtenJsonCount };
};

export const installLanguagePackFromZipUri = async ({ language, zipUri }) => {
  const lang = normalize(language);
  if (!lang) throw new Error('Missing language');
  if (!zipUri) throw new Error('Missing zipUri');

  const fflate = getFflate();
  const unzipSyncFn = getFflateFn(fflate, 'unzipSync');
  const strFromU8Fn = getFflateFn(fflate, 'strFromU8');

  if (!unzipSyncFn || !strFromU8Fn) {
    const keys = Object.keys(fflate || {});
    const defaultKeys = Object.keys(fflate?.default || {});
    throw new Error(
      `Zip support not available (fflate). keys=${keys.join(',')} defaultKeys=${defaultKeys.join(',')}`
    );
  }

  const zipBytes = await getZipBytesFromUri(zipUri);
  const entries = unzipSyncFn(zipBytes);
  return await installLanguagePackEntries({ language: lang, entries, strFromU8Fn });
};

export const ensureBundledLanguagePacksInstalled = async () => {
  // These zips are bundled in the app to avoid a first-run download for en/es.
  // If anything fails, we fall back to the built-in sample quiz set (app still works).
  const bundled = [
    // eslint-disable-next-line global-require
    { code: 'en', assetModule: require('../../assets/en.zip') },
    // eslint-disable-next-line global-require
    { code: 'es', assetModule: require('../../assets/es.zip') },
  ];

  const results = {};
  for (const { code, assetModule } of bundled) {
    const lang = normalize(code);
    try {
      const dirInfo = await FileSystem.getInfoAsync(`${getLocalTranslationsRoot()}${lang}/`);
      if (dirInfo?.exists) {
        results[lang] = { ok: true, alreadyInstalled: true };
        continue;
      }

      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      if (!uri) throw new Error('Missing asset uri');

      await installLanguagePackFromZipUri({ language: lang, zipUri: uri });
      results[lang] = { ok: true, installed: true };
    } catch (e) {
      console.warn(`Bundled ${lang} pack install failed:`, e?.message || e);
      results[lang] = { ok: false, error: e?.message || String(e) };
    }
  }

  return results;
};


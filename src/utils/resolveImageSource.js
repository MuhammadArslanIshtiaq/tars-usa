import { usImageMap } from './usImageMap';

const normalizeImageKey = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value.replace(/^\//, '');
};

export const resolveImageSource = (imagePath) => {
  const normalized = normalizeImageKey(imagePath);
  if (!normalized) return null;

  const filename = normalized.split('/').pop();
  if (!filename) return null;

  return (
    usImageMap[normalized] ||
    usImageMap[filename] ||
    null
  );
};


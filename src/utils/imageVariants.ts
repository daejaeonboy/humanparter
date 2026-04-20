export type UploadedImageVariant = 'base' | 'card' | 'popup';

export const IMAGE_VARIANT_MARKER = '__hpimg__';

const IMAGE_VARIANTS: UploadedImageVariant[] = ['base', 'card', 'popup'];
const IMAGE_VARIANT_REGEX = new RegExp(`${IMAGE_VARIANT_MARKER}(base|card|popup)(?=\\.[^.]+$)`);

const normalizeExtension = (extension: string) => extension.trim().replace(/^\./, '').toLowerCase() || 'png';

export const createImageAssetId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const buildVariantFilePath = (params: {
  folder: string;
  assetId: string;
  extension: string;
  variant?: UploadedImageVariant;
}) => {
  const { folder, assetId, extension, variant = 'base' } = params;
  return `${folder}/${assetId}${IMAGE_VARIANT_MARKER}${variant}.${normalizeExtension(extension)}`;
};

export const hasImageVariantMarker = (value: string) => IMAGE_VARIANT_REGEX.test(value);

const replaceImageVariantValue = (value: string, variant: UploadedImageVariant) =>
  value.replace(IMAGE_VARIANT_REGEX, `${IMAGE_VARIANT_MARKER}${variant}`);

export const getImageVariantUrl = (imageUrl: string, variant: UploadedImageVariant) => {
  if (!hasImageVariantMarker(imageUrl)) return null;

  try {
    const url = new URL(imageUrl);
    url.pathname = replaceImageVariantValue(url.pathname, variant);
    return url.toString();
  } catch {
    return replaceImageVariantValue(imageUrl, variant);
  }
};

export const getImageVariantPaths = (path: string) => {
  if (!hasImageVariantMarker(path)) {
    return [path];
  }

  return Array.from(new Set(IMAGE_VARIANTS.map((variant) => replaceImageVariantValue(path, variant))));
};

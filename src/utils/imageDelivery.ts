import { getImageVariantUrl } from './imageVariants';

export type DeliveryImageKind = 'hero' | 'detail' | 'card' | 'thumbnail' | 'popup' | 'inline';

type ResponsiveImageSource = {
  src: string;
  srcSet?: string;
  sizes: string;
};

const DEFAULT_IMAGE_SIZES: Record<DeliveryImageKind, string> = {
  hero: '100vw',
  detail: '(min-width: 1024px) 60vw, 100vw',
  card: '(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw',
  thumbnail: '96px',
  popup: '(min-width: 640px) 400px, 90vw',
  inline: '(min-width: 1024px) 900px, 100vw',
};

const UNSPLASH_WIDTHS: Record<DeliveryImageKind, number[]> = {
  hero: [640, 960, 1280, 1600, 1920],
  detail: [640, 960, 1280, 1600],
  card: [320, 480, 640, 960],
  thumbnail: [96, 192, 320],
  popup: [400, 600, 800],
  inline: [480, 768, 1200, 1600],
};

const UNSPLASH_QUALITY: Record<DeliveryImageKind, number> = {
  hero: 82,
  detail: 80,
  card: 76,
  thumbnail: 72,
  popup: 78,
  inline: 80,
};

const VARIANT_WIDTHS = {
  card: 960,
  popup: 800,
} as const;

const isUnsplashUrl = (value: string) => {
  try {
    return new URL(value).hostname.endsWith('images.unsplash.com');
  } catch {
    return false;
  }
};

const buildUnsplashUrl = (imageUrl: string, width: number, quality: number) => {
  const url = new URL(imageUrl);
  url.searchParams.set('auto', 'format,compress');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality));
  return url.toString();
};

export const getResponsiveImageSources = (
  imageUrl: string,
  kind: DeliveryImageKind,
  customSizes?: string,
): ResponsiveImageSource => {
  const sizes = customSizes || DEFAULT_IMAGE_SIZES[kind];

  const variantName =
    kind === 'card' || kind === 'thumbnail'
      ? 'card'
      : kind === 'popup'
        ? 'popup'
        : null;

  if (variantName) {
    const variantUrl = getImageVariantUrl(imageUrl, variantName);

    if (variantUrl) {
      const variantWidth = VARIANT_WIDTHS[variantName];
      return {
        src: variantUrl,
        srcSet: `${variantUrl} ${variantWidth}w, ${imageUrl} 1600w`,
        sizes,
      };
    }
  }

  if (isUnsplashUrl(imageUrl)) {
    const widths = UNSPLASH_WIDTHS[kind];
    const quality = UNSPLASH_QUALITY[kind];
    const srcSet = widths.map((width) => `${buildUnsplashUrl(imageUrl, width, quality)} ${width}w`).join(', ');
    const defaultWidth = widths[Math.min(2, widths.length - 1)];

    return {
      src: buildUnsplashUrl(imageUrl, defaultWidth, quality),
      srcSet,
      sizes,
    };
  }

  return {
    src: imageUrl,
    sizes,
  };
};

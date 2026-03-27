export const SITE_NAME = '휴먼파트너';
export const SITE_URL = 'https://humanpartner.kr';
export const DEFAULT_SOCIAL_IMAGE = '/logocard.jpg';
export const DEFAULT_LOCALE = 'ko_KR';

type RobotsOptions = {
  noindex?: boolean;
  nofollow?: boolean;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const toAbsoluteUrl = (path?: string): string => {
  if (!path) return SITE_URL;
  if (ABSOLUTE_URL_PATTERN.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
};

export const normalizeMetaText = (value?: string, maxLength = 160): string | undefined => {
  if (!value) return undefined;

  const normalized = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return undefined;
  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
};

export const buildRobotsContent = ({ noindex = false, nofollow = false }: RobotsOptions = {}): string => {
  const indexDirective = noindex ? 'noindex' : 'index';
  const followDirective = nofollow ? 'nofollow' : 'follow';

  return `${indexDirective},${followDirective},max-image-preview:large,max-snippet:-1,max-video-preview:-1`;
};

export const buildBreadcrumbStructuredData = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path),
  })),
});

export const buildOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: toAbsoluteUrl('/logo.png'),
  image: toAbsoluteUrl(DEFAULT_SOCIAL_IMAGE),
});

export const buildWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
});

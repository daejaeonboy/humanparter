export const SITE_NAME = '휴먼파트너';
export const SITE_URL = 'https://humanpartner.kr';
export const DEFAULT_SOCIAL_IMAGE = '/logocard.jpg';
export const DEFAULT_LOCALE = 'ko_KR';
export const BUSINESS_PHONE = '1800-1985';
export const BUSINESS_EMAIL = 'hm_solution@naver.com';
export const BUSINESS_REGISTRATION_NUMBER = '305-30-85537';
export const BUSINESS_ADDRESS = '대전광역시 대덕구 대화로106번길 66 펜타플렉스 705호';
export const BUSINESS_CITY = '대전';
export const BUSINESS_REGION = '대전광역시';
export const BUSINESS_POSTAL_CODE = '34365';

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
  alternateName: ['HUMAN PARTNER', '휴먼파트너 렌탈'],
  url: SITE_URL,
  logo: toAbsoluteUrl('/logo.png'),
  image: toAbsoluteUrl(DEFAULT_SOCIAL_IMAGE),
  email: BUSINESS_EMAIL,
  telephone: BUSINESS_PHONE,
  taxID: BUSINESS_REGISTRATION_NUMBER,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: BUSINESS_PHONE,
      email: BUSINESS_EMAIL,
      areaServed: 'KR',
      availableLanguage: ['ko', 'en'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: BUSINESS_PHONE,
      email: BUSINESS_EMAIL,
      areaServed: 'KR',
      availableLanguage: ['ko', 'en'],
    },
  ],
});

export const buildWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const buildLocalBusinessStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  alternateName: ['HUMAN PARTNER', '휴먼파트너 렌탈'],
  url: SITE_URL,
  logo: toAbsoluteUrl('/logo.png'),
  image: toAbsoluteUrl(DEFAULT_SOCIAL_IMAGE),
  email: BUSINESS_EMAIL,
  telephone: BUSINESS_PHONE,
  taxID: BUSINESS_REGISTRATION_NUMBER,
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS_ADDRESS,
    addressLocality: BUSINESS_CITY,
    addressRegion: BUSINESS_REGION,
    postalCode: BUSINESS_POSTAL_CODE,
    addressCountry: 'KR',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  areaServed: [
    {
      '@type': 'Country',
      name: 'South Korea',
    },
  ],
  priceRange: '$$',
});

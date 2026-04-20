import { getAllNavMenuItems, getHeroBanners, getInstallationCases, getPopups, type Banner, type InstallationCase, type NavMenuItem, type Popup, getAllInstallationCases } from './cmsApi';
import { getCompanyPageContent } from './companyContentApi';
import { getFAQs, getFAQCategories, type FAQ, type FAQCategory } from './faqApi';
import { getInstallationCaseCategories } from './installationCaseCategoryApi';
import { getPublicNoticePostById, getPublicNoticePosts, type NoticePost } from './noticeApi';
import { getProductById, getProducts, type Product } from './productApi';
import { getPublicVisualsContent } from './publicVisualsApi';
import { primeCachedResource, getCachedResource, invalidateAllCachedResources } from '../lib/requestCache';
import { normalizeCompanyPageContent, type CompanyPageContent } from '../content/companyPageContent';
import { normalizePublicVisualsContent, type PublicVisualsContent } from '../content/publicVisualsContent';

const PUBLIC_DATA_TTL_MS = 10 * 60 * 1000;
const HOME_PUBLIC_DATA_TTL_MS = 60 * 1000;
const PUBLIC_API_BASE = '/api/public';
const PUBLIC_DATA_INVALIDATED_EVENT = 'hp:public-data-invalidated';
const PUBLIC_DATA_INVALIDATED_STORAGE_KEY = 'hp:public-data-invalidated-at';

const PUBLIC_CACHE_KEYS = {
  bootstrap: 'public:bootstrap',
  home: 'public:home',
  products: 'public:products',
  product: (id: string) => `public:product:${id}`,
  cases: 'public:cases',
  case: (id: string) => `public:case:${id}`,
  notices: 'public:notices',
  notice: (id: string) => `public:notice:${id}`,
  support: 'public:support',
  company: 'public:company',
} as const;

export interface PublicNoticeSummary {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublicCaseSummary {
  id: string;
  title: string;
  category?: string;
  subtitle?: string;
  image_url: string;
  link: string;
  content?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface PublicBootstrapData {
  generatedAt?: string;
  navItems: NavMenuItem[];
  installationCaseCategories: string[];
  publicVisuals: PublicVisualsContent;
}

export interface PublicHomeData {
  generatedAt?: string;
  heroBanners: Banner[];
  installationCases: PublicCaseSummary[];
  noticeSummaries: PublicNoticeSummary[];
  popups: Popup[];
  companyIntroImageUrl: string;
}

export interface PublicProductsData {
  generatedAt?: string;
  products: Product[];
  navItems: NavMenuItem[];
}

export interface PublicProductDetailPayload {
  generatedAt?: string;
  product: Product | null;
  relatedProducts: Product[];
}

export interface PublicCasesData {
  generatedAt?: string;
  categories: string[];
  cases: PublicCaseSummary[];
}

export interface PublicCaseDetailPayload {
  generatedAt?: string;
  post: InstallationCase | null;
  previousCase: PublicCaseSummary | null;
  nextCase: PublicCaseSummary | null;
}

export interface PublicNoticesData {
  generatedAt?: string;
  posts: PublicNoticeSummary[];
}

export interface PublicNoticeDetailPayload {
  generatedAt?: string;
  post: NoticePost | null;
  previousNotice: PublicNoticeSummary | null;
  nextNotice: PublicNoticeSummary | null;
}

export interface PublicSupportData {
  generatedAt?: string;
  faqs: FAQ[];
  categories: FAQCategory[];
}

export interface PublicCompanyData {
  generatedAt?: string;
  content: CompanyPageContent;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const noticeToSummary = (item: NoticePost): PublicNoticeSummary => ({
  id: item.id,
  title: item.title,
  excerpt: item.excerpt,
  imageUrl: item.imageUrl,
  publishedAt: item.publishedAt,
  category: item.category,
  displayOrder: item.displayOrder,
  isActive: item.isActive,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const caseToSummary = (item: InstallationCase): PublicCaseSummary => ({
  id: item.id || '',
  title: item.title,
  category: item.category,
  subtitle: item.subtitle,
  image_url: item.image_url,
  link: item.link,
  content: item.content,
  display_order: item.display_order,
  is_active: item.is_active,
  created_at: item.created_at,
});

const sortCasesByDisplayOrder = (items: InstallationCase[]) =>
  [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreatedAt - aCreatedAt;
  });

const sortProductSummaries = (items: Product[]) =>
  [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreatedAt - aCreatedAt;
  });

const fetchPublicEndpoint = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${PUBLIC_API_BASE}${path}`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${path}: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<T>;
};

const getCachedPublicResource = <T>(
  key: string,
  path: string,
  fallbackFetcher: () => Promise<T>,
) =>
  getCachedResource<T>({
    key,
    ttlMs: PUBLIC_DATA_TTL_MS,
    fetcher: async () => {
      try {
        return await fetchPublicEndpoint<T>(path);
      } catch (error) {
        console.warn(`Falling back to direct data loader for ${path}:`, error);
        return fallbackFetcher();
      }
    },
  });

export const primePublicBootstrapData = (data: PublicBootstrapData) => {
  primeCachedResource(
    PUBLIC_CACHE_KEYS.bootstrap,
    {
      ...data,
      publicVisuals: normalizePublicVisualsContent((data as Partial<PublicBootstrapData>).publicVisuals),
    },
    PUBLIC_DATA_TTL_MS,
  );
};

export const primePublicHomeData = (data: PublicHomeData) => {
  primeCachedResource(
    PUBLIC_CACHE_KEYS.home,
    {
      ...data,
      companyIntroImageUrl: typeof data.companyIntroImageUrl === 'string' ? data.companyIntroImageUrl : '',
    },
    HOME_PUBLIC_DATA_TTL_MS,
    false,
  );
};

export const primePublicProductsData = (data: PublicProductsData) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.products, data, PUBLIC_DATA_TTL_MS);
};

export const primePublicProductDetailData = (id: string, data: PublicProductDetailPayload) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.product(id), data, PUBLIC_DATA_TTL_MS);
};

export const primePublicCasesData = (data: PublicCasesData) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.cases, data, PUBLIC_DATA_TTL_MS);
};

export const primePublicCaseDetailData = (id: string, data: PublicCaseDetailPayload) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.case(id), data, PUBLIC_DATA_TTL_MS);
};

export const primePublicNoticesData = (data: PublicNoticesData) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.notices, data, PUBLIC_DATA_TTL_MS);
};

export const primePublicNoticeDetailData = (id: string, data: PublicNoticeDetailPayload) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.notice(id), data, PUBLIC_DATA_TTL_MS);
};

export const primePublicSupportData = (data: PublicSupportData) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.support, data, PUBLIC_DATA_TTL_MS);
};

export const primePublicCompanyData = (data: PublicCompanyData) => {
  primeCachedResource(PUBLIC_CACHE_KEYS.company, data, PUBLIC_DATA_TTL_MS);
};

export const getPublicBootstrapData = () =>
  getCachedResource<PublicBootstrapData>({
    key: PUBLIC_CACHE_KEYS.bootstrap,
    ttlMs: PUBLIC_DATA_TTL_MS,
    fetcher: async () => {
      try {
        const data = await fetchPublicEndpoint<{ generatedAt?: string; navItems?: NavMenuItem[]; publicVisuals?: unknown }>('/bootstrap');
        return {
          generatedAt: data.generatedAt,
          navItems: Array.isArray(data.navItems) ? data.navItems : [],
          installationCaseCategories: Array.isArray((data as Partial<PublicBootstrapData>).installationCaseCategories)
            ? (data as Partial<PublicBootstrapData>).installationCaseCategories as string[]
            : [],
          publicVisuals: normalizePublicVisualsContent(data.publicVisuals),
        };
      } catch (error) {
        console.warn('Falling back to direct data loader for /bootstrap:', error);
        const [navItems, installationCaseCategories, publicVisuals] = await Promise.all([
          getAllNavMenuItems(),
          getInstallationCaseCategories(),
          getPublicVisualsContent(),
        ]);
        return {
          generatedAt: new Date().toISOString(),
          navItems,
          installationCaseCategories,
          publicVisuals,
        };
      }
    },
  });

export const getPublicHomeData = () =>
  getCachedResource<PublicHomeData>({
    key: PUBLIC_CACHE_KEYS.home,
    ttlMs: HOME_PUBLIC_DATA_TTL_MS,
    staleWhileRevalidate: false,
    persistToSession: false,
    fetcher: async () => {
      try {
        const data = await fetchPublicEndpoint<Partial<PublicHomeData>>('/home');
        return {
          generatedAt: data.generatedAt,
          heroBanners: Array.isArray(data.heroBanners) ? data.heroBanners : [],
          installationCases: Array.isArray(data.installationCases) ? data.installationCases : [],
          noticeSummaries: Array.isArray(data.noticeSummaries) ? data.noticeSummaries : [],
          popups: Array.isArray(data.popups) ? data.popups : [],
          companyIntroImageUrl: typeof data.companyIntroImageUrl === 'string' ? data.companyIntroImageUrl : '',
        };
      } catch (error) {
        console.warn('Falling back to direct data loader for /home:', error);
        const [heroBanners, installationCases, noticePosts, popups, companyContent] = await Promise.all([
          getHeroBanners(),
          getInstallationCases(),
          getPublicNoticePosts(),
          getPopups(),
          getCompanyPageContent(),
        ]);

        return {
          generatedAt: new Date().toISOString(),
          heroBanners,
          installationCases: installationCases.slice(0, 3).map(caseToSummary),
          noticeSummaries: noticePosts.slice(0, 3).map(noticeToSummary),
          popups,
          companyIntroImageUrl: companyContent.overview.imageUrl,
        };
      }
    },
  });

export const getPublicProductsData = () =>
  getCachedPublicResource<PublicProductsData>(PUBLIC_CACHE_KEYS.products, '/products', async () => {
    const [products, navItems] = await Promise.all([getProducts(), getAllNavMenuItems()]);
    return {
      generatedAt: new Date().toISOString(),
      products: sortProductSummaries(products),
      navItems,
    };
  });

export const getPublicProductDetailData = (id: string) =>
  getCachedPublicResource<PublicProductDetailPayload>(PUBLIC_CACHE_KEYS.product(id), `/products/${id}`, async () => {
    const [product, products] = await Promise.all([getProductById(id), getProducts()]);
    const relatedProducts = product
      ? sortProductSummaries(
          products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4),
        )
      : [];

    return {
      generatedAt: new Date().toISOString(),
      product,
      relatedProducts,
    };
  });

export const getPublicCasesData = () =>
  getCachedPublicResource<PublicCasesData>(PUBLIC_CACHE_KEYS.cases, '/cases', async () => {
    const [cases, categories] = await Promise.all([
      getInstallationCases(),
      getInstallationCaseCategories(),
    ]);
    return {
      generatedAt: new Date().toISOString(),
      categories,
      cases: sortCasesByDisplayOrder(cases).map(caseToSummary),
    };
  });

export const getPublicCaseDetailData = (id: string) =>
  getCachedPublicResource<PublicCaseDetailPayload>(PUBLIC_CACHE_KEYS.case(id), `/cases/${id}`, async () => {
    const cases = sortCasesByDisplayOrder(await getAllInstallationCases());
    const activeCases = cases.filter((item) => item.is_active);
    const currentIndex = activeCases.findIndex((item) => item.id === id);
    const post = currentIndex >= 0 ? activeCases[currentIndex] : null;

    return {
      generatedAt: new Date().toISOString(),
      post,
      previousCase: currentIndex > 0 ? caseToSummary(activeCases[currentIndex - 1]) : null,
      nextCase:
        currentIndex >= 0 && currentIndex < activeCases.length - 1
          ? caseToSummary(activeCases[currentIndex + 1])
          : null,
    };
  });

export const getPublicNoticesData = () =>
  getCachedPublicResource<PublicNoticesData>(PUBLIC_CACHE_KEYS.notices, '/notices', async () => {
    const posts = await getPublicNoticePosts();
    return {
      generatedAt: new Date().toISOString(),
      posts: posts.map(noticeToSummary),
    };
  });

export const getPublicNoticeDetailData = (id: string) =>
  getCachedPublicResource<PublicNoticeDetailPayload>(PUBLIC_CACHE_KEYS.notice(id), `/notices/${id}`, async () => {
    const [post, posts] = await Promise.all([getPublicNoticePostById(id), getPublicNoticePosts()]);
    const summaries = posts.map(noticeToSummary);
    const currentIndex = summaries.findIndex((item) => item.id === id);

    return {
      generatedAt: new Date().toISOString(),
      post,
      previousNotice: currentIndex > 0 ? summaries[currentIndex - 1] : null,
      nextNotice:
        currentIndex >= 0 && currentIndex < summaries.length - 1
          ? summaries[currentIndex + 1]
          : null,
    };
  });

export const getPublicSupportData = () =>
  getCachedPublicResource<PublicSupportData>(PUBLIC_CACHE_KEYS.support, '/support', async () => {
    const [faqs, categories] = await Promise.all([getFAQs(), getFAQCategories()]);
    return {
      generatedAt: new Date().toISOString(),
      faqs,
      categories,
    };
  });

export const getPublicCompanyData = () =>
  getCachedResource<PublicCompanyData>({
    key: PUBLIC_CACHE_KEYS.company,
    ttlMs: PUBLIC_DATA_TTL_MS,
    fetcher: async () => {
      try {
        const data = await fetchPublicEndpoint<{ generatedAt?: string; content?: unknown }>('/company');
        return {
          generatedAt: data.generatedAt,
          content: normalizeCompanyPageContent(data.content),
        };
      } catch (error) {
        console.warn('Falling back to direct data loader for /company:', error);
        return {
          generatedAt: new Date().toISOString(),
          content: await getCompanyPageContent(),
        };
      }
    },
  });

export const invalidatePublicDataCache = () => {
  invalidateAllCachedResources();

  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(PUBLIC_DATA_INVALIDATED_EVENT));

  try {
    window.localStorage.setItem(PUBLIC_DATA_INVALIDATED_STORAGE_KEY, String(Date.now()));
  } catch {
    // Ignore storage availability failures.
  }
};

export const subscribePublicDataInvalidation = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleInvalidated = () => {
    listener();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === PUBLIC_DATA_INVALIDATED_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener(PUBLIC_DATA_INVALIDATED_EVENT, handleInvalidated);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(PUBLIC_DATA_INVALIDATED_EVENT, handleInvalidated);
    window.removeEventListener('storage', handleStorage);
  };
};

export const hasPublicBootstrapData = (value: unknown): value is PublicBootstrapData =>
  isObject(value) && Array.isArray(value.navItems) && Array.isArray(value.installationCaseCategories);

export const hasPublicHomeData = (value: unknown): value is PublicHomeData =>
  isObject(value) &&
  Array.isArray(value.heroBanners) &&
  Array.isArray(value.installationCases) &&
  Array.isArray(value.noticeSummaries) &&
  Array.isArray(value.popups) &&
  typeof value.companyIntroImageUrl === 'string';

export const hasPublicProductsData = (value: unknown): value is PublicProductsData =>
  isObject(value) && Array.isArray(value.products) && Array.isArray(value.navItems);

export const hasPublicCasesData = (value: unknown): value is PublicCasesData =>
  isObject(value) && Array.isArray(value.categories) && Array.isArray(value.cases);

export const hasPublicNoticesData = (value: unknown): value is PublicNoticesData =>
  isObject(value) && Array.isArray(value.posts);

export const hasPublicSupportData = (value: unknown): value is PublicSupportData =>
  isObject(value) && Array.isArray(value.faqs) && Array.isArray(value.categories);

export const hasPublicCompanyData = (value: unknown): value is PublicCompanyData =>
  isObject(value) && isObject(value.content);

export const hasPublicProductDetailData = (value: unknown): value is PublicProductDetailPayload =>
  isObject(value) && 'product' in value && Array.isArray(value.relatedProducts);

export const hasPublicCaseDetailData = (value: unknown): value is PublicCaseDetailPayload =>
  isObject(value) && 'post' in value && 'previousCase' in value && 'nextCase' in value;

export const hasPublicNoticeDetailData = (value: unknown): value is PublicNoticeDetailPayload =>
  isObject(value) && 'post' in value && 'previousNotice' in value && 'nextNotice' in value;

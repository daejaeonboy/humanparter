import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const serverBundlePath = path.join(projectRoot, '.prerender', 'entry-server.js');
const templatePath = path.join(distDir, 'index.html');

const SITE_URL = 'https://humanpartner.kr';
const SUPABASE_URL = 'https://mnxsvjrqrayhbcmhwddz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv';
const SUPABASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

const NAV_ITEM_SELECT = 'id,name,link,category,image_url,description,display_order,is_active,created_at';
const LEGACY_NAV_ITEM_SELECT = 'id,name,link,category,display_order,is_active,created_at';
const HERO_BANNER_SELECT =
  'id,title,subtitle,image_url,link,button_text,brand_text,banner_type,tab_id,display_order,is_active,created_at,target_product_code';
const POPUP_SELECT =
  'id,title,image_url,link,start_date,end_date,display_order,is_active,created_at,target_product_code';
const PRODUCT_DETAIL_SELECT =
  'id,name,category,_parent_category,display_order,external_link_url,price,description,short_description,image_url,stock,discount_rate,rating,review_count,created_at,product_type,basic_components,additional_components,cooperative_components,place_components,food_components';
const CASE_DETAIL_SELECT = 'id,title,subtitle,image_url,link,content,display_order,is_active,created_at';
const NOTICE_DETAIL_SELECT =
  'id,title,excerpt,image_url,published_at,category,content_html,display_order,is_active,created_at,updated_at';
const FAQ_SELECT = 'id,category,question,answer,display_order,created_at,updated_at';
const FAQ_CATEGORY_SELECT = 'id,name,display_order,created_at';
const DEFAULT_COMPANY_INTRO_IMAGE_URL = '/company/abouthuman.png';
const DEFAULT_PUBLIC_VISUALS_CONTENT = {
  productDefaults: {
    all: {
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      description: '휴먼파트너의 전체 렌탈 품목을 한눈에 확인해보세요.',
    },
  },
  collectionHeroes: {
    cs: {
      faq: {
        title: 'FAQ',
        description: '자주 묻는 질문과 상담 채널을 한 번에 확인하고 필요한 안내를 빠르게 찾아보세요.',
        imageUrl:
          'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80',
      },
      asGuide: {
        title: 'A/S 안내',
        description: '접수 방법부터 처리 절차, 방문 지원 범위까지 운영 중 필요한 유지관리 안내를 확인해보세요.',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
      },
    },
    notice: {
      all: {
        title: '정보센터',
        description: '휴먼파트너의 운영 소식, 상담 안내, 설치 및 렌탈 관련 주요 업데이트를 확인해보세요.',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
      },
      news: {
        title: '공지사항',
        description: '운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 한 번에 확인할 수 있습니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
      },
      resources: {
        title: '자료실',
        description: '설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 빠르게 찾아볼 수 있습니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
      },
    },
    cases: {
      all: {
        title: '설치 사례',
        description: '기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요.',
        imageUrl:
          'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80',
      },
      temporaryOffice: {
        title: '임시사무실',
        description: '단기 프로젝트와 임시 업무공간에 맞춘 렌탈 구성 사례를 빠르게 비교해보세요.',
        imageUrl:
          'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80',
      },
      publicInstitution: {
        title: '공공기관',
        description: '공공기관과 교육 현장 중심의 설치 사례를 통해 실제 운영 구성을 확인할 수 있습니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
      },
    },
  },
  megaMenu: {
    company: {
      '/company': {
        imageUrl: '/company/abouthuman.png',
        description: '휴먼파트너의 운영 경험과 B2B 렌탈 파트너로서의 강점을 확인해보세요.',
      },
      '/company/business': {
        imageUrl: '/company/service-01.jpg',
        description: '사무가구, IT 장비, 현장 운영까지 휴먼파트너의 핵심 사업영역을 살펴볼 수 있습니다.',
      },
      '/company/vision': {
        imageUrl: '/company/service-02.png',
        description: '공간과 운영을 함께 설계하는 휴먼파트너의 서비스 방향성을 살펴볼 수 있습니다.',
      },
      '/company/location': {
        imageUrl:
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        description: '휴먼파트너 위치와 연락처, 상담 채널 정보를 바로 확인할 수 있습니다.',
      },
    },
    cases: {
      '/cases?tab=temporary-office': {
        imageUrl:
          'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80',
        description: '단기 프로젝트와 임시 업무공간을 위한 설치 사례를 빠르게 모아볼 수 있습니다.',
      },
      '/cases?tab=public-institution': {
        imageUrl:
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        description: '공공기관과 교육 현장 중심의 구축 사례를 확인할 수 있습니다.',
      },
    },
    notice: {
      '/notice?tab=news': {
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        description: '운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 모아볼 수 있습니다.',
      },
      '/notice?tab=resources': {
        imageUrl:
          'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        description: '설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 확인할 수 있습니다.',
      },
    },
    cs: {
      '/cs': {
        imageUrl:
          'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
        description: '자주 묻는 질문과 답변을 바로 확인하고 필요한 상담 채널로 이동할 수 있습니다.',
      },
      '/cs/as-guide': {
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        description: '장애 접수 방법과 처리 절차, 방문 지원 범위 등 A/S 운영 기준을 확인할 수 있습니다.',
      },
    },
  },
};

const STATIC_ROUTES = [
  {
    route: '/',
    sitemap: { changefreq: 'daily', priority: '1.0' },
  },
  {
    route: '/products',
    sitemap: { changefreq: 'daily', priority: '0.9' },
  },
  {
    route: '/company',
    sitemap: { changefreq: 'monthly', priority: '0.8' },
  },
  {
    route: '/company/business',
    sitemap: { changefreq: 'monthly', priority: '0.7' },
  },
  {
    route: '/company/vision',
    sitemap: { changefreq: 'monthly', priority: '0.7' },
  },
  {
    route: '/company/location',
    sitemap: { changefreq: 'monthly', priority: '0.7' },
  },
  {
    route: '/quote-request',
    sitemap: { changefreq: 'monthly', priority: '0.9' },
  },
  {
    route: '/notice',
    sitemap: { changefreq: 'weekly', priority: '0.7' },
  },
  {
    route: '/cs',
    sitemap: { changefreq: 'weekly', priority: '0.7' },
  },
  {
    route: '/cs/as-guide',
    sitemap: { changefreq: 'weekly', priority: '0.7' },
  },
  {
    route: '/cases',
    sitemap: { changefreq: 'weekly', priority: '0.8' },
  },
  {
    route: '/terms',
    sitemap: { changefreq: 'yearly', priority: '0.3' },
  },
  {
    route: '/privacy',
    sitemap: { changefreq: 'yearly', priority: '0.3' },
  },
];

const escapeAttributeValue = (value) => value.replace(/"/g, '&quot;');

const escapeInlineJson = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const normalizeIsoDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const normalizeDateOnly = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const sortByDisplayOrder = (items) => {
  return [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });
};

const sortNotices = (items) => {
  return [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aPublished = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bPublished = b.published_at ? new Date(b.published_at).getTime() : 0;
    if (aPublished !== bPublished) return bPublished - aPublished;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });
};

const sortFaqRows = (items) => {
  return [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aCreated - bCreated;
  });
};

const fetchSupabaseRows = async (table, { select = '*', filters = {}, order, limit } = {}) => {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', select);

  if (order) {
    url.searchParams.set('order', order);
  }

  if (typeof limit === 'number') {
    url.searchParams.set('limit', String(limit));
  }

  Object.entries(filters).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: SUPABASE_HEADERS,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${table} fetch failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

const isIgnorableSchemaError = (error) => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    message.includes('does not exist')
  );
};

const safeFetchRows = async (table, options, fallback = [], { quietOnSchemaError = false } = {}) => {
  try {
    return await fetchSupabaseRows(table, options);
  } catch (error) {
    if (quietOnSchemaError && isIgnorableSchemaError(error)) {
      return fallback;
    }
    console.warn(`${table} prerender data fetch skipped:`, error);
    return fallback;
  }
};

const fetchNavMenuRows = async (options = {}) => {
  try {
    return await fetchSupabaseRows('nav_menu_items', {
      ...options,
      select: NAV_ITEM_SELECT,
    });
  } catch (error) {
    if (isIgnorableSchemaError(error)) {
      return fetchSupabaseRows('nav_menu_items', {
        ...options,
        select: LEGACY_NAV_ITEM_SELECT,
      });
    }

    console.warn('nav_menu_items prerender data fetch skipped:', error);
    return [];
  }
};

const mapNoticeSummary = (item) => ({
  id: item.id,
  title: item.title,
  excerpt: item.excerpt,
  imageUrl: item.image_url,
  publishedAt: normalizeDateOnly(item.published_at),
  category: item.category,
  displayOrder: item.display_order,
  isActive: item.is_active !== false,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const mapNoticeDetail = (item) => ({
  id: item.id,
  title: item.title,
  excerpt: item.excerpt,
  imageUrl: item.image_url,
  publishedAt: normalizeDateOnly(item.published_at),
  category: item.category,
  contentHtml: item.content_html || '<p></p>',
  displayOrder: item.display_order,
  isActive: item.is_active !== false,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const mapCaseSummary = (item) => ({
  id: item.id,
  title: item.title,
  subtitle: item.subtitle,
  image_url: item.image_url,
  link: item.link,
  display_order: item.display_order,
  is_active: item.is_active !== false,
  created_at: item.created_at,
});

const loadDatasets = async () => {
  const generatedAt = new Date().toISOString();

  const [
    products,
    navItems,
    installationCases,
    heroBanners,
    popups,
    noticePosts,
    faqs,
    faqCategories,
    companyEntries,
    publicVisualEntries,
  ] = await Promise.all([
    safeFetchRows('products', {
      select: PRODUCT_DETAIL_SELECT,
      order: 'display_order.asc,created_at.desc',
    }),
    fetchNavMenuRows({
      order: 'display_order.asc',
    }),
    safeFetchRows('installation_cases', {
      select: CASE_DETAIL_SELECT,
      filters: {
        is_active: 'eq.true',
      },
      order: 'display_order.asc,created_at.desc',
    }),
    safeFetchRows('banners', {
      select: HERO_BANNER_SELECT,
      filters: {
        is_active: 'eq.true',
        banner_type: 'eq.hero',
      },
      order: 'display_order.asc',
    }),
    safeFetchRows('popups', {
      select: POPUP_SELECT,
      filters: {
        is_active: 'eq.true',
      },
      order: 'display_order.asc',
    }),
    safeFetchRows('notice_posts', {
      select: NOTICE_DETAIL_SELECT,
      filters: {
        is_active: 'eq.true',
      },
      order: 'display_order.asc,published_at.desc,created_at.desc',
    }, [], { quietOnSchemaError: true }),
    safeFetchRows('faqs', {
      select: FAQ_SELECT,
    }),
    safeFetchRows('faq_categories', {
      select: FAQ_CATEGORY_SELECT,
    }, [], { quietOnSchemaError: true }),
    safeFetchRows('page_contents', {
      select: 'content',
      filters: {
        page_key: 'eq.company',
      },
      limit: 1,
    }),
    safeFetchRows('page_contents', {
      select: 'content',
      filters: {
        page_key: 'eq.public-visuals',
      },
      limit: 1,
    }),
  ]);

  const orderedProducts = sortByDisplayOrder(products || []);
  const orderedNavItems = sortByDisplayOrder(navItems || []);
  const orderedCases = sortByDisplayOrder(installationCases || []);
  const orderedHeroBanners = sortByDisplayOrder(heroBanners || []);
  const orderedPopups = sortByDisplayOrder(popups || []);
  const orderedNoticePosts = sortNotices(noticePosts || []);
  const orderedFaqs = sortFaqRows(faqs || []);
  const orderedFaqCategories = sortFaqRows(faqCategories || []);
  const companyContent = companyEntries?.[0]?.content;
  const publicVisuals = publicVisualEntries?.[0]?.content || DEFAULT_PUBLIC_VISUALS_CONTENT;
  const companyIntroImageUrl = companyContent?.overview?.imageUrl || DEFAULT_COMPANY_INTRO_IMAGE_URL;

  return {
    generatedAt,
    products: orderedProducts,
    navItems: orderedNavItems,
    installationCases: orderedCases,
    heroBanners: orderedHeroBanners,
    popups: orderedPopups,
    noticePosts: orderedNoticePosts,
    faqs: orderedFaqs,
    faqCategories: orderedFaqCategories,
    companyContent,
    publicVisuals,
    companyIntroImageUrl,
  };
};

const buildPrerenderEntries = (datasets) => {
  const baseData = datasets
    ? {
        generatedAt: datasets.generatedAt,
        bootstrap: {
          generatedAt: datasets.generatedAt,
          navItems: datasets.navItems,
          publicVisuals: datasets.publicVisuals,
        },
      }
    : null;

  const entries = STATIC_ROUTES.map((item) => ({
    route: item.route,
    data: baseData ? { ...baseData } : null,
    sitemap: {
      route: item.route,
      ...item.sitemap,
    },
  }));

  if (!datasets) return entries;

  const setRouteData = (route, patch) => {
    const entry = entries.find((item) => item.route === route);
    if (!entry) return;
    entry.data = {
      ...(entry.data || {}),
      ...patch,
    };
  };

  const noticeSummaries = datasets.noticePosts.map(mapNoticeSummary);
  const caseSummaries = datasets.installationCases.map(mapCaseSummary);

  setRouteData('/', {
    home: {
      generatedAt: datasets.generatedAt,
      heroBanners: datasets.heroBanners,
      installationCases: caseSummaries.slice(0, 3),
      noticeSummaries: noticeSummaries.slice(0, 3),
      popups: datasets.popups,
      companyIntroImageUrl: datasets.companyIntroImageUrl,
    },
  });

  setRouteData('/products', {
    productList: {
      generatedAt: datasets.generatedAt,
      products: datasets.products,
      navItems: datasets.navItems,
    },
  });

  setRouteData('/cases', {
    installationCases: {
      generatedAt: datasets.generatedAt,
      cases: caseSummaries,
    },
  });

  setRouteData('/notice', {
    notices: {
      generatedAt: datasets.generatedAt,
      posts: noticeSummaries,
    },
  });

  setRouteData('/cs', {
    support: {
      generatedAt: datasets.generatedAt,
      faqs: datasets.faqs,
      categories: datasets.faqCategories,
    },
  });

  ['/company', '/company/business', '/company/vision', '/company/location'].forEach((route) => {
    setRouteData(route, {
      company: {
        generatedAt: datasets.generatedAt,
        content: datasets.companyContent || {},
      },
    });
  });

  datasets.products.forEach((product) => {
    if (!product?.id) return;

    const relatedProducts = datasets.products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 4);

    entries.push({
      route: `/products/${product.id}`,
      data: {
        ...baseData,
        productDetail: {
          generatedAt: datasets.generatedAt,
          product,
          relatedProducts,
        },
      },
      sitemap: {
        route: `/products/${product.id}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: normalizeIsoDate(product.created_at) || datasets.generatedAt,
      },
    });
  });

  datasets.installationCases.forEach((item, index) => {
    if (!item?.id) return;

    entries.push({
      route: `/cases/${item.id}`,
      data: {
        ...baseData,
        installationCaseDetail: {
          generatedAt: datasets.generatedAt,
          post: item,
          previousCase: index > 0 ? mapCaseSummary(datasets.installationCases[index - 1]) : null,
          nextCase: index < datasets.installationCases.length - 1 ? mapCaseSummary(datasets.installationCases[index + 1]) : null,
        },
      },
      sitemap: {
        route: `/cases/${item.id}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: normalizeIsoDate(item.created_at) || datasets.generatedAt,
      },
    });
  });

  if (datasets.noticePosts.length > 0) {
    datasets.noticePosts.forEach((item, index) => {
      if (!item?.id) return;

      entries.push({
        route: `/notice/${item.id}`,
        data: {
          ...baseData,
          noticeDetail: {
            generatedAt: datasets.generatedAt,
            post: mapNoticeDetail(item),
            previousNotice: index > 0 ? mapNoticeSummary(datasets.noticePosts[index - 1]) : null,
            nextNotice: index < datasets.noticePosts.length - 1 ? mapNoticeSummary(datasets.noticePosts[index + 1]) : null,
          },
        },
        sitemap: {
          route: `/notice/${item.id}`,
          changefreq: 'weekly',
          priority: '0.6',
          lastmod: normalizeIsoDate(item.updated_at || item.published_at || item.created_at) || datasets.generatedAt,
        },
      });
    });
  }

  return entries;
};

const buildSitemapXml = (entries) => {
  const uniqueEntries = [];
  const seenRoutes = new Set();

  entries.forEach((entry) => {
    if (!entry?.route || seenRoutes.has(entry.route)) return;
    seenRoutes.add(entry.route);
    uniqueEntries.push(entry);
  });

  const xmlEntries = uniqueEntries
    .map((entry) => {
      const lines = [
        '  <url>',
        `    <loc>${new URL(entry.route, SITE_URL).toString()}</loc>`,
      ];

      if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }

      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      lines.push(`    <priority>${entry.priority}</priority>`);
      lines.push('  </url>');
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>\n`;
};

const applyAttributes = (html, tagName, attributesMarkup) => {
  if (!attributesMarkup) return html;

  return html.replace(
    new RegExp(`<${tagName}([^>]*)>`, 'i'),
    (match, existingAttributes = '') => {
      const trimmedAttributes = attributesMarkup.trim();
      if (!trimmedAttributes) return match;

      const nextAttributes = `${existingAttributes} ${trimmedAttributes}`.replace(/\s+/g, ' ').trimEnd();
      return `<${tagName}${nextAttributes ? ` ${nextAttributes}` : ''}>`;
    },
  );
};

const injectHead = (template, helmet) => {
  const titleMarkup = helmet?.title?.toString?.() || '';
  const headFragments = [
    helmet?.priority?.toString?.() || '',
    helmet?.meta?.toString?.() || '',
    helmet?.link?.toString?.() || '',
    helmet?.style?.toString?.() || '',
    helmet?.base?.toString?.() || '',
    helmet?.script?.toString?.() || '',
    helmet?.noscript?.toString?.() || '',
  ].filter(Boolean);

  let html = template;

  if (titleMarkup) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, titleMarkup);
  }

  if (headFragments.length > 0) {
    html = html.replace('</head>', `  ${headFragments.join('\n  ')}\n  </head>`);
  }

  html = applyAttributes(html, 'html', helmet?.htmlAttributes?.toString?.() || '');
  html = applyAttributes(html, 'body', helmet?.bodyAttributes?.toString?.() || '');

  return html;
};

const injectPrerenderData = (html, data) => {
  if (!data) return html;

  const serializedData = escapeInlineJson(data);
  const scriptTag = `<script>window.__HP_PRERENDER_DATA__=${serializedData};</script>`;
  return html.replace('</head>', `  ${scriptTag}\n  </head>`);
};

const injectAppHtml = (template, appHtml) => {
  return template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
};

const routeToOutputPath = (route) => {
  if (route === '/') return path.join(distDir, 'index.html');

  const normalizedSegments = route.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return path.join(distDir, ...normalizedSegments, 'index.html');
};

const run = async () => {
  const template = await readFile(templatePath, 'utf8');
  const { render } = await import(pathToFileURL(serverBundlePath).href);
  const datasets = await loadDatasets();
  const prerenderEntries = buildPrerenderEntries(datasets);

  for (const entry of prerenderEntries) {
    const { appHtml, helmet } = render(entry.route, entry.data);
    let html = injectHead(template, helmet);
    html = injectPrerenderData(html, entry.data);
    html = injectAppHtml(html, appHtml);

    const outputPath = routeToOutputPath(entry.route);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, 'utf8');
  }

  const notFoundHtml = render('/__prerender_404__', null);
  let notFoundDocument = injectHead(template, notFoundHtml.helmet);
  notFoundDocument = injectAppHtml(notFoundDocument, notFoundHtml.appHtml);
  notFoundDocument = notFoundDocument.replace(
    '<html lang="ko" data-theme="light">',
    `<html lang="ko" data-theme="light" data-prerendered="${escapeAttributeValue('true')}">`,
  );
  await writeFile(path.join(distDir, '404.html'), notFoundDocument, 'utf8');

  const sitemapXml = buildSitemapXml(prerenderEntries.map((entry) => entry.sitemap));
  await writeFile(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');

  await rm(path.join(projectRoot, '.prerender'), { recursive: true, force: true });
};

run().catch((error) => {
  console.error('Prerender failed:', error);
  process.exitCode = 1;
});

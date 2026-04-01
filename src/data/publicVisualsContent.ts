export interface PublicVisualAsset {
  title?: string;
  imageUrl: string;
  description: string;
}

export interface PublicVisualImageAsset {
  imageUrl: string;
}

export interface PublicVisualsContent {
  productDefaults: {
    all: PublicVisualAsset;
  };
  collectionHeroes: {
    cs: {
      faq: PublicVisualAsset;
      asGuide: PublicVisualAsset;
    };
    notice: {
      all: PublicVisualAsset;
      news: PublicVisualAsset;
      resources: PublicVisualAsset;
    };
    cases: {
      all: PublicVisualAsset;
      temporaryOffice: PublicVisualAsset;
      publicInstitution: PublicVisualAsset;
    };
  };
  megaMenuPreviews: {
    company: PublicVisualImageAsset;
    products: PublicVisualImageAsset;
    cases: PublicVisualImageAsset;
    notice: PublicVisualImageAsset;
    cs: PublicVisualImageAsset;
  };
}

export type PublicMegaMenuPreviewKey = keyof PublicVisualsContent['megaMenuPreviews'];
export type CollectionHeroGroup = keyof PublicVisualsContent['collectionHeroes'];
export type CollectionHeroKeyMap = {
  cs: keyof PublicVisualsContent['collectionHeroes']['cs'];
  notice: keyof PublicVisualsContent['collectionHeroes']['notice'];
  cases: keyof PublicVisualsContent['collectionHeroes']['cases'];
};

export const PUBLIC_VISUALS_PAGE_KEY = 'public-visuals';

const LOCAL_ASSET_HOSTNAMES = new Set(['localhost', '127.0.0.1', 'humanpartner.kr', 'www.humanpartner.kr']);
const STATIC_ASSET_PATH_PATTERN = /^\/.+\.(?:png|jpe?g|svg|webp|gif|ico)$/i;

const ensureString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const normalizeManagedAssetUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (!LOCAL_ASSET_HOSTNAMES.has(parsed.hostname.toLowerCase())) return trimmed;
    if (!STATIC_ASSET_PATH_PATTERN.test(parsed.pathname)) return trimmed;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return trimmed;
  }
};

const ensureAssetString = (value: unknown, fallback: string) =>
  normalizeManagedAssetUrl(ensureString(value, fallback));

const ensureVisualAsset = (value: unknown, fallback: PublicVisualAsset): PublicVisualAsset => {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    title: ensureString(record.title, fallback.title || ''),
    imageUrl: ensureAssetString(record.imageUrl, fallback.imageUrl),
    description: ensureString(record.description, fallback.description),
  };
};

const ensureImageAsset = (value: unknown, fallback: PublicVisualImageAsset): PublicVisualImageAsset => {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    imageUrl: ensureAssetString(record.imageUrl, fallback.imageUrl),
  };
};

const pickImageUrl = (value: unknown) => {
  if (!value || typeof value !== 'object') return '';
  return ensureAssetString((value as Record<string, unknown>).imageUrl, '');
};

const defaultProductVisual: PublicVisualAsset = {
  imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  description: '휴먼파트너의 전체 렌탈 품목을 한눈에 확인해보세요.',
};

const defaultCollectionHeroes: PublicVisualsContent['collectionHeroes'] = {
  cs: {
    faq: {
      title: 'FAQ',
      imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80',
      description: '자주 묻는 질문과 상담 채널을 한 번에 확인하고 필요한 안내를 빠르게 찾아보세요.',
    },
    asGuide: {
      title: 'A/S 안내',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
      description: '접수 방법부터 처리 절차, 방문 지원 범위까지 운영 중 필요한 유지관리 안내를 확인해보세요.',
    },
  },
  notice: {
    all: {
      title: '정보센터',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
      description: '휴먼파트너의 운영 소식, 상담 안내, 설치 및 렌탈 관련 주요 업데이트를 확인해보세요.',
    },
    news: {
      title: '공지사항',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
      description: '운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 한 번에 확인할 수 있습니다.',
    },
    resources: {
      title: '자료실',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
      description: '설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 빠르게 찾아볼 수 있습니다.',
    },
  },
  cases: {
    all: {
      title: '설치 사례',
      imageUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80',
      description: '기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요.',
    },
    temporaryOffice: {
      title: '임시사무실',
      imageUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80',
      description: '단기 프로젝트와 임시 업무공간에 맞춘 렌탈 구성 사례를 빠르게 비교해보세요.',
    },
    publicInstitution: {
      title: '공공기관',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
      description: '공공기관과 교육 현장 중심의 설치 사례를 통해 실제 운영 구성을 확인할 수 있습니다.',
    },
  },
};

const defaultMegaMenuPreviews: PublicVisualsContent['megaMenuPreviews'] = {
  company: {
    imageUrl: '/company/abouthuman.png',
  },
  products: {
    imageUrl: defaultProductVisual.imageUrl,
  },
  cases: {
    imageUrl: defaultCollectionHeroes.cases.all.imageUrl,
  },
  notice: {
    imageUrl: defaultCollectionHeroes.notice.all.imageUrl,
  },
  cs: {
    imageUrl: defaultCollectionHeroes.cs.faq.imageUrl,
  },
};

export const defaultPublicVisualsContent: PublicVisualsContent = {
  productDefaults: {
    all: defaultProductVisual,
  },
  collectionHeroes: defaultCollectionHeroes,
  megaMenuPreviews: defaultMegaMenuPreviews,
};

export const normalizePublicVisualsContent = (value: unknown): PublicVisualsContent => {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const productDefaults = record.productDefaults && typeof record.productDefaults === 'object'
    ? (record.productDefaults as Record<string, unknown>)
    : {};
  const collectionHeroes = record.collectionHeroes && typeof record.collectionHeroes === 'object'
    ? (record.collectionHeroes as Record<string, unknown>)
    : {};
  const legacyProducts = collectionHeroes.products && typeof collectionHeroes.products === 'object'
    ? (collectionHeroes.products as Record<string, unknown>)
    : {};
  const collectionCs = collectionHeroes.cs && typeof collectionHeroes.cs === 'object'
    ? (collectionHeroes.cs as Record<string, unknown>)
    : {};
  const collectionNotice = collectionHeroes.notice && typeof collectionHeroes.notice === 'object'
    ? (collectionHeroes.notice as Record<string, unknown>)
    : {};
  const collectionCases = collectionHeroes.cases && typeof collectionHeroes.cases === 'object'
    ? (collectionHeroes.cases as Record<string, unknown>)
    : {};
  const megaMenuPreviews = record.megaMenuPreviews && typeof record.megaMenuPreviews === 'object'
    ? (record.megaMenuPreviews as Record<string, unknown>)
    : {};
  const megaMenu = record.megaMenu && typeof record.megaMenu === 'object'
    ? (record.megaMenu as Record<string, unknown>)
    : {};
  const megaMenuCompany = megaMenu.company && typeof megaMenu.company === 'object'
    ? (megaMenu.company as Record<string, unknown>)
    : {};
  const megaMenuCases = megaMenu.cases && typeof megaMenu.cases === 'object'
    ? (megaMenu.cases as Record<string, unknown>)
    : {};
  const megaMenuNotice = megaMenu.notice && typeof megaMenu.notice === 'object'
    ? (megaMenu.notice as Record<string, unknown>)
    : {};
  const megaMenuCs = megaMenu.cs && typeof megaMenu.cs === 'object'
    ? (megaMenu.cs as Record<string, unknown>)
    : {};
  const legacyProductDefault = legacyProducts.all;
  const csAsGuideValue = collectionCs.asGuide ?? collectionCs['as-guide'];
  const casesTemporaryOfficeValue = collectionCases.temporaryOffice ?? collectionCases['temporary-office'];
  const casesPublicInstitutionValue = collectionCases.publicInstitution ?? collectionCases['public-institution'];

  const normalizedProductDefaults = {
    all: ensureVisualAsset(productDefaults.all ?? legacyProductDefault, defaultPublicVisualsContent.productDefaults.all),
  };

  const normalizedCollectionHeroes = {
    cs: {
      faq: ensureVisualAsset(collectionCs.faq, defaultPublicVisualsContent.collectionHeroes.cs.faq),
      asGuide: ensureVisualAsset(csAsGuideValue, defaultPublicVisualsContent.collectionHeroes.cs.asGuide),
    },
    notice: {
      all: ensureVisualAsset(collectionNotice.all, defaultPublicVisualsContent.collectionHeroes.notice.all),
      news: ensureVisualAsset(collectionNotice.news, defaultPublicVisualsContent.collectionHeroes.notice.news),
      resources: ensureVisualAsset(
        collectionNotice.resources,
        defaultPublicVisualsContent.collectionHeroes.notice.resources,
      ),
    },
    cases: {
      all: ensureVisualAsset(collectionCases.all, defaultPublicVisualsContent.collectionHeroes.cases.all),
      temporaryOffice: ensureVisualAsset(
        casesTemporaryOfficeValue,
        defaultPublicVisualsContent.collectionHeroes.cases.temporaryOffice,
      ),
      publicInstitution: ensureVisualAsset(
        casesPublicInstitutionValue,
        defaultPublicVisualsContent.collectionHeroes.cases.publicInstitution,
      ),
    },
  };

  const companyPreviewFallback = {
    imageUrl:
      pickImageUrl(megaMenuCompany['/company']) ||
      pickImageUrl(megaMenuCompany['company-overview']) ||
      defaultPublicVisualsContent.megaMenuPreviews.company.imageUrl,
  };
  const productsPreviewFallback = {
    imageUrl: normalizedProductDefaults.all.imageUrl,
  };
  const casesPreviewFallback = {
    imageUrl:
      pickImageUrl(collectionCases.all) ||
      pickImageUrl(megaMenuCases['/cases?tab=temporary-office']) ||
      pickImageUrl(megaMenuCases['temporary-office']) ||
      pickImageUrl(megaMenuCases['/cases?tab=public-institution']) ||
      pickImageUrl(megaMenuCases['public-institution']) ||
      defaultPublicVisualsContent.megaMenuPreviews.cases.imageUrl,
  };
  const noticePreviewFallback = {
    imageUrl:
      pickImageUrl(collectionNotice.all) ||
      pickImageUrl(megaMenuNotice['/notice?tab=news']) ||
      pickImageUrl(megaMenuNotice.news) ||
      pickImageUrl(megaMenuNotice['/notice?tab=resources']) ||
      pickImageUrl(megaMenuNotice.resources) ||
      defaultPublicVisualsContent.megaMenuPreviews.notice.imageUrl,
  };
  const csPreviewFallback = {
    imageUrl:
      pickImageUrl(megaMenuCs['/cs']) ||
      pickImageUrl(megaMenuCs.faq) ||
      pickImageUrl(collectionCs.faq) ||
      defaultPublicVisualsContent.megaMenuPreviews.cs.imageUrl,
  };

  return {
    productDefaults: normalizedProductDefaults,
    collectionHeroes: normalizedCollectionHeroes,
    megaMenuPreviews: {
      company: ensureImageAsset(megaMenuPreviews.company, companyPreviewFallback),
      products: ensureImageAsset(megaMenuPreviews.products ?? megaMenuPreviews.productCategories, productsPreviewFallback),
      cases: ensureImageAsset(megaMenuPreviews.cases, casesPreviewFallback),
      notice: ensureImageAsset(megaMenuPreviews.notice, noticePreviewFallback),
      cs: ensureImageAsset(megaMenuPreviews.cs, csPreviewFallback),
    },
  };
};

export const getCollectionHeroVisual = <
  Group extends CollectionHeroGroup,
  Key extends CollectionHeroKeyMap[Group],
>(
  content: PublicVisualsContent | null | undefined,
  group: Group,
  key: Key,
) => {
  const normalized = content ? normalizePublicVisualsContent(content) : defaultPublicVisualsContent;
  return normalized.collectionHeroes[group][key];
};

export const getMegaMenuPreviewAsset = (
  content: PublicVisualsContent | null | undefined,
  key: PublicMegaMenuPreviewKey,
) => {
  const normalized = content ? normalizePublicVisualsContent(content) : defaultPublicVisualsContent;
  return normalized.megaMenuPreviews[key];
};

export const getProductDefaultVisual = (content: PublicVisualsContent | null | undefined) => {
  const normalized = content ? normalizePublicVisualsContent(content) : defaultPublicVisualsContent;
  return normalized.productDefaults.all;
};

export interface CompanyHeroContent {
  title: string;
  description: string;
  imageUrl: string;
}

export interface CompanyOverviewContent {
  eyebrow: string;
  title: string;
  checklist: string[];
  paragraphs: string[];
  imageUrl: string;
}

export interface CompanyStatContent {
  value: string;
  label: string;
  description: string;
}

export interface CompanyServiceCardContent {
  title: string;
  image: string;
  highlight: string;
  description: string;
  imagePosition?: string;
}

export interface CompanyVisionItemContent {
  title: string;
  description: string;
}

export interface CompanyLocationContent {
  eyebrow: string;
  title: string;
  address: string;
  phone: string;
  hours: string;
  naverMapUrl: string;
}

export interface CompanyBodySections {
  overviewHtml: string;
  businessHtml: string;
  visionHtml: string;
  locationHtml: string;
}

export type CompanySectionTabValue =
  | 'company-overview'
  | 'company-business'
  | 'company-vision'
  | 'company-location';

export type CompanyBodySectionKey = keyof CompanyBodySections;

export const COMPANY_BODY_SECTION_KEY_BY_TAB: Record<CompanySectionTabValue, CompanyBodySectionKey> = {
  'company-overview': 'overviewHtml',
  'company-business': 'businessHtml',
  'company-vision': 'visionHtml',
  'company-location': 'locationHtml',
};

export interface CompanyPageContent {
  hero: CompanyHeroContent;
  bodySections: CompanyBodySections;
  overview: CompanyOverviewContent;
  stats: CompanyStatContent[];
  business: {
    eyebrow: string;
    title: string;
    description: string;
    cards: CompanyServiceCardContent[];
  };
  vision: {
    eyebrow: string;
    title: string;
    description: string;
    items: CompanyVisionItemContent[];
  };
  location: CompanyLocationContent;
}

export const COMPANY_CONTENT_PAGE_KEY = 'company';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = (value: string) => escapeHtml(value);

const ensureString = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value : fallback);

const renderParagraphs = (paragraphs: string[]) =>
  paragraphs
    .filter((item) => item.trim())
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');

const renderImage = (url: string, alt: string) =>
  url.trim()
    ? `<p><img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}" /></p>`
    : '';

const renderChecklist = (items: string[]) =>
  items.length > 0
    ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';

type CompanyStructuredSections = Pick<CompanyPageContent, 'overview' | 'stats' | 'business' | 'vision' | 'location'>;

const buildCompanyBodySectionsFromStructured = (content: CompanyStructuredSections): CompanyBodySections => {
  const overviewStatsHtml =
    content.stats.length > 0
      ? `<ul>${content.stats
          .map(
            (item) =>
              `<li><strong>${escapeHtml(item.value)}</strong> ${escapeHtml(item.label)} - ${escapeHtml(item.description)}</li>`,
          )
          .join('')}</ul>`
      : '';

  const businessCardsHtml = content.business.cards
    .map((card) =>
      [
        `<h3>${escapeHtml(card.title)}</h3>`,
        renderImage(card.image, card.title),
        `<p><strong>${escapeHtml(card.highlight)}</strong>${escapeHtml(card.description)}</p>`,
      ].join(''),
    )
    .join('');

  const visionItemsHtml = content.vision.items
    .map(
      (item) =>
        `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>`,
    )
    .join('');

  const locationHtml = [
    `<h2>${escapeHtml(content.location.title)}</h2>`,
    `<p>${escapeHtml(content.location.address)}</p>`,
    `<p><strong>전화:</strong> ${escapeHtml(content.location.phone)}</p>`,
    `<p><strong>상담 안내:</strong> ${escapeHtml(content.location.hours)}</p>`,
  ].join('');

  return {
    overviewHtml: [
      `<h2>${escapeHtml(content.overview.title)}</h2>`,
      renderChecklist(content.overview.checklist),
      renderParagraphs(content.overview.paragraphs),
      renderImage(content.overview.imageUrl, content.overview.title),
      overviewStatsHtml,
    ].join(''),
    businessHtml: [
      `<h2>${escapeHtml(content.business.title)}</h2>`,
      `<p>${escapeHtml(content.business.description)}</p>`,
      businessCardsHtml,
    ].join(''),
    visionHtml: [
      `<h2>${escapeHtml(content.vision.title)}</h2>`,
      `<p>${escapeHtml(content.vision.description)}</p>`,
      visionItemsHtml,
    ].join(''),
    locationHtml,
  };
};

const baseDefaultCompanyPageContent = {
  hero: {
    title: '회사 소개',
    description:
      '공공기관, 관공서, 민간기업의 다양한 운영 환경에 맞춘 기획과 실행으로 안정적인 업무 공간과 현장 운영을 함께 만듭니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80',
  },
  overview: {
    eyebrow: 'ABOUT HUMAN PARTNER',
    title: '준비의 부담은 줄이고, 운영의 완성도는 높입니다',
    checklist: [],
    paragraphs: [
      '휴먼파트너는 단순히 제품을 공급하는 회사를 넘어, 공간과 일정, 운영 목적까지 함께 검토하며 필요한 구성을 제안하는 B2B 렌탈 파트너입니다. 고객이 원하는 것은 단순한 품목 나열이 아니라 실제 업무와 현장에서 바로 사용할 수 있는 안정적인 운영 환경이라는 점을 이해하고, 그 목적에 맞는 방식으로 준비 과정을 함께 설계합니다.',
      '업무 공간을 새롭게 꾸려야 하거나 기존 환경을 빠르게 재정비해야 하는 순간에는 생각보다 많은 판단이 필요합니다. 어떤 품목이 실제로 필요한지, 예산 안에서 어떤 구성이 가장 효율적인지, 설치와 운영 일정은 어떻게 맞출지, 사용 중 발생할 수 있는 변수는 어떻게 줄일지까지 한 번에 고려해야 합니다. 휴먼파트너는 이러한 과정을 고객이 혼자 감당하지 않도록, 초기 상담 단계부터 필요한 기준을 함께 정리하고 실행 가능한 구성으로 구체화합니다.',
      '휴먼파트너가 중요하게 생각하는 것은 보기 좋은 제안보다 실제로 운영이 잘 되는 결과입니다. 사무가구와 IT 장비, 운영에 필요한 다양한 품목을 고객 환경에 맞춰 빠르게 구성하고, 현장 여건과 일정에 맞는 설치 계획까지 함께 조율해 불필요한 시행착오를 줄입니다. 준비 과정에서 놓치기 쉬운 부분까지 미리 점검해두기 때문에 고객은 더 예측 가능한 일정 안에서 업무를 시작할 수 있습니다.',
      '현장마다 필요한 기준은 모두 다릅니다. 어떤 곳은 빠른 설치와 즉시 사용이 가장 중요하고, 또 어떤 곳은 예산 안에서 효율적인 구성을 만드는 일이 우선일 수 있습니다. 휴먼파트너는 하나의 방식만 고집하지 않고, 고객이 처한 상황과 운영 목적에 맞춰 제안의 우선순위를 조정합니다. 그래서 같은 렌탈이라도 더 현실적이고, 더 쓰임새 있는 구성으로 연결될 수 있습니다.',
      '고객이 얻는 가장 큰 가치는 준비와 관리에 드는 부담을 줄이면서도 운영의 안정감을 높일 수 있다는 점입니다. 상담, 제안, 설치, 유지관리, 회수까지 이어지는 전 과정을 체계적으로 지원하기 때문에 고객은 복잡한 조율과 반복적인 확인 업무를 줄이고 본래의 핵심 업무에 더 집중할 수 있습니다. 필요한 순간에 빠르게 대응할 수 있는 파트너가 있다는 사실만으로도 현장 운영의 긴장감은 분명히 달라집니다.',
      '휴먼파트너는 단기적인 공급 관계보다, 함께 준비하고 끝까지 관리하는 파트너십을 지향합니다. 고객이 필요로 하는 시점에 맞춰 유연하게 움직이고, 변화하는 조건에도 흔들리지 않도록 안정적인 운영 흐름을 만드는 것, 그것이 휴먼파트너가 제공하고자 하는 실질적인 가치입니다. 앞으로도 고객의 준비 과정은 더 단순하게, 운영 결과는 더 완성도 높게 만들 수 있도록 현장에 맞는 제안과 실행으로 함께하겠습니다.',
    ],
    imageUrl: '/company/abouthuman.png',
  },
  stats: [
    {
      value: 'B2B',
      label: '프로젝트 맞춤 대응',
      description:
        '공공기관, 관공서, 민간기업 등 다양한 운영 환경에 맞춤 컨설팅부터 설치까지 유연하게 대응합니다.',
    },
    {
      value: '1,000+',
      label: '누적 고객사',
      description:
        '공공(정부)기관, 관공서, 다양한 규모의 기업이 휴먼파트너의 맞춤형 렌탈 서비스를 이용 중입니다.',
    },
    {
      value: '99%',
      label: '유지보수 만족도',
      description:
        '사후 대응 품질과 유지관리 안정성을 직관적으로 전달하는 핵심 신뢰 지표입니다.',
    },
  ],
  business: {
    eyebrow: 'OUR SERVICES',
    title: '제공 서비스 분야',
    description: '휴먼파트너는 아래 3가지 핵심 축을 완성도 높게 결합하여 최고의 시너지를 창출합니다.',
    cards: [
      {
        title: '기업 IT 인프라 렌탈',
        image: '/company/service-01.jpg',
        imagePosition: '78% center',
        highlight: '초기 도입 비용 부담',
        description:
          '은 줄이고 업무 효율은 높이세요. 사무기기, 가구 공급부터 체계적인 유지보수까지, 기업의 자산 관리 효율을 극대화합니다.',
      },
      {
        title: '목적에 맞는 비즈니스 공간',
        image: '/company/service-02.png',
        highlight: '기획부터 구현까지',
        description:
          ' 책임집니다. 공간의 효율성을 극대화하는 전문가의 컨설팅으로 성공적인 비즈니스 이벤트를 완성합니다.',
      },
      {
        title: '현장 운영 지원',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        highlight: '철저한 서포트 시스템',
        description:
          '을 경험하세요. 전문 인력의 밀착 케어를 통해 고객사는 비즈니스 핵심 가치에만 집중할 수 있는 환경을 만듭니다.',
      },
    ],
  },
  vision: {
    eyebrow: 'VISION',
    title: '휴먼파트너가 지향하는 운영 기준',
    description:
      '단순 렌탈 공급을 넘어, 더 안정적이고 예측 가능한 업무 환경을 만드는 파트너가 되고자 합니다.',
    items: [
      {
        title: '운영 목적을 먼저 이해합니다',
        description: '공간 규모와 일정, 예산, 운영 목적을 함께 파악해 꼭 필요한 구성만 빠르게 제안합니다.',
      },
      {
        title: '실행과 유지관리까지 책임집니다',
        description: '공급, 설치, 운영, 회수까지 이어지는 과정을 안정적으로 관리해 현장 부담을 줄입니다.',
      },
      {
        title: '고객의 본업 집중을 돕습니다',
        description: '고객이 핵심 업무에 몰입할 수 있도록 예측 가능한 운영 환경과 빠른 대응 체계를 만듭니다.',
      },
    ],
  },
  location: {
    eyebrow: 'LOCATION & CONTACT',
    title: '오시는 길',
    address: '대전광역시 대덕구 대화로106번길 66 펜타플렉스 705호',
    phone: '1800-1985',
    hours: '평일 09:00 - 18:00 / 점심 12:00 - 13:00',
    naverMapUrl:
      'https://map.naver.com/p/search/%ED%9C%B4%EB%A8%BC%ED%8C%8C%ED%8A%B8%EB%84%88/place/1420776065?c=15.44,0,0,0,dh&placePath=/home&from=map&fromPanelNum=2&locale=ko&searchText=%ED%9C%B4%EB%A8%BC%ED%8C%8C%ED%8A%B8%EB%84%88',
  },
} satisfies Omit<CompanyPageContent, 'bodySections'>;

export const defaultCompanyPageContent: CompanyPageContent = {
  ...baseDefaultCompanyPageContent,
  bodySections: buildCompanyBodySectionsFromStructured(baseDefaultCompanyPageContent),
};

export const normalizeCompanyPageContent = (value: unknown): CompanyPageContent => {
  if (!value || typeof value !== 'object') {
    return defaultCompanyPageContent;
  }

  const raw = value as Partial<CompanyPageContent>;

  const normalizedStructured: Omit<CompanyPageContent, 'bodySections'> = {
    hero: {
      title: ensureString(raw.hero?.title, defaultCompanyPageContent.hero.title),
      description: ensureString(raw.hero?.description, defaultCompanyPageContent.hero.description),
      imageUrl: ensureString(raw.hero?.imageUrl, defaultCompanyPageContent.hero.imageUrl),
    },
    overview: {
      eyebrow: ensureString(raw.overview?.eyebrow, defaultCompanyPageContent.overview.eyebrow),
      title: ensureString(raw.overview?.title, defaultCompanyPageContent.overview.title),
      checklist:
        Array.isArray(raw.overview?.checklist) && raw.overview.checklist.length > 0
          ? raw.overview.checklist.map((item, index) =>
              ensureString(item, defaultCompanyPageContent.overview.checklist[index] || ''),
            )
          : defaultCompanyPageContent.overview.checklist,
      paragraphs:
        Array.isArray(raw.overview?.paragraphs) && raw.overview.paragraphs.length > 0
          ? raw.overview.paragraphs.map((item, index) =>
              ensureString(item, defaultCompanyPageContent.overview.paragraphs[index] || ''),
            )
          : defaultCompanyPageContent.overview.paragraphs,
      imageUrl: ensureString(raw.overview?.imageUrl, defaultCompanyPageContent.overview.imageUrl),
    },
    stats:
      Array.isArray(raw.stats) && raw.stats.length > 0
        ? raw.stats.map((item, index) => ({
            value: ensureString(item?.value, defaultCompanyPageContent.stats[index]?.value || ''),
            label: ensureString(item?.label, defaultCompanyPageContent.stats[index]?.label || ''),
            description: ensureString(
              item?.description,
              defaultCompanyPageContent.stats[index]?.description || '',
            ),
          }))
        : defaultCompanyPageContent.stats,
    business: {
      eyebrow: ensureString(raw.business?.eyebrow, defaultCompanyPageContent.business.eyebrow),
      title: ensureString(raw.business?.title, defaultCompanyPageContent.business.title),
      description: ensureString(raw.business?.description, defaultCompanyPageContent.business.description),
      cards:
        Array.isArray(raw.business?.cards) && raw.business.cards.length > 0
          ? raw.business.cards.map((item, index) => ({
              title: ensureString(item?.title, defaultCompanyPageContent.business.cards[index]?.title || ''),
              image: ensureString(item?.image, defaultCompanyPageContent.business.cards[index]?.image || ''),
              highlight: ensureString(
                item?.highlight,
                defaultCompanyPageContent.business.cards[index]?.highlight || '',
              ),
              description: ensureString(
                item?.description,
                defaultCompanyPageContent.business.cards[index]?.description || '',
              ),
              imagePosition: ensureString(
                item?.imagePosition,
                defaultCompanyPageContent.business.cards[index]?.imagePosition || '',
              ),
            }))
          : defaultCompanyPageContent.business.cards,
    },
    vision: {
      eyebrow: ensureString(raw.vision?.eyebrow, defaultCompanyPageContent.vision.eyebrow),
      title: ensureString(raw.vision?.title, defaultCompanyPageContent.vision.title),
      description: ensureString(raw.vision?.description, defaultCompanyPageContent.vision.description),
      items:
        Array.isArray(raw.vision?.items) && raw.vision.items.length > 0
          ? raw.vision.items.map((item, index) => ({
              title: ensureString(item?.title, defaultCompanyPageContent.vision.items[index]?.title || ''),
              description: ensureString(
                item?.description,
                defaultCompanyPageContent.vision.items[index]?.description || '',
              ),
            }))
          : defaultCompanyPageContent.vision.items,
    },
    location: {
      eyebrow: ensureString(raw.location?.eyebrow, defaultCompanyPageContent.location.eyebrow),
      title: ensureString(raw.location?.title, defaultCompanyPageContent.location.title),
      address: ensureString(raw.location?.address, defaultCompanyPageContent.location.address),
      phone: ensureString(raw.location?.phone, defaultCompanyPageContent.location.phone),
      hours: ensureString(raw.location?.hours, defaultCompanyPageContent.location.hours),
      naverMapUrl: ensureString(raw.location?.naverMapUrl, defaultCompanyPageContent.location.naverMapUrl),
    },
  };

  const fallbackBodySections = buildCompanyBodySectionsFromStructured(normalizedStructured);

  return {
    ...normalizedStructured,
    bodySections: {
      overviewHtml: ensureString(raw.bodySections?.overviewHtml, fallbackBodySections.overviewHtml),
      businessHtml: ensureString(raw.bodySections?.businessHtml, fallbackBodySections.businessHtml),
      visionHtml: ensureString(raw.bodySections?.visionHtml, fallbackBodySections.visionHtml),
      locationHtml: ensureString(raw.bodySections?.locationHtml, fallbackBodySections.locationHtml),
    },
  };
};

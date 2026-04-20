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

const LOCAL_ASSET_HOSTNAMES = new Set(['localhost', '127.0.0.1', 'humanpartner.kr', 'www.humanpartner.kr']);

const STATIC_ASSET_PATH_PATTERN = /^\/.+\.(?:png|jpe?g|svg|webp|gif|ico)$/i;

const normalizeManagedAssetUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (!LOCAL_ASSET_HOSTNAMES.has(parsed.hostname.toLowerCase())) return trimmed;
    if (!parsed.pathname.startsWith('/company/') && !STATIC_ASSET_PATH_PATTERN.test(parsed.pathname)) return trimmed;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return trimmed;
  }
};

const ensureAssetString = (value: unknown, fallback: string) => normalizeManagedAssetUrl(ensureString(value, fallback));

const normalizeManagedAssetHtml = (html: string) =>
  html.replace(/(src|href)=(['"])(.*?)\2/gi, (match, attribute, quote, url) => {
    const normalizedUrl = normalizeManagedAssetUrl(url);
    return `${attribute}=${quote}${normalizedUrl}${quote}`;
  });

const renderParagraphs = (paragraphs: string[]) =>
  paragraphs
    .filter((item) => item.trim())
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');

const renderMultilineParagraphs = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
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
      renderMultilineParagraphs(content.business.description),
      businessCardsHtml,
    ].join(''),
    visionHtml: [
      `<h2>${escapeHtml(content.vision.title)}</h2>`,
      renderMultilineParagraphs(content.vision.description),
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

const defaultVisionTitle = '건강한 기업, 지속적인 발전, 우수서비스';

const defaultOverviewTitle = '준비의 부담은 줄이고 운영의 완성도는 높입니다';

const defaultOverviewParagraphs = [
  '휴먼파트너는 단순한 상품 공급을 넘어, 기업과 공공기관의 업무 환경에 맞는 비즈니스 솔루션을 제안하는 B2B 렌탈 파트너입니다.',
  '사무가구, IT 장비, 운영 물품까지 필요한 항목을 목적과 일정, 예산에 맞춰 효율적으로 구성하고 안정적으로 운영할 수 있도록 지원합니다.',
  '고객이 준비와 관리에 드는 부담을 줄이고 본연의 업무에 집중할 수 있도록, 상담부터 설치와 유지보수까지 일관된 서비스를 제공합니다.',
];

const defaultBusinessDescription = [
  '고객이 실제로 필요로 하는 공간 구성과 운영 흐름을 먼저 이해하고, 그 목적에 맞는 품목과 방식으로 렌탈 구성을 제안하는 것이 휴먼파트너 사업의 핵심입니다. 사무가구와 IT 장비, 운영에 필요한 각종 품목을 고객 환경에 맞게 조합해 보다 효율적이고 안정적인 업무 환경을 구축할 수 있도록 지원합니다.',
  '업무 공간을 준비하는 과정에서는 필요한 물품만 확보하는 것으로 충분하지 않은 경우가 많습니다. 현장 규모와 사용 목적, 일정, 예산, 설치 조건까지 함께 고려해야 실제 운영에 무리가 없는 구성이 완성됩니다. 휴먼파트너는 고객이 당장 필요한 품목뿐 아니라 운영 과정에서 실제 도움이 되는 구성까지 함께 검토해 보다 현실적인 제안을 제공합니다.',
  '사무가구 렌탈은 휴먼파트너의 기본 사업영역 중 하나입니다. 책상, 의자, 수납장, 회의용 가구 등 업무 공간에 필요한 기본 가구를 현장 여건에 맞춰 구성하고, 공간 효율과 사용 편의성까지 고려한 배치를 제안합니다. 단기 프로젝트 공간이든 장기 운영 공간이든 목적에 맞는 가구 구성을 빠르고 안정적으로 지원합니다.',
  'IT 장비 렌탈 역시 중요한 사업영역입니다. 노트북, 모니터, 데스크톱, 프린터, 복합기 등 업무 운영에 직접 연결되는 장비는 실제 사용 환경에 맞게 빠르게 세팅되고 안정적으로 운영되는 것이 중요합니다. 고성능 기업용 PC와 삼성 복합기 등 사무환경의 핵심 인프라 구축까지 지원하며, 초기 도입 비용 부담은 줄이고 정기적인 유지보수와 신속한 AS로 업무 공백을 최소화합니다.',
  '운영에 필요한 부가 품목과 현장 지원 역시 함께 제공합니다. 행사 성격과 프로젝트 환경에 맞는 배치, 기술 지원, 공공기관 기준에 맞는 투명한 계약 절차와 철저한 사후관리까지 하나의 흐름으로 대응해 고객이 여러 업체를 나누어 관리하는 부담을 줄입니다.',
  '휴먼파트너의 사업영역은 결국 고객이 더 빠르고 안정적으로 운영을 시작할 수 있도록 만드는 데 목적이 있습니다. 품목 공급, 구성 제안, 설치, 유지관리, 회수까지 이어지는 전 과정을 체계적으로 지원함으로써 고객이 본연의 업무와 운영에 더욱 집중할 수 있도록 돕습니다.',
].join('\n\n');

const defaultBusinessCards: CompanyServiceCardContent[] = [
  {
    title: '기업 IT · 사무환경 렌탈',
    image: '/company/service-01.jpg',
    imagePosition: '78% center',
    highlight: '초기 비용 부담은 줄이고',
    description: '업무에 필요한 장비와 가구를 효율적으로 구성해 빠르게 운영을 시작할 수 있도록 지원합니다.',
  },
  {
    title: '목적에 맞는 공간 구성',
    image: '/company/service-02.png',
    highlight: '기획부터 실행까지',
    description: '예산과 일정, 사용 목적에 맞는 공간과 물품 구성을 제안해 현장 활용도를 높입니다.',
  },
  {
    title: '운영 · 유지보수 지원',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    highlight: '설치 이후까지 관리',
    description: '유지보수와 대응 체계를 함께 제공해 고객이 안정적으로 업무를 이어갈 수 있도록 돕습니다.',
  },
];

const defaultVisionDescription = [
  '㈜신도리코 공식파트너인 휴먼파트너는 전국 인프라와 본사 교육, 정보 공유 체계를 바탕으로 안정적인 기술 지원과 서비스를 제공합니다.',
  '휴먼파트너는 기업과 공공기관에 필요로하는 모든 비지니스 상품들을 렌탈 및 유지보수를 하고 있습니다.',
  '고객의 비즈니스 성공을 위한 맞춤형 솔루션과 고객님의합리적인 소비와 만족도를 위해 끊임없이 지속적인 애프터 서비스를 제공해드릴 것을 약속하며,',
  '고객의 만족을 최우선으로 하고자 고객의 입장에서 모든 문제를 해결하고, 고객과 같이 발전하고 동행할 수 있는 기업이 되도록 최선을 다하고자 하오니, 깊은 애정과 많은 성원을 부탁드립니다.',
  '기업과 공공기관에 필요한 비즈니스 상품을 렌탈 및 유지보수하며, 고객의 업무 환경에 맞는 맞춤형 솔루션과 지속적인 애프터서비스를 약속합니다.',
  "또한 기아대책, 유니세프, UN난민구조, 굿네이버스 등 국내외 아동보호사업에 수익의 일부를 꾸준히 기부하며, '존경받는 기업, 발전하는 회사'라는 경영 이념을 실천해 나가고 있습니다.",
].join('\n\n');

const defaultVisionItems: CompanyVisionItemContent[] = [
  {
    title: '전문성과 안정성',
    description: '전국 인프라와 교육 체계를 기반으로 신뢰할 수 있는 기술력과 대응 체계를 제공합니다.',
  },
  {
    title: '고객 중심 서비스',
    description: '고객 환경에 맞는 맞춤형 솔루션과 지속적인 유지보수로 업무 효율과 만족도를 높입니다.',
  },
  {
    title: '지속 가능한 책임',
    description: '사회공헌과 책임 있는 경영을 통해 건강한 기업과 지속 가능한 사회를 지향합니다.',
  },
];

const defaultCompanyPageContentStructured: Omit<CompanyPageContent, 'bodySections'> = {
  ...baseDefaultCompanyPageContent,
  overview: {
    ...baseDefaultCompanyPageContent.overview,
    title: defaultOverviewTitle,
    paragraphs: defaultOverviewParagraphs,
  },
  business: {
    ...baseDefaultCompanyPageContent.business,
    description: defaultBusinessDescription,
    cards: defaultBusinessCards,
  },
  vision: {
    ...baseDefaultCompanyPageContent.vision,
    title: defaultVisionTitle,
    description: defaultVisionDescription,
    items: defaultVisionItems,
  },
};

export const defaultCompanyPageContent: CompanyPageContent = {
  ...defaultCompanyPageContentStructured,
  bodySections: buildCompanyBodySectionsFromStructured(defaultCompanyPageContentStructured),
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
      imageUrl: ensureAssetString(raw.hero?.imageUrl, defaultCompanyPageContent.hero.imageUrl),
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
      imageUrl: ensureAssetString(raw.overview?.imageUrl, defaultCompanyPageContent.overview.imageUrl),
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
              image: ensureAssetString(item?.image, defaultCompanyPageContent.business.cards[index]?.image || ''),
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
      overviewHtml: normalizeManagedAssetHtml(ensureString(raw.bodySections?.overviewHtml, fallbackBodySections.overviewHtml)),
      businessHtml: normalizeManagedAssetHtml(ensureString(raw.bodySections?.businessHtml, fallbackBodySections.businessHtml)),
      visionHtml: normalizeManagedAssetHtml(ensureString(raw.bodySections?.visionHtml, fallbackBodySections.visionHtml)),
      locationHtml: normalizeManagedAssetHtml(ensureString(raw.bodySections?.locationHtml, fallbackBodySections.locationHtml)),
    },
  };
};

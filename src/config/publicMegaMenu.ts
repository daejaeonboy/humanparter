import type { PublicMegaMenuPreviewKey, PublicVisualsContent } from '../content/publicVisualsContent';
import type { PublicNavMegaMenuType } from './publicNavigation';

export interface MegaMenuLinkItem {
  label: string;
  to: string;
  imageUrl: string;
  description: string;
}

export interface FilterTabItem {
  label: string;
  value: string;
  to: string;
}

const normalizeCategoryLabel = (value?: string) => value?.trim().replace(/\s+/g, ' ') || '';

const toInstallationCaseTabValue = (category: string) => {
  const normalized = normalizeCategoryLabel(category);
  const compact = normalized.replace(/\s+/g, '').toLowerCase();

  if (compact.includes('공공기관')) return 'public-institution';
  if (compact.includes('임시사무실')) return 'temporary-office';
  return `category:${normalized}`;
};

const toInstallationCaseTabPath = (category: string) => {
  const value = toInstallationCaseTabValue(category);
  return value === 'all' ? '/cases' : `/cases?tab=${encodeURIComponent(value)}`;
};

export const COMPANY_SECTION_TABS: FilterTabItem[] = [
  { label: '회사 개요', value: 'company-overview', to: '/company' },
  { label: '사업 영역', value: 'company-business', to: '/company/business' },
  { label: '비전', value: 'company-vision', to: '/company/vision' },
  { label: '오시는 길', value: 'company-location', to: '/company/location' },
];

export const INSTALLATION_CASE_FILTER_TABS: FilterTabItem[] = [
  { label: '전체', value: 'all', to: '/cases' },
  { label: '임시사무실', value: 'temporary-office', to: '/cases?tab=temporary-office' },
  { label: '공공기관', value: 'public-institution', to: '/cases?tab=public-institution' },
];

export const INSTALLATION_CASE_CATEGORY_OPTIONS = [
  { label: '임시사무실', value: '임시사무실' },
  { label: '공공기관', value: '공공기관' },
] as const;

export const NOTICE_FILTER_TABS: FilterTabItem[] = [
  { label: '공지사항', value: 'news', to: '/notice?tab=news' },
  { label: '자료실', value: 'resources', to: '/notice?tab=resources' },
];

export const CS_SECTION_TABS: FilterTabItem[] = [
  { label: 'FAQ', value: 'faq', to: '/cs' },
  { label: 'A/S 안내', value: 'as-guide', to: '/cs/as-guide' },
];

export const STATIC_PUBLIC_MEGA_MENU_ITEMS = {
  company: [
    {
      label: '회사 개요',
      to: '/company',
      imageUrl: '/company/abouthuman.png',
      description: '휴먼파트너의 운영 경험과 B2B 렌탈 파트너로서의 강점을 확인해보세요.',
    },
    {
      label: '사업 영역',
      to: '/company/business',
      imageUrl: '/company/service-01.jpg',
      description: '사무가구, IT 장비, 현장 운영까지 휴먼파트너의 주요 사업 영역을 살펴볼 수 있습니다.',
    },
    {
      label: '비전',
      to: '/company/vision',
      imageUrl: '/company/service-02.png',
      description: '공간과 운영을 함께 설계하는 휴먼파트너의 서비스 방향성을 소개합니다.',
    },
    {
      label: '오시는 길',
      to: '/company/location',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      description: '휴먼파트너 위치와 연락처, 상담 채널 정보를 바로 확인할 수 있습니다.',
    },
  ],
  cases: [
    {
      label: '임시사무실',
      to: '/cases?tab=temporary-office',
      imageUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80',
      description: '단기 프로젝트와 임시 업무공간을 위한 설치 사례를 모아볼 수 있습니다.',
    },
    {
      label: '공공기관',
      to: '/cases?tab=public-institution',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      description: '공공기관과 교육 현장 중심의 납품 및 구축 사례를 확인할 수 있습니다.',
    },
  ],
  notice: [
    {
      label: '공지사항',
      to: '/notice?tab=news',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      description: '운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 빠르게 확인해보세요.',
    },
    {
      label: '자료실',
      to: '/notice?tab=resources',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      description: '설치 안내, 현장 체크리스트, 문서형 자료를 한곳에서 관리합니다.',
    },
  ],
  cs: [
    {
      label: 'FAQ',
      to: '/cs',
      imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
      description: '자주 묻는 질문과 답변을 바로 확인하고 필요한 상담 채널로 이동할 수 있습니다.',
    },
    {
      label: 'A/S 안내',
      to: '/cs/as-guide',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      description: '수리 접수 방법, 처리 일정, 방문 지원 범위 등 A/S 운영 기준을 안내합니다.',
    },
  ],
} satisfies Record<'company' | 'cases' | 'notice' | 'cs', MegaMenuLinkItem[]>;

export const MEGA_MENU_PREVIEW_EDITORS = [
  { key: 'company', label: '회사소개', description: '헤더 메가 메뉴의 회사소개 대표 이미지입니다.' },
  { key: 'products', label: '제품안내', description: '헤더 메가 메뉴의 제품안내 대표 이미지입니다.' },
  { key: 'cases', label: '설치사례', description: '헤더 메가 메뉴의 설치사례 대표 이미지입니다.' },
  { key: 'notice', label: '정보센터', description: '헤더 메가 메뉴의 정보센터 대표 이미지입니다.' },
  { key: 'cs', label: '고객센터', description: '헤더 메가 메뉴의 고객센터 대표 이미지입니다.' },
] as const satisfies ReadonlyArray<{
  key: PublicMegaMenuPreviewKey;
  label: string;
  description: string;
}>;

export const getMegaMenuPreviewKey = (megaMenuType?: PublicNavMegaMenuType): PublicMegaMenuPreviewKey | null => {
  switch (megaMenuType) {
    case 'company':
      return 'company';
    case 'productCategories':
      return 'products';
    case 'cases':
      return 'cases';
    case 'notice':
      return 'notice';
    case 'cs':
      return 'cs';
    default:
      return null;
  }
};

export const buildPublicMegaMenuItems = (
  _publicVisuals?: PublicVisualsContent | null,
  installationCaseCategories: string[] = [],
) => {
  const normalizedCategories = Array.from(
    new Set(installationCaseCategories.map((item) => normalizeCategoryLabel(item)).filter(Boolean)),
  );

  if (normalizedCategories.length === 0) {
    return STATIC_PUBLIC_MEGA_MENU_ITEMS;
  }

  return {
    ...STATIC_PUBLIC_MEGA_MENU_ITEMS,
    cases: normalizedCategories.map((category) => ({
      label: category,
      to: toInstallationCaseTabPath(category),
      imageUrl: STATIC_PUBLIC_MEGA_MENU_ITEMS.cases[0]?.imageUrl || '',
      description: `${category} 설치사례를 모아볼 수 있습니다.`,
    })),
  };
};

const PUBLIC_INSTITUTION_CASE_KEYWORDS = [
  '공공기관',
  '시청',
  '구청',
  '군청',
  '지자체',
  '행정',
  '관공서',
  '학교',
  '대학교',
  '교육청',
  '청소년',
  '도서관',
];

const NOTICE_RESOURCE_CATEGORIES = ['설치안내', '현장안내', '자료실'];

export const getInstallationCaseTabValue = (input: {
  title: string;
  category?: string;
  subtitle?: string;
  plainContent?: string;
}) => {
  const normalizedCategory = (input.category || '').replace(/\s+/g, '').toLowerCase();

  if (normalizedCategory.includes('공공기관')) {
    return 'public-institution';
  }

  if (normalizedCategory.includes('임시사무실')) {
    return 'temporary-office';
  }

  const normalizedText = [input.title, input.subtitle || '', input.plainContent || '']
    .join(' ')
    .toLowerCase();

  return PUBLIC_INSTITUTION_CASE_KEYWORDS.some((keyword) => normalizedText.includes(keyword.toLowerCase()))
    ? 'public-institution'
    : 'temporary-office';
};

export const getNoticeTabValue = (category: string) => {
  const normalizedCategory = category.replace(/\s+/g, '');
  return NOTICE_RESOURCE_CATEGORIES.some((item) => item === normalizedCategory) ? 'resources' : 'news';
};

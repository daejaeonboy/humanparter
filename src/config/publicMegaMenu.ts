import { getMegaMenuVisual, type PublicVisualsContent } from '../content/publicVisualsContent';

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

export const COMPANY_SECTION_TABS: FilterTabItem[] = [
  { label: '회사 개요', value: 'company-overview', to: '/company' },
  { label: '사업영역', value: 'company-business', to: '/company/business' },
  { label: '비전', value: 'company-vision', to: '/company/vision' },
  { label: '오시는길', value: 'company-location', to: '/company/location' },
];

export const INSTALLATION_CASE_FILTER_TABS: FilterTabItem[] = [
  { label: '전체', value: 'all', to: '/cases' },
  { label: '임시사무실', value: 'temporary-office', to: '/cases?tab=temporary-office' },
  { label: '공공기관', value: 'public-institution', to: '/cases?tab=public-institution' },
];

export const NOTICE_FILTER_TABS: FilterTabItem[] = [
  { label: '전체', value: 'all', to: '/notice' },
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
      label: '사업영역',
      to: '/company/business',
      imageUrl: '/company/service-01.jpg',
      description: '사무가구, IT 장비, 현장 운영까지 휴먼파트너의 핵심 사업영역을 살펴볼 수 있습니다.',
    },
    {
      label: '비전',
      to: '/company/vision',
      imageUrl: '/company/service-02.png',
      description: '공간과 운영을 함께 설계하는 휴먼파트너의 서비스 방향성을 살펴볼 수 있습니다.',
    },
    {
      label: '오시는길',
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
      description: '단기 프로젝트와 임시 업무공간을 위한 설치 사례를 빠르게 모아볼 수 있습니다.',
    },
    {
      label: '공공기관',
      to: '/cases?tab=public-institution',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      description: '공공기관과 교육 현장 중심의 구축 사례를 확인할 수 있습니다.',
    },
  ],
  notice: [
    {
      label: '공지사항',
      to: '/notice?tab=news',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      description: '운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 모아볼 수 있습니다.',
    },
    {
      label: '자료실',
      to: '/notice?tab=resources',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      description: '설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 확인할 수 있습니다.',
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
      description: '장애 접수 방법과 처리 절차, 방문 지원 범위 등 A/S 운영 기준을 확인할 수 있습니다.',
    },
  ],
} satisfies Record<string, MegaMenuLinkItem[]>;

export const buildPublicMegaMenuItems = (publicVisuals?: PublicVisualsContent | null) => {
  if (!publicVisuals) {
    return STATIC_PUBLIC_MEGA_MENU_ITEMS;
  }

  return {
    company: STATIC_PUBLIC_MEGA_MENU_ITEMS.company.map((item) => ({
      ...item,
      ...getMegaMenuVisual(publicVisuals, 'company', item.to),
    })),
    cases: STATIC_PUBLIC_MEGA_MENU_ITEMS.cases.map((item) => ({
      ...item,
      ...getMegaMenuVisual(publicVisuals, 'cases', item.to),
    })),
    notice: STATIC_PUBLIC_MEGA_MENU_ITEMS.notice.map((item) => ({
      ...item,
      ...getMegaMenuVisual(publicVisuals, 'notice', item.to),
    })),
    cs: STATIC_PUBLIC_MEGA_MENU_ITEMS.cs.map((item) => ({
      ...item,
      ...getMegaMenuVisual(publicVisuals, 'cs', item.to),
    })),
  } satisfies Record<string, MegaMenuLinkItem[]>;
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
  '대학',
];

const NOTICE_RESOURCE_CATEGORIES = ['설치안내', '현장안내', '자료실'];

export const getInstallationCaseTabValue = (input: {
  title: string;
  subtitle?: string;
  plainContent?: string;
}) => {
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

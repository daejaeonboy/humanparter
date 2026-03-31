export type PublicNavIcon = 'building2' | 'layoutGrid' | 'boxes' | 'bell' | 'headset' | 'send';
export type PublicNavMegaMenuType = 'company' | 'productCategories' | 'cases' | 'notice' | 'cs';

export interface PublicNavItem {
  label: string;
  path: string;
  icon: PublicNavIcon;
  cta?: boolean;
  megaMenuType?: PublicNavMegaMenuType;
}

export const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { label: '회사 소개', path: '/company', icon: 'building2', megaMenuType: 'company' },
  { label: '렌탈 품목', path: '/products', icon: 'boxes', megaMenuType: 'productCategories' },
  { label: '설치 사례', path: '/cases', icon: 'layoutGrid', megaMenuType: 'cases' },
  { label: '공지사항', path: '/notice', icon: 'bell', megaMenuType: 'notice' },
  { label: '고객센터', path: '/cs', icon: 'headset', megaMenuType: 'cs' },
  { label: '견적 요청', path: '/quote-request', icon: 'send', cta: true },
];

export const isPublicNavActive = (pathname: string, item: PublicNavItem) => {
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

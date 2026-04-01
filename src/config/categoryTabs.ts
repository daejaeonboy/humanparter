import type { NavMenuItem } from '../api/cmsApi';

export interface CategoryTabItem {
  name: string;
  to: string;
  imageUrl: string;
  description: string;
}

const CATEGORY_TAB_IMAGE_MAP: Record<string, string> = {
  '사무가구': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  'IT장비': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  '사무기기': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  '가전제품': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  '행사용품': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
};

const CATEGORY_TAB_DESCRIPTION_MAP: Record<string, string> = {
  전체: '기업 환경과 프로젝트 목적에 맞는 렌탈 품목을 카테고리별로 빠르게 비교해보세요.',
  사무가구: '책상, 의자, 수납장 등 업무 공간의 기본 구성을 한 번에 살펴볼 수 있습니다.',
  IT장비: '노트북, 모니터, 주변기기까지 업무용 IT 장비를 빠르게 구성할 수 있습니다.',
  사무기기: '복합기, 프린터 등 사무 운영에 필요한 주요 기기를 확인할 수 있습니다.',
  가전제품: '업무 편의와 공간 운영에 필요한 생활가전과 편의 장비를 둘러보세요.',
  행사용품: '행사, 전시, 단기 프로젝트에 맞는 운영 물품을 빠르게 찾을 수 있습니다.',
};

const DEFAULT_CATEGORY_ORDER = ['사무가구', 'IT장비', '사무기기', '가전제품', '행사용품'];
const DEFAULT_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80';

const DEFAULT_CATEGORY_DESCRIPTION = CATEGORY_TAB_DESCRIPTION_MAP.전체;

const createCategoryLink = (category?: string) => {
  const params = new URLSearchParams();
  if (category && category !== '전체') {
    params.set('category', category);
  }

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
};

const findParentNavItem = (name: string | undefined, navItems: NavMenuItem[] = []) => {
  const normalizedName = name?.trim();
  if (!normalizedName) return undefined;

  return navItems.find((item) => !item.category?.trim() && item.name?.trim() === normalizedName);
};

export const getCategoryTabImage = (name?: string, navItems: NavMenuItem[] = []) => {
  const matched = findParentNavItem(name, navItems);
  if (matched?.image_url?.trim()) return matched.image_url.trim();
  if (!name) return DEFAULT_CATEGORY_IMAGE;
  return CATEGORY_TAB_IMAGE_MAP[name] || DEFAULT_CATEGORY_IMAGE;
};

export const getCategoryTabDescription = (name?: string, navItems: NavMenuItem[] = []) => {
  const matched = findParentNavItem(name, navItems);
  if (matched?.description?.trim()) return matched.description.trim();
  if (!name) return DEFAULT_CATEGORY_DESCRIPTION;
  return CATEGORY_TAB_DESCRIPTION_MAP[name] || `${name} 카테고리의 기업용 렌탈 품목을 빠르게 확인해보세요.`;
};

const toCategoryTabItem = (name: string, navItems: NavMenuItem[] = []): CategoryTabItem => ({
  name,
  to: createCategoryLink(name),
  imageUrl: getCategoryTabImage(name, navItems),
  description: getCategoryTabDescription(name, navItems),
});

export const FALLBACK_CATEGORY_TAB_ITEMS = DEFAULT_CATEGORY_ORDER.map((name) => toCategoryTabItem(name));

export const buildCategoryTabItems = (navItems: NavMenuItem[]): CategoryTabItem[] => {
  const parentNames = navItems
    .filter((item) => !item.category?.trim())
    .sort((a, b) => {
      const orderA = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    })
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));

  const uniqueParentNames = Array.from(new Set(parentNames));

  if (uniqueParentNames.length === 0) {
    return FALLBACK_CATEGORY_TAB_ITEMS;
  }

  return uniqueParentNames.map((name) => toCategoryTabItem(name, navItems));
};

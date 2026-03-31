import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { Container } from "../ui/Container";
import { siteBrand } from "../../src/config/siteBrand";
import { getNavMenuItems } from "../../src/api/cmsApi";
import { buildCategoryTabItems, FALLBACK_CATEGORY_TAB_ITEMS, type CategoryTabItem } from "../../src/config/categoryTabs";
import { STATIC_PUBLIC_MEGA_MENU_ITEMS, type MegaMenuLinkItem } from "../../src/config/publicMegaMenu";
import { isPublicNavActive, PUBLIC_NAV_ITEMS, type PublicNavItem } from "../../src/config/publicNavigation";
import { useAuth } from "../../src/context/AuthContext";

const DEFAULT_PRODUCT_MEGA_MENU_ITEM: MegaMenuLinkItem = {
  label: "전체",
  to: "/products",
  description: "휴먼파트너의 전체 렌탈 품목을 한눈에 확인해보세요.",
  imageUrl:
    FALLBACK_CATEGORY_TAB_ITEMS[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
};

const PRODUCT_MEGA_MENU_COPY: Record<string, string> = {
  IT장비: "노트북과 모니터 등 업무용 IT 장비를 빠르게 구성할 수 있습니다.",
  사무기기: "프린터, 복합기 등 사무 운영에 필요한 기기를 모아볼 수 있습니다.",
  사무가구: "책상, 의자, 수납장 등 기본 오피스 가구 구성을 확인해보세요.",
  가전제품: "업무 공간에 필요한 생활가전과 편의 장비를 둘러볼 수 있습니다.",
  행사용품: "행사와 단기 프로젝트에 맞는 운영 물품을 빠르게 찾을 수 있습니다.",
};

const getMegaMenuDescription = (name: string) =>
  PRODUCT_MEGA_MENU_COPY[name] || `${name} 카테고리 렌탈 품목을 바로 확인해보세요.`;

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [activeMegaMenuPath, setActiveMegaMenuPath] = useState<string | null>(null);
  const [activeMegaMenuIndex, setActiveMegaMenuIndex] = useState(0);
  const [productMegaMenuItems, setProductMegaMenuItems] = useState<CategoryTabItem[]>(FALLBACK_CATEGORY_TAB_ITEMS);
  const primaryNavItems = PUBLIC_NAV_ITEMS.filter((item) => !item.cta);
  const ctaNavItem = PUBLIC_NAV_ITEMS.find((item) => item.cta);
  const loginPath = "/admin/login";
  const isAdminSession = !loading && !!user && isAdmin;
  const activeMegaMenuItem = primaryNavItems.find((item) => item.path === activeMegaMenuPath) || null;

  const megaMenuItems = useMemo<MegaMenuLinkItem[]>(() => {
    if (!activeMegaMenuItem?.megaMenuType) return [];

    if (activeMegaMenuItem.megaMenuType === "productCategories") {
      return [
        DEFAULT_PRODUCT_MEGA_MENU_ITEM,
        ...productMegaMenuItems.map((item) => ({
          label: item.name,
          to: item.to,
          imageUrl: item.imageUrl,
          description: getMegaMenuDescription(item.name),
        })),
      ];
    }

    return STATIC_PUBLIC_MEGA_MENU_ITEMS[activeMegaMenuItem.megaMenuType] || [];
  }, [activeMegaMenuItem, productMegaMenuItems]);

  const activeMegaMenuPreview = megaMenuItems[Math.min(activeMegaMenuIndex, Math.max(megaMenuItems.length - 1, 0))] || null;

  const getSubMenuItems = (megaMenuType?: string) => {
    if (!megaMenuType) return [];
    if (megaMenuType === "productCategories") {
      return [
        DEFAULT_PRODUCT_MEGA_MENU_ITEM,
        ...productMegaMenuItems.map((item) => ({
          label: item.name,
          to: item.to,
          imageUrl: item.imageUrl,
          description: getMegaMenuDescription(item.name),
        })),
      ];
    }
    return (STATIC_PUBLIC_MEGA_MENU_ITEMS as any)[megaMenuType] || [];
  };

  useEffect(() => {
    let isMounted = true;

    const loadMegaMenuItems = async () => {
      try {
        const navItems = await getNavMenuItems();
        if (!isMounted) return;
        setProductMegaMenuItems(buildCategoryTabItems(navItems));
      } catch (error) {
        console.error("Failed to load mega menu items:", error);
      }
    };

    void loadMegaMenuItems();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuMounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuMounted]);

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuMounted(true);
      return;
    }

    if (!mobileMenuMounted) return;
    const timeout = window.setTimeout(() => setMobileMenuMounted(false), 320);
    return () => window.clearTimeout(timeout);
  }, [mobileMenuMounted, mobileMenuOpen]);

  useEffect(() => {
    setActiveMegaMenuPath(null);
  }, [location.pathname]);

  useEffect(() => {
    if (megaMenuItems.length === 0) {
      setActiveMegaMenuIndex(0);
      return;
    }

    if (activeMegaMenuIndex >= megaMenuItems.length) {
      setActiveMegaMenuIndex(0);
    }
  }, [activeMegaMenuIndex, megaMenuItems.length]);

  const openMobileMenu = () => {
    setMobileMenuMounted(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMobileMenuOpen(true));
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setExpandedMobileItem(null);
  };

  const toggleMobileItem = (label: string) => {
    setExpandedMobileItem(expandedMobileItem === label ? null : label);
  };

  const openMegaMenu = (item: PublicNavItem) => {
    if (!item.megaMenuType) {
      setActiveMegaMenuPath(null);
      return;
    }

    setActiveMegaMenuPath(item.path);
    setActiveMegaMenuIndex(0);
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="relative" onMouseLeave={() => setActiveMegaMenuPath(null)}>
        <Container size="wide">
          <div className="flex h-[80px] items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-20 lg:gap-32">
              <Link
                to="/"
                onMouseEnter={() => setActiveMegaMenuPath(null)}
                className="shrink-0 flex items-center text-xl font-medium tracking-tight text-black md:text-2xl"
              >
                <img
                  src="/logo.png"
                  alt={siteBrand.header.logoText}
                  className="h-[48px] w-auto object-contain"
                />
              </Link>

              <nav className="hidden items-center gap-10 md:flex">
                {primaryNavItems.map((item) => {
                  const isActive = isPublicNavActive(location.pathname, item);
                  const isMegaMenuOpen = activeMegaMenuPath === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onMouseEnter={() => openMegaMenu(item)}
                      onFocus={() => openMegaMenu(item)}
                      className={`whitespace-nowrap text-[16px] font-medium tracking-tight transition ${
                        isActive || isMegaMenuOpen ? "text-[#001E45]" : "text-slate-800 hover:text-[#001E45]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="hidden shrink-0 items-center gap-3 md:flex">
              {isAdminSession ? (
                <>
                  <Link
                    to="/admin"
                    onMouseEnter={() => setActiveMegaMenuPath(null)}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-[15px] font-semibold tracking-tight text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    관리자
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    onMouseEnter={() => setActiveMegaMenuPath(null)}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-[15px] font-semibold tracking-tight text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  to={loginPath}
                  onMouseEnter={() => setActiveMegaMenuPath(null)}
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-[15px] font-semibold tracking-tight text-slate-800 transition-colors hover:bg-slate-50"
                >
                  로그인
                </Link>
              )}

              {ctaNavItem && (
                <Link
                  to={ctaNavItem.path}
                  onMouseEnter={() => setActiveMegaMenuPath(null)}
                  className={`inline-flex h-12 items-center justify-center rounded-lg px-7 text-[16px] font-semibold tracking-tight text-white transition-colors ${
                    isPublicNavActive(location.pathname, ctaNavItem)
                      ? "bg-[#001E45]"
                      : "bg-[#001E45] hover:bg-[#0b2a5a]"
                  }`}
                >
                  {ctaNavItem.label}
                </Link>
              )}
            </div>

            <button
              onClick={openMobileMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-none text-black md:hidden"
              aria-label="모바일 메뉴 열기"
            >
              <Menu size={24} />
            </button>
          </div>
        </Container>

        {activeMegaMenuItem && activeMegaMenuPreview && (
          <>
            <div 
              className="fixed inset-0 top-[80px] z-30 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn pointer-events-none" 
              aria-hidden="true"
            />
            
            <div className="absolute inset-x-0 top-full z-40 hidden border-t border-slate-100 bg-white shadow-xl md:block overflow-hidden">
              <Container size="wide" className="h-[480px] flex !p-0 mx-auto">
                <div className="flex-1 flex pl-4 md:pl-8 items-start pt-16">
                  <div className="invisible shrink-0 mr-20 lg:mr-32">
                     <img src="/logo.png" className="h-[48px] w-auto" alt="" />
                  </div>

                  <div>
                    <h2 className="mb-10 text-[24px] font-medium tracking-tight text-slate-900">
                      {activeMegaMenuItem.label}
                    </h2>
                    <div className="flex flex-col space-y-6">
                      {megaMenuItems.map((item, index) => {
                        const isCurrent = activeMegaMenuIndex === index;
                        return (
                          <Link
                            key={item.label}
                            to={item.to}
                            onMouseEnter={() => setActiveMegaMenuIndex(index)}
                            className={`text-[17px] transition-colors ${
                              isCurrent ? "font-medium text-[#001E45]" : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="w-[55%] lg:w-[50%] xl:w-[48%] h-full pr-4 md:pr-8 relative">
                  <img
                    src={activeMegaMenuPreview.imageUrl}
                    alt={activeMegaMenuPreview.label}
                    className="h-full w-full object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 right-4 md:right-8 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <p className="text-sm font-medium opacity-80">{activeMegaMenuItem.label}</p>
                    <h3 className="text-3xl font-medium mt-1">{activeMegaMenuPreview.label}</h3>
                  </div>
                </div>
              </Container>
            </div>
          </>
        )}
      </div>

      {mobileMenuMounted && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobileMenu}
            aria-label="모바일 메뉴 닫기"
          />

          <aside
            className={`absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <span className="text-lg font-medium tracking-tight text-black">
                <img src="/logo.png" alt={siteBrand.header.logoText} className="h-[32px] w-auto object-contain" />
              </span>
              <button
                onClick={closeMobileMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-black transition-colors hover:bg-slate-200"
                aria-label="모바일 메뉴 닫기 버튼"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <nav className="space-y-1">
                {primaryNavItems.map((item) => {
                  const isActive = isPublicNavActive(location.pathname, item);
                  const subMenuItems = getSubMenuItems(item.megaMenuType);
                  const isExpanded = expandedMobileItem === item.label;

                  return (
                    <div key={item.path} className="border-b border-slate-50 last:border-0">
                      <div className="flex items-center justify-between">
                        <Link
                          to={item.path}
                          onClick={closeMobileMenu}
                          className={`flex-1 py-4 text-[17px] font-semibold transition ${
                            isActive ? "text-[#001E45]" : "text-slate-900"
                          }`}
                        >
                          {item.label}
                        </Link>
                        {subMenuItems.length > 0 && (
                          <button
                            onClick={() => toggleMobileItem(item.label)}
                            className="p-4 text-slate-400"
                            aria-label={`${item.label} 하위 메뉴 열기`}
                          >
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>
                      
                      {isExpanded && subMenuItems.length > 0 && (
                        <div className="bg-slate-50/50 rounded-xl mb-4 py-2">
                          {subMenuItems.map((subItem: any) => (
                            <Link
                              key={subItem.label}
                              to={subItem.to}
                              onClick={closeMobileMenu}
                              className="block px-6 py-3 text-[15px] text-slate-600 hover:text-[#001E45]"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-100 p-6 space-y-4">
              {ctaNavItem && (
                <Link
                  to={ctaNavItem.path}
                  onClick={closeMobileMenu}
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-[#001E45] text-[16px] font-medium text-white shadow-lg shadow-[#001E45]/10 active:scale-[0.98] transition-transform"
                >
                  {ctaNavItem.label}
                </Link>
              )}

              {isAdminSession ? (
                <>
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    관리자
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      void logout();
                    }}
                    className="flex w-full items-center justify-center py-2 text-[14px] font-medium text-slate-500 hover:text-slate-900"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  to={loginPath}
                  onClick={closeMobileMenu}
                  className="flex w-full items-center justify-center py-2 text-[14px] font-medium text-slate-500 hover:text-slate-900"
                >
                  로그인
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};

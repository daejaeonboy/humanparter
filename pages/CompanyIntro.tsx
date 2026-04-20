import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { NaverMapEmbed } from '../components/company/NaverMapEmbed';
import { CompanySectionsEditor } from '../components/company/CompanySectionsEditor';
import { Seo } from '../components/Seo';
import { Container } from '../components/ui/Container';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { saveCompanyPageContent } from '../src/api/companyContentApi';
import { getPublicCompanyData, invalidatePublicDataCache } from '../src/api/publicDataApi';
import { useAuth } from '../src/context/AuthContext';
import {
  COMPANY_BODY_SECTION_KEY_BY_TAB,
  defaultCompanyPageContent,
  type CompanyPageContent,
  type CompanySectionTabValue,
} from '../src/data/companyPageContent';
import { normalizeCompanyPageContent } from '../src/content/companyPageContent';
import { COMPANY_SECTION_TABS } from '../src/config/publicMegaMenu';
import { usePrerenderData } from '../src/prerender/context';
import { buildBreadcrumbStructuredData, buildLocalBusinessStructuredData, buildSeoTitle, SITE_URL, toAbsoluteUrl } from '../src/utils/seo';

const COMPANY_SECTION_PATHS: Record<string, CompanySectionTabValue> = {
  '/company': 'company-overview',
  '/company/business': 'company-business',
  '/company/vision': 'company-vision',
  '/company/location': 'company-location',
};

const COMPANY_SECTION_META: Record<
  CompanySectionTabValue,
  {
    title: string;
    description: string;
    canonicalPath: string;
  }
> = {
  'company-overview': {
    title: buildSeoTitle('회사소개'),
    description: '휴먼파트너의 운영 경험과 B2B 렌탈 파트너로서의 강점을 확인해보세요.',
    canonicalPath: '/company',
  },
  'company-business': {
    title: buildSeoTitle('사업영역'),
    description: '사무가구, IT 장비, 현장 운영까지 휴먼파트너의 핵심 사업영역을 안내합니다.',
    canonicalPath: '/company/business',
  },
  'company-vision': {
    title: buildSeoTitle('비전'),
    description: '공간과 운영을 함께 설계하는 휴먼파트너의 서비스 방향성과 운영 기준을 확인해보세요.',
    canonicalPath: '/company/vision',
  },
  'company-location': {
    title: buildSeoTitle('오시는 길'),
    description: '휴먼파트너 위치와 연락처, 상담 안내를 확인하고 네이버 지도로 길찾기할 수 있습니다.',
    canonicalPath: '/company/location',
  },
};

export const CompanyIntro: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const preloadedCompanyContent = usePrerenderData()?.company?.content;
  const normalizedPreloadedCompanyContent = preloadedCompanyContent
    ? normalizeCompanyPageContent(preloadedCompanyContent)
    : null;
  const activeSection = COMPANY_SECTION_PATHS[location.pathname] || 'company-overview';
  const activeTab = COMPANY_SECTION_TABS.find((tab) => tab.value === activeSection) || COMPANY_SECTION_TABS[0];
  const pageMeta = COMPANY_SECTION_META[activeSection];

  const [companyContent, setCompanyContent] = useState<CompanyPageContent>(normalizedPreloadedCompanyContent || defaultCompanyPageContent);
  const [draftContent, setDraftContent] = useState<CompanyPageContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [activeSection, isEditing]);

  useEffect(() => {
    let mounted = true;

    const loadCompanyContent = async () => {
      try {
        if (normalizedPreloadedCompanyContent && mounted) {
          setCompanyContent(normalizedPreloadedCompanyContent);
        }

        const { content } = await getPublicCompanyData();
        if (mounted) {
          setCompanyContent(content);
        }
      } catch (error) {
        console.error('Failed to load company content:', error);
      }
    };

    void loadCompanyContent();

    return () => {
      mounted = false;
    };
  }, [normalizedPreloadedCompanyContent]);

  const canInlineEdit = !authLoading && !!user && !!userProfile && isAdmin;
  const activeHtml = companyContent.bodySections[COMPANY_BODY_SECTION_KEY_BY_TAB[activeSection]];

  const startInlineEdit = () => {
    setDraftContent(companyContent);
    setIsEditing(true);
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const cancelInlineEdit = () => {
    setDraftContent(null);
    setIsEditing(false);
  };

  const handleSaveInline = async () => {
    if (!draftContent) return;
    setSaving(true);
    try {
      const saved = await saveCompanyPageContent(draftContent);
      invalidatePublicDataCache();
      setCompanyContent(normalizeCompanyPageContent(saved));
      setDraftContent(null);
      setIsEditing(false);
      alert(`${activeTab.label} 콘텐츠를 저장했습니다.`);
    } catch (error) {
      console.error('Failed to save company content:', error);
      alert('저장에 실패했습니다. Supabase에서 `sql/create_page_contents_table.sql`을 먼저 실행해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white selection:bg-[#001e45] selection:text-white"
      style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      <Seo
        title={pageMeta.title}
        description={pageMeta.description}
        canonicalPath={pageMeta.canonicalPath}
        structuredData={[
          buildBreadcrumbStructuredData(
            activeSection === 'company-overview'
              ? [
                  { name: '홈', path: '/' },
                  { name: '기업소개', path: '/company' },
                ]
              : [
                  { name: '홈', path: '/' },
                  { name: '기업소개', path: '/company' },
                  { name: activeTab.label, path: pageMeta.canonicalPath },
                ],
          ),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: pageMeta.title,
            description: pageMeta.description,
            url: toAbsoluteUrl(pageMeta.canonicalPath),
            about: {
              '@type': 'Organization',
              name: '휴먼파트너',
              url: SITE_URL,
            },
          },
          ...(activeSection === 'company-location' ? [buildLocalBusinessStructuredData()] : []),
        ]}
      />

      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <section className="relative overflow-visible bg-slate-950 text-white">
        <div className="relative flex h-[280px] items-center justify-center overflow-hidden md:h-[420px]">
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,18,46,0.95)_0%,rgba(1,12,34,0.84)_46%,rgba(0,7,22,0.96)_100%)]" />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.22)_100%)]" />
          <ResponsiveImage
            src={companyContent.hero.imageUrl}
            alt={companyContent.hero.title}
            kind="hero"
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover opacity-48"
          />

          {canInlineEdit && !isEditing && (
            <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
              <PublicPageEditButton onClick={startInlineEdit} label={`${activeTab.label} 수정`} />
            </div>
          )}

          <Container size="layout" className="relative z-20 flex flex-col items-center px-4 py-6 text-center md:py-16">
            <h1 className="animate-on-scroll text-[32px] font-bold leading-[1.2] tracking-[-0.04em] text-white md:text-[62px]">
              {companyContent.hero.title}
            </h1>
            <div
              className="animate-on-scroll mt-3 max-w-3xl break-keep text-[16px] leading-[1.6] text-slate-200 md:mt-8 md:text-[22px] md:leading-[1.65]"
              dangerouslySetInnerHTML={{ __html: companyContent.hero.description.replace(/\n/g, '<br />') }}
            />
          </Container>
        </div>

        <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-[980px] -translate-x-1/2 translate-y-1/2 px-4 md:px-0">
          {/* Desktop View */}
          <div className="hidden border border-slate-200 bg-white md:block">
            <div className="flex min-w-max overflow-hidden md:min-w-0">
              {COMPANY_SECTION_TABS.map((tab, index) => {
                const isLast = index === COMPANY_SECTION_TABS.length - 1;
                const isActive = activeSection === tab.value;

                return (
                  <Link
                    key={tab.value}
                    to={tab.to}
                    className={`min-w-[180px] flex-1 px-5 py-4 text-center text-sm font-semibold transition md:text-base ${
                      isActive
                        ? 'bg-[#eeeeee] text-slate-900'
                        : 'bg-white text-slate-700 hover:bg-[#f5f5f5]'
                    } ${isLast ? '' : 'border-r border-slate-200'}`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Dropdown View */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setIsTabOpen(!isTabOpen)}
              className="flex w-full items-center justify-between border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-900 shadow-lg"
            >
              <span>{activeTab.label}</span>
              <div className={`transition-transform duration-300 ${isTabOpen ? 'rotate-180' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
            
            {isTabOpen && (
              <div className="absolute left-0 top-full mt-1 w-full border border-slate-200 bg-white shadow-xl">
                {COMPANY_SECTION_TABS.map((tab) => {
                  const isActive = activeSection === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => {
                        navigate(tab.to);
                        setIsTabOpen(false);
                      }}
                      className={`block w-full px-5 py-4 text-left text-sm font-semibold transition ${
                        isActive ? 'bg-[#eeeeee] text-[#001e45]' : 'bg-white text-slate-700 active:bg-slate-50'
                      } border-b border-slate-100 last:border-0`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white pb-24 pt-28 md:pb-28 md:pt-32">
        <Container size="layout">
          <div className={`mx-auto ${isEditing ? 'max-w-[1080px]' : 'max-w-[980px]'}`}>
            {isEditing && (
              <div ref={editorRef} className="mb-12">
                <CompanySectionsEditor
                  content={draftContent || companyContent}
                  onChange={(nextContent) => setDraftContent(nextContent)}
                  onSave={handleSaveInline}
                  onCancel={cancelInlineEdit}
                  saving={saving}
                  defaultSection={activeSection}
                  sectionValues={[activeSection]}
                  title={`${activeTab.label} 수정`}
                  showHeroFields={false}
                  showOverviewImageField={false}
                />
              </div>
            )}

            {!isEditing && (
              <>
                <div
                  className="prose prose-slate mx-auto max-w-[860px] text-[16px] leading-[2.05] text-slate-700 md:text-[18px] md:leading-[2.1] [&_h2]:mt-0 [&_h2]:mb-8 [&_h2]:text-[30px] [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:leading-[1.25] [&_h2]:text-slate-900 md:[&_h2]:mb-10 md:[&_h2]:text-[44px] [&_h3]:mt-16 [&_h3]:mb-5 [&_h3]:text-[24px] [&_h3]:font-bold [&_h3]:tracking-[-0.02em] [&_h3]:leading-[1.35] [&_h3]:text-slate-900 [&_p]:my-5 [&_p]:break-keep [&_strong]:font-bold [&_ul]:my-6 [&_ul]:space-y-3 [&_li]:leading-[1.9] [&_img]:my-8 [&_img]:w-full [&_img]:rounded-[10px] [&_img]:border [&_img]:border-slate-200 [&_img]:shadow-sm md:[&_img]:my-10"
                  dangerouslySetInnerHTML={{ __html: activeHtml }}
                />

                {activeSection === 'company-location' && (
                  <div className="mt-12">
                    <NaverMapEmbed
                      address={companyContent.location.address}
                      title="휴먼파트너"
                      naverMapUrl={companyContent.location.naverMapUrl}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};

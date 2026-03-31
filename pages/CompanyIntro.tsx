import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { RichTextEditor } from '../components/admin/RichTextEditor';
import { NaverMapEmbed } from '../components/company/NaverMapEmbed';
import { Seo } from '../components/Seo';
import { Container } from '../components/ui/Container';
import { getCompanyPageContent, saveCompanyPageContent } from '../src/api/companyContentApi';
import { useAuth } from '../src/context/AuthContext';
import {
  COMPANY_BODY_SECTION_KEY_BY_TAB,
  defaultCompanyPageContent,
  type CompanyPageContent,
  type CompanySectionTabValue,
} from '../src/data/companyPageContent';
import { COMPANY_SECTION_TABS } from '../src/config/publicMegaMenu';
import { buildBreadcrumbStructuredData, SITE_URL, toAbsoluteUrl } from '../src/utils/seo';

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
    title: '회사 개요 | 휴먼파트너',
    description: '휴먼파트너의 운영 경험과 B2B 렌탈 파트너로서의 강점을 확인해보세요.',
    canonicalPath: '/company',
  },
  'company-business': {
    title: '사업영역 | 휴먼파트너',
    description: '사무가구, IT 장비, 현장 운영까지 휴먼파트너의 핵심 사업영역을 안내합니다.',
    canonicalPath: '/company/business',
  },
  'company-vision': {
    title: '비전 | 휴먼파트너',
    description: '공간과 운영을 함께 설계하는 휴먼파트너의 서비스 방향성과 운영 기준을 확인해보세요.',
    canonicalPath: '/company/vision',
  },
  'company-location': {
    title: '오시는길 | 휴먼파트너',
    description: '휴먼파트너 위치와 연락처, 상담 안내를 확인하고 네이버 지도로 길찾기할 수 있습니다.',
    canonicalPath: '/company/location',
  },
};

const FIRST_HEADING_PATTERN = /<h2\b[^>]*>([\s\S]*?)<\/h2>/i;

const stripHtmlTags = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const splitSectionHtml = (html: string, fallbackTitle: string) => {
  const match = html.match(FIRST_HEADING_PATTERN);
  if (!match) {
    return {
      title: fallbackTitle,
      bodyHtml: html,
    };
  }

  return {
    title: stripHtmlTags(match[1]) || fallbackTitle,
    bodyHtml: html.replace(FIRST_HEADING_PATTERN, '').trim(),
  };
};

const mergeSectionHtml = (title: string, bodyHtml: string) => {
  const safeTitle = title.trim() ? `<h2>${escapeHtml(title.trim())}</h2>` : '';
  const safeBodyHtml = bodyHtml.trim();
  return [safeTitle, safeBodyHtml].filter(Boolean).join('');
};

export const CompanyIntro: React.FC = () => {
  const location = useLocation();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const activeSection = COMPANY_SECTION_PATHS[location.pathname] || 'company-overview';
  const activeTab = COMPANY_SECTION_TABS.find((tab) => tab.value === activeSection) || COMPANY_SECTION_TABS[0];
  const pageMeta = COMPANY_SECTION_META[activeSection];

  const [companyContent, setCompanyContent] = useState<CompanyPageContent>(defaultCompanyPageContent);
  const [draftSectionTitle, setDraftSectionTitle] = useState('');
  const [draftSectionHtml, setDraftSectionHtml] = useState('');
  const [isEditing, setIsEditing] = useState(false);
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
        const content = await getCompanyPageContent();
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
  }, []);

  useEffect(() => {
    const sectionKey = COMPANY_BODY_SECTION_KEY_BY_TAB[activeSection];
    const sectionState = splitSectionHtml(companyContent.bodySections[sectionKey], activeTab.label);
    setDraftSectionTitle(sectionState.title);
    setDraftSectionHtml(sectionState.bodyHtml);
    setIsEditing(false);
  }, [activeSection, activeTab.label, companyContent]);

  const canInlineEdit = !authLoading && !!user && !!userProfile && isAdmin;
  const activeHtml = companyContent.bodySections[COMPANY_BODY_SECTION_KEY_BY_TAB[activeSection]];

  const startInlineEdit = () => {
    const sectionState = splitSectionHtml(
      companyContent.bodySections[COMPANY_BODY_SECTION_KEY_BY_TAB[activeSection]],
      activeTab.label,
    );
    setDraftSectionTitle(sectionState.title);
    setDraftSectionHtml(sectionState.bodyHtml);
    setIsEditing(true);
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const cancelInlineEdit = () => {
    const sectionState = splitSectionHtml(
      companyContent.bodySections[COMPANY_BODY_SECTION_KEY_BY_TAB[activeSection]],
      activeTab.label,
    );
    setDraftSectionTitle(sectionState.title);
    setDraftSectionHtml(sectionState.bodyHtml);
    setIsEditing(false);
  };

  const handleSaveInline = async () => {
    setSaving(true);
    try {
      const bodyKey = COMPANY_BODY_SECTION_KEY_BY_TAB[activeSection];
      const nextContent: CompanyPageContent = {
        ...companyContent,
        bodySections: {
          ...companyContent.bodySections,
          [bodyKey]: mergeSectionHtml(draftSectionTitle, draftSectionHtml),
        },
      };
      const saved = await saveCompanyPageContent(nextContent);
      setCompanyContent(saved);
      setIsEditing(false);
      alert(`${activeTab.label} 본문을 저장했습니다.`);
    } catch (error) {
      console.error('Failed to save company content:', error);
      alert('저장에 실패했습니다. Supabase에서 `create_page_contents_table.sql`을 먼저 실행해 주세요.');
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
        <div className="relative flex h-[420px] items-center justify-center overflow-hidden md:h-[520px]">
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,18,46,0.95)_0%,rgba(1,12,34,0.84)_46%,rgba(0,7,22,0.96)_100%)]" />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.22)_100%)]" />
          <img
            src={companyContent.hero.imageUrl}
            alt={companyContent.hero.title}
            className="absolute inset-0 h-full w-full object-cover opacity-48"
          />

          {canInlineEdit && !isEditing && (
            <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
              <PublicPageEditButton onClick={startInlineEdit} label={`${activeTab.label} 수정`} />
            </div>
          )}

          <Container size="layout" className="relative z-20 flex flex-col items-center px-4 py-14 text-center md:py-16">
            <h1 className="animate-on-scroll text-[40px] font-bold leading-[1.16] tracking-[-0.04em] text-white md:text-[78px]">
              회사 소개
            </h1>
            <div
              className="animate-on-scroll mt-8 max-w-3xl break-keep text-[18px] leading-[1.75] text-slate-200 md:text-[22px] md:leading-[1.65]"
              dangerouslySetInnerHTML={{ __html: companyContent.hero.description.replace(/\n/g, '<br />') }}
            />
          </Container>
        </div>

        <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-[980px] -translate-x-1/2 translate-y-1/2">
          <div className="overflow-x-auto border border-slate-200 bg-white">
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
        </div>
      </section>

      <section className="bg-white pb-24 pt-28 md:pb-28 md:pt-32">
        <Container size="layout">
          <div className="mx-auto max-w-[980px]">
            {isEditing && (
              <div ref={editorRef} className="mb-12">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeTab.label} 수정</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">홈페이지 안에서 현재 페이지 본문만 바로 수정합니다. 글과 이미지를 삽입해서 저장할 수 있습니다.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={cancelInlineEdit}
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveInline()}
                      disabled={saving}
                      className="inline-flex items-center rounded-xl bg-[#001e45] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#153a82] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="mb-3 text-sm font-semibold text-slate-900">제목</p>
                  <textarea
                    value={draftSectionTitle}
                    onChange={(event) => setDraftSectionTitle(event.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg font-semibold leading-8 text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="섹션 제목을 입력해 주세요."
                  />
                </div>

                <div className="mb-3">
                  <p className="text-sm font-semibold text-slate-900">본문</p>
                </div>

                <div className="mt-6">
                  <RichTextEditor
                    value={draftSectionHtml}
                    onChange={setDraftSectionHtml}
                    minHeight={520}
                    uploadFolder="company"
                    variant="plain"
                  />
                </div>
              </div>
            )}

            {!isEditing && (
              <>
                <div
                  className="prose prose-slate max-w-none text-[16px] leading-8 text-slate-700 md:text-[17px] [&_h2]:mt-0 [&_h2]:mb-6 [&_h2]:text-[30px] [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:text-slate-900 md:[&_h2]:mb-8 md:[&_h2]:text-[46px] [&_h3]:mt-12 [&_h3]:text-[22px] [&_h3]:font-bold [&_h3]:tracking-[-0.02em] [&_h3]:text-slate-900 [&_img]:w-full [&_img]:rounded-[8px] [&_img]:border [&_img]:border-slate-200 [&_img]:shadow-sm [&_p]:break-keep [&_strong]:font-bold [&_ul]:space-y-2"
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

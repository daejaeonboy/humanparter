import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { PublicCollectionHero } from '../components/PublicCollectionHero';
import { Seo } from '../components/Seo';
import { Container } from '../components/ui/Container';
import { getInstallationCases, InstallationCase } from '../src/api/cmsApi';
import { INSTALLATION_CASE_FILTER_TABS, getInstallationCaseTabValue } from '../src/config/publicMegaMenu';
import { usePrerenderData } from '../src/prerender/context';
import { stripInstallationCaseMetadata } from '../src/utils/installationCaseContent';
import { buildBreadcrumbStructuredData, toAbsoluteUrl } from '../src/utils/seo';

const CASES_PER_PAGE = 4;
const CASE_GALLERY_HERO_CONTENT: Record<string, { title: string; description: string; imageUrl: string }> = {
  all: {
    title: '설치 사례',
    description: '기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요.',
    imageUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80',
  },
  'temporary-office': {
    title: '임시사무실',
    description: '단기 프로젝트와 임시 업무공간에 맞춘 렌탈 구성 사례를 빠르게 비교해보세요.',
    imageUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80',
  },
  'public-institution': {
    title: '공공기관',
    description: '공공기관과 교육 현장 중심의 설치 사례를 통해 실제 운영 구성을 확인할 수 있습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
  },
};

const formatDisplayDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}.${parsed.getMonth() + 1}.${parsed.getDate()}`;
};

export const InstallationCasesGallery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const prerenderData = usePrerenderData();
  const preloadedCases = prerenderData?.installationCases?.cases;
  const [loading, setLoading] = useState(!preloadedCases);
  const [cases, setCases] = useState<InstallationCase[]>(preloadedCases || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const requestedTab = searchParams.get('tab') || 'all';
  const activeTab = INSTALLATION_CASE_FILTER_TABS.some((tab) => tab.value === requestedTab) ? requestedTab : 'all';
  const heroContent = CASE_GALLERY_HERO_CONTENT[activeTab] || CASE_GALLERY_HERO_CONTENT.all;

  const filteredCases = cases.filter((item) => {
    const plainContent = stripInstallationCaseMetadata(item.content);
    const matchesTab =
      activeTab === 'all' ||
      getInstallationCaseTabValue({
        title: item.title,
        subtitle: item.subtitle,
        plainContent,
      }) === activeTab;

    if (!matchesTab) return false;
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const bodyContent = plainContent.toLowerCase();

    return (
      item.title.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
      bodyContent.includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / CASES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * CASES_PER_PAGE;
  const pagedCases = filteredCases.slice(startIndex, startIndex + CASES_PER_PAGE);

  useEffect(() => {
    if (preloadedCases) {
      setCases(preloadedCases);
      setLoading(false);
      return;
    }

    const loadCases = async () => {
      try {
        const data = await getInstallationCases();
        const activeCases = data.filter((item) => item.is_active && item.image_url);
        setCases(activeCases);
      } catch (error) {
        console.error('Failed to load installation cases:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadCases();
  }, [preloadedCases]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

  const getNavigation = (item: InstallationCase) => {
    if (item.link && isExternalLink(item.link)) {
      return {
        type: 'external' as const,
        href: item.link,
      };
    }

    if (item.id) {
      return {
        type: 'internal' as const,
        to: `/cases/${item.id}`,
      };
    }

    return null;
  };

  const renderCaseLink = (item: InstallationCase, content: React.ReactNode, className: string) => {
    const navigation = getNavigation(item);

    if (!navigation) {
      return (
        <div key={item.id || item.title} className={className}>
          {content}
        </div>
      );
    }

    if (navigation.type === 'external') {
      return (
        <a
          key={item.id || item.title}
          href={navigation.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {content}
        </a>
      );
    }

    return (
      <Link key={item.id || item.title} to={navigation.to} className={className}>
        {content}
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-white pb-20 pt-0">
      {/** Keep the selected tab reflected in the URL so mega-menu links land on the right list state. */}
      <Seo
        title="휴먼파트너 설치사례 갤러리"
        description="기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요."
        canonicalPath={activeTab === 'all' ? '/cases' : `/cases?tab=${encodeURIComponent(activeTab)}`}
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: '홈', path: '/' },
            { name: '설치사례', path: '/cases' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: '휴먼파트너 설치사례 갤러리',
            description: '기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요.',
            url: toAbsoluteUrl(activeTab === 'all' ? '/cases' : `/cases?tab=${encodeURIComponent(activeTab)}`),
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: pagedCases
                .filter((item) => item.id)
                .map((item, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  name: item.title,
                  url: toAbsoluteUrl(`/cases/${item.id}`),
                })),
            },
          },
        ]}
      />

      <PublicCollectionHero
        title={heroContent.title}
        description={heroContent.description}
        imageUrl={heroContent.imageUrl}
        tabs={INSTALLATION_CASE_FILTER_TABS.map((tab) => ({ label: tab.label, value: tab.value }))}
        activeValue={activeTab}
        onSelect={(value) => setSearchParams(value === 'all' ? {} : { tab: value })}
        topRightAction={<PublicPageEditButton to="/admin/cases" />}
      />

      <Container size="layout">
        <div className="mt-20 md:mt-24">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#001e45]" size={40} />
          </div>
        ) : filteredCases.length > 0 ? (
          <>
            <section className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
              {pagedCases.map((item, index) =>
                renderCaseLink(
                  item,
                  <>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 group-hover:shadow-md">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading={index < CASES_PER_PAGE ? 'eager' : 'lazy'}
                      />
                    </div>
                    <div className="mt-5 flex flex-col px-1">
                      <h2 className="line-clamp-2 text-[16px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#001e45]">
                        {item.title}
                      </h2>
                      {formatDisplayDate(item.created_at) && (
                        <p className="mt-3 text-sm font-medium text-slate-400">
                          {formatDisplayDate(item.created_at)}
                        </p>
                      )}
                    </div>
                  </>,
                  'group block h-full',
                ),
              )}
            </section>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  이전
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-bold transition-colors ${
                      safeCurrentPage === page
                        ? 'border-[#001e45] bg-[#001e45] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white py-32 text-slate-500">
            <p>{searchTerm ? '검색 결과가 없습니다.' : '등록된 설치 사례가 없습니다.'}</p>
          </div>
        )}
        </div>
      </Container>
    </main>
  );
};

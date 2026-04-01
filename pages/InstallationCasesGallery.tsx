import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ImageIcon, Loader2, Plus, X } from 'lucide-react';
import { InstallationCaseInlineEditor, type InstallationCaseAuthoringInput } from '../components/cases/InstallationCaseInlineEditor';
import { PublicCollectionHero } from '../components/PublicCollectionHero';
import { Seo } from '../components/Seo';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { Container } from '../components/ui/Container';
import { addInstallationCase, getAllInstallationCases, type InstallationCase } from '../src/api/cmsApi';
import { getPublicCasesData, invalidatePublicDataCache, type PublicCaseSummary } from '../src/api/publicDataApi';
import { INSTALLATION_CASE_FILTER_TABS, getInstallationCaseTabValue } from '../src/config/publicMegaMenu';
import { getCollectionHeroVisual } from '../src/content/publicVisualsContent';
import { useAuth } from '../src/context/AuthContext';
import { usePublicVisuals } from '../src/hooks/usePublicVisuals';
import { usePrerenderData } from '../src/prerender/context';
import {
  stripInstallationCaseMetadata,
} from '../src/utils/installationCaseContent';
import { buildBreadcrumbStructuredData, toAbsoluteUrl } from '../src/utils/seo';

const CASES_PER_PAGE = 12;

const formatDisplayDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}.${parsed.getMonth() + 1}.${parsed.getDate()}`;
};

const toDateInputValue = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toCaseTimestamp = (value: string) => `${value}T00:00:00+09:00`;

export const InstallationCasesGallery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const prerenderData = usePrerenderData();
  const publicVisuals = usePublicVisuals();
  const preloadedCases = prerenderData?.installationCases?.cases;
  const [loading, setLoading] = useState(!preloadedCases);
  const [cases, setCases] = useState<Array<InstallationCase | PublicCaseSummary>>(preloadedCases || []);
  const [searchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<InstallationCaseAuthoringInput | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);
  const createEditorRef = useRef<HTMLDivElement>(null);
  const requestedTab = searchParams.get('tab') || 'all';
  const activeTab = INSTALLATION_CASE_FILTER_TABS.some((tab) => tab.value === requestedTab) ? requestedTab : 'all';
  const canInlineEdit = !authLoading && !!user && !!userProfile && isAdmin;
  const heroContent = getCollectionHeroVisual(
    publicVisuals,
    'cases',
    activeTab === 'temporary-office'
      ? 'temporaryOffice'
      : activeTab === 'public-institution'
        ? 'publicInstitution'
        : 'all',
  );

  useEffect(() => {
    if (isCreating) {
      createEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isCreating]);

  const filteredCases = cases.filter((item) => {
    const plainContent = stripInstallationCaseMetadata(item.content);
    const matchesTab =
      activeTab === 'all' ||
      getInstallationCaseTabValue({
        title: item.title,
        category: item.category,
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
    }

    const loadCases = async () => {
      try {
        const data = await getPublicCasesData();
        const activeCases = data.cases.filter((item) => item.is_active && item.image_url);
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

  const openCreateEditor = () => {
    setCreateDraft({
      title: '',
      category: '임시사무실',
      subtitle: '',
      created_at: toDateInputValue(new Date().toISOString()),
      image_url: '',
      contentHtml: '',
    });
    setIsCreating(true);
  };

  const closeCreateEditor = () => {
    setIsCreating(false);
    setCreateDraft(null);
  };

  const handleCreateSave = async (value: InstallationCaseAuthoringInput) => {
    setSavingCreate(true);
    try {
      const existingCases = await getAllInstallationCases();
      const nextOrder =
        existingCases.reduce((maxValue, item) => Math.max(maxValue, Number(item.display_order || 0)), 0) + 1;

      const created = await addInstallationCase({
        title: value.title.trim(),
        category: value.category.trim(),
        subtitle: value.subtitle.trim(),
        created_at: toCaseTimestamp(value.created_at),
        image_url: value.image_url.trim(),
        link: '/cases',
        content: value.contentHtml,
        display_order: nextOrder,
        is_active: true,
      });

      invalidatePublicDataCache();
      const data = await getPublicCasesData();
      setCases(data.cases.filter((item) => item.is_active && item.image_url));
      closeCreateEditor();
      navigate(`/cases/${created.id}`);
    } catch (error) {
      console.error('Failed to create installation case:', error);
      alert('설치사례 등록에 실패했습니다.');
    } finally {
      setSavingCreate(false);
    }
  };

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
      <Seo
        title="휴먼파트너 설치사례 갤러리"
        description="기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요."
        canonicalPath="/cases"
        urlPath="/cases"
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
            url: toAbsoluteUrl('/cases'),
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
        title={heroContent.title || '설치 사례'}
        description={heroContent.description}
        imageUrl={heroContent.imageUrl}
        tabs={INSTALLATION_CASE_FILTER_TABS.map((tab) => ({ label: tab.label, value: tab.value }))}
        activeValue={activeTab}
        onSelect={(value) => setSearchParams(value === 'all' ? {} : { tab: value })}
        topRightAction={
          canInlineEdit ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isCreating ? closeCreateEditor : openCreateEditor}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                {isCreating ? <X size={16} /> : <Plus size={16} />}
                {isCreating ? '등록 닫기' : '사례 등록'}
              </button>
              <Link
                to="/admin/public-visuals"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <ImageIcon size={16} />
                상단 배너 관리
              </Link>
            </div>
          ) : null
        }
      />

      <Container size="layout">
        {isCreating && createDraft && (
          <div ref={createEditorRef} className="mt-12 md:mt-16">
            <InstallationCaseInlineEditor
              title="새 설치사례 등록"
              description="공개 페이지에서 바로 새 설치사례를 작성합니다. 저장하면 상세 페이지로 이동합니다."
              initialValue={createDraft}
              submitLabel={savingCreate ? '저장 중' : '등록하고 상세로 이동'}
              saving={savingCreate}
              onCancel={closeCreateEditor}
              onSave={handleCreateSave}
            />
          </div>
        )}

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
                        <ResponsiveImage
                          src={item.image_url}
                          alt={item.title}
                          kind="card"
                          sizes="(min-width: 1280px) 24vw, (min-width: 640px) 50vw, 100vw"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          priority={index === 0}
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

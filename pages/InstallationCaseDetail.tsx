import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { InstallationCaseInlineEditor } from '../components/cases/InstallationCaseInlineEditor';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { Seo } from '../components/Seo';
import { Container } from '../components/ui/Container';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { deleteInstallationCase, getInstallationCaseById, type InstallationCase, updateInstallationCase } from '../src/api/cmsApi';
import { getPublicCaseDetailData, getPublicCasesData, invalidatePublicDataCache, subscribePublicDataInvalidation, type PublicCaseSummary } from '../src/api/publicDataApi';
import { useAuth } from '../src/context/AuthContext';
import { usePrerenderData } from '../src/prerender/context';
import {
  appendInstallationCaseGalleryImages,
  buildInstallationCaseHtmlFromBlocks,
  extractInstallationCaseContent,
} from '../src/utils/installationCaseContent';
import { buildBreadcrumbStructuredData, buildSeoTitle, normalizeMetaText, SITE_NAME, SITE_URL, toAbsoluteUrl } from '../src/utils/seo';

const TEXT = {
  notFoundTitle: '게시글을 찾을 수 없습니다.',
  notFoundDescription: '삭제되었거나 비공개 처리된 설치사례입니다.',
  backToList: '목록으로 돌아가기',
  backToCasesList: '설치사례 목록으로',
  emptyContent: '상세 내용이 아직 등록되지 않았습니다.',
  prevPost: '이전글',
  nextPost: '다음글',
  pageTitleSuffix: '설치사례',
  pageDescriptionFallback: '휴먼파트너 맞춤 렌탈 솔루션 설치 사례입니다.',
};

const formatDisplayDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
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

export const InstallationCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const prerenderData = usePrerenderData();
  const preloadedDetail = prerenderData?.installationCaseDetail;
  const preloadedCategories = prerenderData?.bootstrap?.installationCaseCategories;
  const hasPreloadedDetail = !!(id && preloadedDetail?.post?.id === id);
  const [loading, setLoading] = useState(!hasPreloadedDetail);
  const [post, setPost] = useState<InstallationCase | null>(hasPreloadedDetail ? preloadedDetail?.post || null : null);
  const [previousCase, setPreviousCase] = useState<PublicCaseSummary | null>(
    hasPreloadedDetail ? preloadedDetail?.previousCase || null : null,
  );
  const [nextCase, setNextCase] = useState<PublicCaseSummary | null>(
    hasPreloadedDetail ? preloadedDetail?.nextCase || null : null,
  );
  const [categoryOptions, setCategoryOptions] = useState<string[]>(preloadedCategories || []);
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const canInlineEdit = !authLoading && !!user && !!userProfile && isAdmin;

  useEffect(() => {
    let isMounted = true;

    if (preloadedCategories?.length) {
      setCategoryOptions(preloadedCategories);
    }

    const loadCategoryOptions = async () => {
      try {
        const data = await getPublicCasesData();
        if (isMounted) {
          setCategoryOptions(Array.isArray(data.categories) ? data.categories : []);
        }
      } catch (error) {
        console.error('Failed to load installation case categories:', error);
      }
    };

    void loadCategoryOptions();
    const unsubscribe = subscribePublicDataInvalidation(() => {
      void loadCategoryOptions();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [preloadedCategories]);

  useEffect(() => {
    let isMounted = true;

    if (hasPreloadedDetail && preloadedDetail) {
      setPost(preloadedDetail.post);
      setPreviousCase(preloadedDetail.previousCase);
      setNextCase(preloadedDetail.nextCase);
      setLoading(false);
      setIsEditing(false);
      return;
    }

    const loadPost = async () => {
      try {
        const [detail, latestPost] = await Promise.all([
          getPublicCaseDetailData(id),
          canInlineEdit && id ? getInstallationCaseById(id) : Promise.resolve(null),
        ]);
        if (!isMounted) return;
        setPost(latestPost || detail.post);
        setPreviousCase(detail.previousCase);
        setNextCase(detail.nextCase);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to load post detail:', error);
        setPost(null);
        setPreviousCase(null);
        setNextCase(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      void loadPost();
    }
    const unsubscribe = subscribePublicDataInvalidation(() => {
      if (id) {
        void loadPost();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [canInlineEdit, hasPreloadedDetail, id, preloadedDetail]);

  const parsedContent = useMemo(() => extractInstallationCaseContent(post?.content), [post?.content]);
  const pageDescription =
    normalizeMetaText(
      post?.subtitle ||
      parsedContent.bodyContent ||
      parsedContent.blocks
        .map((block) => ('text' in block ? block.text : ''))
        .filter(Boolean)
        .join(' '),
    ) || TEXT.pageDescriptionFallback;

  const startEdit = async () => {
    if (!post) return;
    try {
      const latestPost = await getInstallationCaseById(post.id!);
      if (latestPost) {
        setPost(latestPost);
      }
    } catch (error) {
      console.error('Failed to refresh installation case before editing:', error);
    }
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (value: {
    title: string;
    category: string;
    subtitle: string;
    created_at: string;
    image_url: string;
    contentHtml: string;
  }) => {
    if (!post?.id) return;

    setSavingEdit(true);
    try {
      const updatedPost = await updateInstallationCase(post.id, {
        title: value.title.trim(),
        category: value.category.trim(),
        subtitle: value.subtitle.trim(),
        created_at: toCaseTimestamp(value.created_at),
        image_url: value.image_url.trim(),
        link: post.link || '/cases',
        content: value.contentHtml,
        display_order: post.display_order,
        is_active: true,
      });

      invalidatePublicDataCache();
      const detail = await getPublicCaseDetailData(post.id);
      setPost(updatedPost || detail.post);
      setPreviousCase(detail.previousCase);
      setNextCase(detail.nextCase);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update installation case:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;
    if (!window.confirm('정말 이 설치사례를 삭제하시겠습니까?')) return;

    setSavingEdit(true);
    try {
      await deleteInstallationCase(post.id);
      invalidatePublicDataCache();
      navigate('/cases');
    } catch (error) {
      console.error('Failed to delete installation case:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white pb-20 pt-10">
        <Loader2 className="animate-spin text-[#001e45]" size={40} />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-white pb-20 pt-20 text-center">
        <Seo
          title={buildSeoTitle('설치사례를 찾을 수 없습니다')}
          description={TEXT.notFoundDescription}
          canonicalPath={false}
          urlPath={false}
          noindex
          nofollow
        />
        <h1 className="text-2xl font-bold text-slate-800">{TEXT.notFoundTitle}</h1>
        <p className="mt-4 text-slate-500">{TEXT.notFoundDescription}</p>
        <button
          onClick={() => navigate('/cases')}
          className="mt-8 rounded-lg bg-[#001e45] px-6 py-2 text-white transition hover:bg-[#152b66]"
        >
          {TEXT.backToList}
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20 pt-10">
      <Seo
        title={buildSeoTitle(TEXT.pageTitleSuffix, post.title)}
        description={pageDescription}
        image={post.image_url}
        imageAlt={post.title}
        type="article"
        canonicalPath={post.id ? `/cases/${post.id}` : '/cases'}
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: '홈', path: '/' },
            { name: '설치사례', path: '/cases' },
            { name: post.title, path: post.id ? `/cases/${post.id}` : '/cases' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: pageDescription,
            image: [toAbsoluteUrl(post.image_url)],
            datePublished: post.created_at,
            dateModified: post.created_at,
            mainEntityOfPage: toAbsoluteUrl(post.id ? `/cases/${post.id}` : '/cases'),
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
            },
          },
        ]}
      />

      <Container size="detail">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ChevronLeft size={16} />
            <span>{TEXT.backToCasesList}</span>
          </Link>
          {canInlineEdit ? (
            isEditing ? (
              <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 shadow-sm">
                편집 중
              </span>
            ) : (
              <PublicPageEditButton onClick={startEdit} label="이 글 수정" className="mb-0" />
            )
          ) : null}
        </div>

        {isEditing ? (
          <div className="mx-auto max-w-[1080px]">
            <InstallationCaseInlineEditor
              title="사례 수정"
              initialValue={{
                title: post.title,
                category: post.category || '임시사무실',
                subtitle: post.subtitle || '',
                created_at: toDateInputValue(post.created_at),
                image_url: post.image_url || '',
                contentHtml: parsedContent.usesBlocks
                  ? buildInstallationCaseHtmlFromBlocks(parsedContent.blocks)
                  : appendInstallationCaseGalleryImages(parsedContent.bodyContent, parsedContent.galleryImages),
              }}
              submitLabel={savingEdit ? '저장 중' : '사례 저장'}
              saving={savingEdit}
              categoryOptions={categoryOptions.length > 0 ? categoryOptions : post.category ? [post.category] : []}
              onCancel={cancelEdit}
              onSave={handleSaveEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <article>
            <header className="border-b border-slate-200 pb-8 md:pb-10">
              <h1 className="max-w-5xl text-[30px] font-bold leading-[1.18] tracking-[-0.04em] text-slate-950 md:text-[44px]">
                {post.title}
              </h1>
              {post.subtitle && (
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-[17px]">
                  {post.subtitle}
                </p>
              )}
              {post.created_at && (
                <p className="mt-5 text-sm font-semibold text-slate-400">{formatDisplayDate(post.created_at)}</p>
              )}
            </header>

            {post.image_url && (
              <div className="mt-8">
                <ResponsiveImage
                  src={post.image_url}
                  alt={post.title}
                  kind="detail"
                  priority
                  sizes="(min-width: 1024px) 1080px, 100vw"
                  className="h-auto max-h-[760px] w-full object-cover"
                />
              </div>
            )}

            <div className="mt-10 space-y-8 md:mt-12">
              {parsedContent.usesBlocks ? (
                parsedContent.blocks.map((block) => {
                  if (block.type === 'heading') {
                    return (
                      <h2
                        key={block.id}
                        className="text-[24px] font-bold leading-[1.35] tracking-[-0.03em] text-slate-900 md:text-[30px]"
                      >
                        {block.text}
                      </h2>
                    );
                  }

                  if (block.type === 'image' && block.imageUrl) {
                    return (
                      <figure key={block.id} className="space-y-4">
                        <ResponsiveImage
                          src={block.imageUrl}
                          alt={block.caption || post.title}
                          kind="inline"
                          sizes="(min-width: 1024px) 1080px, 100vw"
                          className="w-full object-cover"
                          loading="lazy"
                        />
                        {block.caption && <figcaption className="text-sm leading-6 text-slate-500">{block.caption}</figcaption>}
                      </figure>
                    );
                  }

                  return (
                    <p key={block.id} className="whitespace-pre-line text-[16px] leading-8 text-slate-700 md:text-[17px] md:leading-8">
                      {block.text}
                    </p>
                  );
                })
              ) : parsedContent.bodyContent || parsedContent.galleryImages.length > 0 ? (
                <div className="space-y-8">
                  {parsedContent.bodyContent && (
                    <div
                      className="prose prose-lg max-w-none prose-slate [&_img]:rounded-none [&_img]:shadow-none"
                      dangerouslySetInnerHTML={{ __html: parsedContent.bodyContent }}
                    />
                  )}

                  {parsedContent.galleryImages.length > 0 && (
                    <div className="space-y-6">
                      {parsedContent.galleryImages.map((imageUrl, index) => (
                        <ResponsiveImage
                          key={`${imageUrl}-${index}`}
                          src={imageUrl}
                          alt={post.title}
                          kind="inline"
                          sizes="(min-width: 1024px) 1080px, 100vw"
                          className="w-full object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-left text-lg text-slate-500">{TEXT.emptyContent}</div>
              )}
            </div>
          </article>
        )}

        {!isEditing && (
          <div className="mt-16 border-t border-slate-200 pt-8 md:mt-20 md:pt-10">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6">
              {previousCase ? (
                <Link
                  to={`/cases/${previousCase.id}`}
                  className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-slate-500 transition hover:text-slate-900 md:text-base"
                >
                  <ChevronLeft size={18} />
                  <span>{TEXT.prevPost}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-slate-300 md:text-base">
                  <ChevronLeft size={18} />
                  <span>{TEXT.prevPost}</span>
                </span>
              )}

              <Link
                to="/cases"
                className="inline-flex min-w-[170px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 md:min-w-[220px] md:px-8"
              >
                {TEXT.backToList}
              </Link>

              {nextCase ? (
                <Link
                  to={`/cases/${nextCase.id}`}
                  className="inline-flex items-center gap-1.5 justify-self-end text-sm font-semibold text-slate-500 transition hover:text-slate-900 md:text-base"
                >
                  <span>{TEXT.nextPost}</span>
                  <ChevronRight size={18} />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 justify-self-end text-sm font-semibold text-slate-300 md:text-base">
                  <span>{TEXT.nextPost}</span>
                  <ChevronRight size={18} />
                </span>
              )}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
};

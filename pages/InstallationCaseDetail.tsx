import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { Seo } from '../components/Seo';
import { Container } from '../components/ui/Container';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { InstallationCase } from '../src/api/cmsApi';
import { getPublicCaseDetailData, type PublicCaseSummary } from '../src/api/publicDataApi';
import { usePrerenderData } from '../src/prerender/context';
import { extractInstallationCaseContent } from '../src/utils/installationCaseContent';
import { buildBreadcrumbStructuredData, normalizeMetaText, SITE_NAME, SITE_URL, toAbsoluteUrl } from '../src/utils/seo';

const TEXT = {
  notFoundTitle: '게시글을 찾을 수 없습니다.',
  notFoundDescription: '삭제되었거나 비공개 처리된 설치사례입니다.',
  backToList: '목록으로 돌아가기',
  backToCasesList: '설치사례 목록으로',
  emptyContent: '상세 내용이 아직 등록되지 않았습니다.',
  prevPost: '이전글',
  nextPost: '다음글',
  pageTitleSuffix: '휴먼파트너 설치 사례',
  pageDescriptionFallback: '휴먼파트너 맞춤 렌탈 솔루션 설치 사례입니다.',
};

const formatDisplayDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

export const InstallationCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const prerenderData = usePrerenderData();
  const preloadedDetail = prerenderData?.installationCaseDetail;
  const hasPreloadedDetail = !!(id && preloadedDetail?.post?.id === id);
  const [loading, setLoading] = useState(!hasPreloadedDetail);
  const [post, setPost] = useState<InstallationCase | null>(hasPreloadedDetail ? preloadedDetail?.post || null : null);
  const [previousCase, setPreviousCase] = useState<PublicCaseSummary | null>(
    hasPreloadedDetail ? preloadedDetail?.previousCase || null : null,
  );
  const [nextCase, setNextCase] = useState<PublicCaseSummary | null>(
    hasPreloadedDetail ? preloadedDetail?.nextCase || null : null,
  );

  useEffect(() => {
    if (hasPreloadedDetail && preloadedDetail) {
      setPost(preloadedDetail.post);
      setPreviousCase(preloadedDetail.previousCase);
      setNextCase(preloadedDetail.nextCase);
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        const detail = await getPublicCaseDetailData(id);
        setPost(detail.post);
        setPreviousCase(detail.previousCase);
        setNextCase(detail.nextCase);
      } catch (error) {
        console.error('Failed to load post detail:', error);
        setPost(null);
        setPreviousCase(null);
        setNextCase(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadPost();
    }
  }, [hasPreloadedDetail, id, preloadedDetail]);

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
          title="설치사례를 찾을 수 없습니다 | 휴먼파트너"
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
        title={`${post.title} | ${TEXT.pageTitleSuffix}`}
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

      <Container className="max-w-[1000px]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ChevronLeft size={16} />
            <span>{TEXT.backToCasesList}</span>
          </Link>
          <PublicPageEditButton to="/admin/cases" className="mb-0" />
        </div>

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
                sizes="(min-width: 1024px) 1000px, 100vw"
                className="h-auto max-h-[760px] w-full object-cover"
              />
            </div>
          )}

          <div className="mt-10 space-y-8 md:mt-12">
            {parsedContent.blocks.length > 0 ? (
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
                        sizes="(min-width: 1024px) 900px, 100vw"
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
            ) : parsedContent.bodyContent ? (
              <div
                className="prose prose-lg max-w-none prose-slate [&_img]:rounded-none [&_img]:shadow-none"
                dangerouslySetInnerHTML={{ __html: parsedContent.bodyContent }}
              />
            ) : (
              <div className="py-16 text-left text-lg text-slate-500">{TEXT.emptyContent}</div>
            )}
          </div>
        </article>

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
      </Container>
    </main>
  );
};

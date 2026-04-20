import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, Paperclip } from "lucide-react";
import { PublicCollectionHero } from "../components/PublicCollectionHero";
import { Seo } from "../components/Seo";
import { Container } from "../components/ui/Container";
import { PublicPageEditButton } from "../components/admin/PublicPageEditButton";
import { NoticeInlineEditor } from "../components/notice/NoticeInlineEditor";
import {
  buildBreadcrumbStructuredData,
  buildSeoTitle,
  normalizeMetaText,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
} from "../src/utils/seo";
import {
  buildNoticeAuthoringInputFromPost,
  deleteNoticePost,
  NoticePost,
  stripNoticeHtml,
  updateNoticePost,
} from "../src/api/noticeApi";
import { getPublicNoticeDetailData, invalidatePublicDataCache, type PublicNoticeSummary } from "../src/api/publicDataApi";
import { NOTICE_FILTER_TABS, getNoticeTabValue } from "../src/config/publicMegaMenu";
import { getCollectionHeroVisual } from "../src/content/publicVisualsContent";
import { usePublicVisuals } from "../src/hooks/usePublicVisuals";
import { usePrerenderData } from "../src/prerender/context";
import { useAuth } from "../src/context/AuthContext";

const TEXT = {
  notFoundTitle: "게시글을 찾을 수 없습니다.",
  notFoundDescription: "삭제되었거나 비공개 처리된 정보센터 게시물입니다.",
  backToList: "목록으로 돌아가기",
  backToNoticeList: "정보센터 목록으로",
  prevPost: "이전 글",
  nextPost: "다음 글",
  pageTitleSuffix: "정보센터",
  pageDescriptionFallback: "휴먼파트너의 주요 공지와 자료실 문서를 확인할 수 있는 정보센터입니다.",
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, "0")}.${String(parsed.getDate()).padStart(2, "0")}`;
};

const formatErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
};

export const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const prerenderData = usePrerenderData();
  const publicVisuals = usePublicVisuals();
  const preloadedDetail = prerenderData?.noticeDetail;
  const hasPreloadedDetail = !!(id && preloadedDetail?.post?.id === id);
  const [post, setPost] = useState<NoticePost | null>(hasPreloadedDetail ? preloadedDetail?.post || null : null);
  const [previousNotice, setPreviousNotice] = useState<PublicNoticeSummary | null>(
    hasPreloadedDetail ? preloadedDetail?.previousNotice || null : null,
  );
  const [nextNotice, setNextNotice] = useState<PublicNoticeSummary | null>(
    hasPreloadedDetail ? preloadedDetail?.nextNotice || null : null,
  );
  const [loading, setLoading] = useState(!hasPreloadedDetail);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<ReturnType<typeof buildNoticeAuthoringInputFromPost> | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const canInlineEdit = !authLoading && !!user && !!userProfile && isAdmin;
  const activeTab = post ? getNoticeTabValue(post.category) : NOTICE_FILTER_TABS[0]?.value || "news";
  const heroContent = getCollectionHeroVisual(publicVisuals, "notice", activeTab as "news" | "resources");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    if (hasPreloadedDetail && preloadedDetail) {
      setPost(preloadedDetail.post);
      setPreviousNotice(preloadedDetail.previousNotice);
      setNextNotice(preloadedDetail.nextNotice);
      setLoading(false);
      setIsEditing(false);
      setEditDraft(null);
      return;
    }

    const loadNotice = async () => {
      setLoading(true);
      try {
        const detail = await getPublicNoticeDetailData(id);
        setPost(detail.post);
        setPreviousNotice(detail.previousNotice);
        setNextNotice(detail.nextNotice);
        setIsEditing(false);
        setEditDraft(null);
      } catch (error) {
        console.error("Failed to load notice detail:", error);
        setPost(null);
        setPreviousNotice(null);
        setNextNotice(null);
      } finally {
        setLoading(false);
      }
    };

    void loadNotice();
  }, [hasPreloadedDetail, id, preloadedDetail]);

  const pageDescription =
    normalizeMetaText(post?.excerpt || (post ? stripNoticeHtml(post.contentHtml) : "")) || TEXT.pageDescriptionFallback;

  const startEdit = () => {
    if (!post) return;
    setEditDraft(buildNoticeAuthoringInputFromPost(post));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditDraft(null);
  };

  const handleSaveEdit = async (value: ReturnType<typeof buildNoticeAuthoringInputFromPost>) => {
    if (!post?.id) return;

    setSavingEdit(true);
    try {
      await updateNoticePost(post.id, {
        ...value,
        displayOrder: post.displayOrder,
        isActive: true,
      });

      invalidatePublicDataCache();
      const detail = await getPublicNoticeDetailData(post.id);
      setPost(detail.post);
      setPreviousNotice(detail.previousNotice);
      setNextNotice(detail.nextNotice);
      setIsEditing(false);
      setEditDraft(null);
    } catch (error) {
      console.error("Failed to update notice post:", error);
      const message = formatErrorMessage(error);
      alert(`저장에 실패했습니다.\n${message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    setSavingEdit(true);
    try {
      await deleteNoticePost(post.id);
      invalidatePublicDataCache();
      navigate("/notice");
    } catch (error) {
      console.error("Failed to delete notice post:", error);
      const message = formatErrorMessage(error);
      alert(`삭제에 실패했습니다.\n${message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <Loader2 className="animate-spin text-[#001e45]" size={40} />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] pb-20 pt-20 text-center">
        <Seo
          title={buildSeoTitle("정보센터 게시글을 찾을 수 없습니다")}
          description={TEXT.notFoundDescription}
          canonicalPath={false}
          urlPath={false}
          noindex
          nofollow
        />
        <h1 className="text-2xl font-bold text-slate-800">{TEXT.notFoundTitle}</h1>
        <p className="mt-4 text-slate-500">{TEXT.notFoundDescription}</p>
        <button
          onClick={() => navigate("/notice")}
          className="mt-8 border border-[#001e45] bg-[#001e45] px-6 py-3 text-white transition hover:bg-[#123161]"
        >
          {TEXT.backToList}
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] pb-20 pt-0">
      <Seo
        title={buildSeoTitle(TEXT.pageTitleSuffix, post.title)}
        description={pageDescription}
        type="article"
        canonicalPath={`/notice/${post.id}`}
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: "홈", path: "/" },
            { name: "정보센터", path: "/notice" },
            { name: post.title, path: `/notice/${post.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: pageDescription,
            datePublished: post.publishedAt,
            dateModified: post.updated_at || post.created_at || post.publishedAt,
            mainEntityOfPage: toAbsoluteUrl(`/notice/${post.id}`),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
          },
        ]}
      />

      <PublicCollectionHero
        title={heroContent.title || "정보센터"}
        description={heroContent.description}
        imageUrl={heroContent.imageUrl}
        tabs={NOTICE_FILTER_TABS.map((tab) => ({ label: tab.label, value: tab.value }))}
        activeValue={activeTab}
        onSelect={(value) => navigate(`/notice?tab=${value}`)}
        topRightAction={
          canInlineEdit ? (
            isEditing ? (
              <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 shadow-sm">
                편집 중
              </span>
            ) : (
              <PublicPageEditButton onClick={startEdit} label="게시글 수정" className="mb-0" />
            )
          ) : null
        }
      />

      <Container size="detail">
        {isEditing && editDraft ? (
          <div className="mx-auto mt-28 max-w-[1080px] md:mt-32">
            <NoticeInlineEditor
              title="정보센터 글 수정"
              initialValue={editDraft}
              submitLabel={savingEdit ? "저장 중" : "수정 저장"}
              saving={savingEdit}
              onCancel={cancelEdit}
              onSave={handleSaveEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="mx-auto mt-28 max-w-[920px] md:mt-32">
            <article className="border border-[#d8dce3] bg-white px-6 py-8 md:px-10 md:py-10">
              <Link
                to={`/notice?tab=${activeTab}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5f6b7a] transition hover:text-[#001e45]"
              >
                <ChevronLeft size={16} />
                <span>{TEXT.backToNoticeList}</span>
              </Link>

              <header className="mt-6 border-b border-[#e4e8ef] pb-5">
                <h1 className="text-[30px] font-bold leading-[1.35] tracking-[-0.04em] text-[#101826] md:text-[42px]">
                  {post.title}
                </h1>
                <p className="mt-4 text-sm font-medium text-[#8b96a5]">{formatDate(post.publishedAt)}</p>
              </header>

              {post.attachments && post.attachments.length > 0 ? (
                <section className="mt-6 border border-[#d8dce3] bg-[#fafbfc]">
                  {post.attachments.map((attachment, index) => (
                    <a
                      key={`${attachment.url}-${index}`}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 border-b border-[#e3e7ee] px-4 py-4 last:border-b-0 transition hover:bg-white"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Paperclip size={16} className="shrink-0 text-[#6f7c8f]" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172132]">{attachment.name}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[#001e45]">
                        <Download size={16} />
                        <ExternalLink size={16} />
                      </div>
                    </a>
                  ))}
                </section>
              ) : null}

              <div
                className="prose prose-slate mt-8 max-w-none [&_.hp-attachments]:hidden [&_h2]:mt-10 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:text-[#162131] [&_img]:hidden [&_p]:text-[16px] [&_p]:leading-8 [&_p]:text-[#374353] [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#d8dce3] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[#d8dce3] [&_th]:bg-[#eef1f5] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            </article>

            <div className="mt-8 border border-[#d8dce3] bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-[#e3e7ee] px-4 py-4">
                {previousNotice ? (
                  <Link
                    to={`/notice/${previousNotice.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#516172] transition hover:text-[#001e45]"
                  >
                    <ChevronLeft size={18} />
                    <span>{TEXT.prevPost}</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#b0b8c4]">
                    <ChevronLeft size={18} />
                    <span>{TEXT.prevPost}</span>
                  </span>
                )}

                <Link
                  to={`/notice?tab=${activeTab}`}
                  className="text-sm font-semibold text-[#001e45] transition hover:opacity-70"
                >
                  {TEXT.backToList}
                </Link>

                {nextNotice ? (
                  <Link
                    to={`/notice/${nextNotice.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#516172] transition hover:text-[#001e45]"
                  >
                    <span>{TEXT.nextPost}</span>
                    <ChevronRight size={18} />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#b0b8c4]">
                    <span>{TEXT.nextPost}</span>
                    <ChevronRight size={18} />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
};

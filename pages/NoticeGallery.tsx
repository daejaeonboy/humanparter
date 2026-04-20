import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Paperclip, Plus, Search } from "lucide-react";
import { PublicCollectionHero } from "../components/PublicCollectionHero";
import { Seo } from "../components/Seo";
import { Container } from "../components/ui/Container";
import { PublicPageEditButton } from "../components/admin/PublicPageEditButton";
import { NoticeInlineEditor } from "../components/notice/NoticeInlineEditor";
import { NOTICE_FILTER_TABS, getNoticeTabValue } from "../src/config/publicMegaMenu";
import { getCollectionHeroVisual } from "../src/content/publicVisualsContent";
import { buildBreadcrumbStructuredData, buildSeoTitle, toAbsoluteUrl } from "../src/utils/seo";
import {
  addNoticePost,
  createEmptyNoticeAuthoringInput,
  getNextNoticeDisplayOrder,
  type NoticeAuthoringInput,
} from "../src/api/noticeApi";
import { getPublicNoticesData, invalidatePublicDataCache, type PublicNoticeSummary } from "../src/api/publicDataApi";
import { usePublicVisuals } from "../src/hooks/usePublicVisuals";
import { usePrerenderData } from "../src/prerender/context";
import { useAuth } from "../src/context/AuthContext";

const NOTICES_PER_PAGE = 14;
const DEFAULT_TAB = NOTICE_FILTER_TABS[0]?.value || "news";

const formatDisplayDate = (value?: string) => {
  if (!value) return "";
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

const getTabLabel = (value: string) => NOTICE_FILTER_TABS.find((tab) => tab.value === value)?.label || "공지사항";

const getCategoryLabel = (category: string) => (getNoticeTabValue(category) === "resources" ? "자료실" : "공지사항");

const getAttachmentLabel = (attachments?: { name: string; url: string }[]) => {
  const count = attachments?.length || 0;
  return count > 0 ? `첨부 ${count}` : "첨부 없음";
};

const matchesKeyword = (post: PublicNoticeSummary, keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;

  const haystack = [
    post.title,
    post.excerpt,
    post.category,
    ...(post.attachments || []).map((attachment) => attachment.name),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedKeyword);
};

export const NoticeGallery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const preloadedPosts = usePrerenderData()?.notices?.posts;
  const publicVisuals = usePublicVisuals();
  const [posts, setPosts] = useState<PublicNoticeSummary[]>(preloadedPosts || []);
  const [loading, setLoading] = useState(!preloadedPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<NoticeAuthoringInput | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);
  const createEditorRef = useRef<HTMLDivElement>(null);
  const requestedTab = searchParams.get("tab") || DEFAULT_TAB;
  const activeTab = NOTICE_FILTER_TABS.some((tab) => tab.value === requestedTab) ? requestedTab : DEFAULT_TAB;
  const keyword = searchParams.get("q") || "";
  const deferredKeyword = useDeferredValue(keyword);
  const canInlineEdit = !authLoading && !!user && !!userProfile && isAdmin;
  const heroContent = getCollectionHeroVisual(publicVisuals, "notice", activeTab as "news" | "resources");

  useEffect(() => {
    if (isCreating) {
      createEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isCreating]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!preloadedPosts) {
        setLoading(true);
      }
      try {
        if (preloadedPosts) {
          setPosts(preloadedPosts);
          setLoading(false);
        }

        const data = await getPublicNoticesData();
        setPosts(data.posts);
      } catch (error) {
        console.error("Failed to load notice posts:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, [preloadedPosts]);

  const filteredNotices = useMemo(() => {
    return posts
      .filter((item) => getNoticeTabValue(item.category) === activeTab)
      .filter((item) => matchesKeyword(item, deferredKeyword));
  }, [activeTab, deferredKeyword, posts]);

  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / NOTICES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * NOTICES_PER_PAGE;
  const pagedNotices = filteredNotices.slice(startIndex, startIndex + NOTICES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, deferredKeyword]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateSearchParams = (nextTab: string, nextKeyword: string) => {
    const nextParams = new URLSearchParams();
    nextParams.set("tab", nextTab);
    if (nextKeyword.trim()) {
      nextParams.set("q", nextKeyword.trim());
    }
    setSearchParams(nextParams);
  };

  const openCreateEditor = () => {
    setCreateDraft(createEmptyNoticeAuthoringInput());
    setIsCreating(true);
  };

  const closeCreateEditor = () => {
    setIsCreating(false);
    setCreateDraft(null);
  };

  const handleCreateSave = async (value: NoticeAuthoringInput) => {
    setSavingCreate(true);
    try {
      const created = await addNoticePost({
        ...value,
        displayOrder: getNextNoticeDisplayOrder(posts),
        isActive: true,
      });

      invalidatePublicDataCache();
      const refreshed = await getPublicNoticesData();
      setPosts(refreshed.posts);
      closeCreateEditor();
      navigate(`/notice/${created.id}`);
    } catch (error) {
      console.error("Failed to create notice post:", error);
      const message = formatErrorMessage(error);
      alert(`새 글 등록에 실패했습니다.\n${message}`);
    } finally {
      setSavingCreate(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] pb-20 pt-0">
      <Seo
        title={buildSeoTitle("정보센터")}
        description="휴먼파트너의 공지사항과 자료실을 검색하고 필요한 안내 문서를 빠르게 확인해보세요."
        canonicalPath="/notice"
        urlPath="/notice"
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: "홈", path: "/" },
            { name: "정보센터", path: "/notice" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "휴먼파트너 정보센터",
            description: "공지사항과 자료실 게시물을 검색하고 확인할 수 있는 정보센터입니다.",
            url: toAbsoluteUrl("/notice"),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: pagedNotices.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.title,
                url: toAbsoluteUrl(`/notice/${item.id}`),
              })),
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
        onSelect={(value) => updateSearchParams(value, keyword)}
        topRightAction={
          canInlineEdit ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openCreateEditor}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Plus size={16} />
                새 글 등록
              </button>
              <PublicPageEditButton to="/admin/public-visuals" label="상단 배너 관리" />
            </div>
          ) : null
        }
      />

      <Container size="layout">
        {isCreating && createDraft ? (
          <div ref={createEditorRef} className="mx-auto mt-28 max-w-[1080px] md:mt-32">
            <NoticeInlineEditor
              title="정보센터 글 등록"
              description="공지사항 또는 자료실 게시물을 작성하고 저장하면 상세 페이지로 이동합니다."
              initialValue={createDraft}
              submitLabel={savingCreate ? "저장 중" : "등록하고 상세 보기"}
              saving={savingCreate}
              onCancel={closeCreateEditor}
              onSave={handleCreateSave}
            />
          </div>
        ) : null}

        {!isCreating && (
          <div className="mx-auto mt-20 max-w-[1180px] md:mt-24">
            <div className="flex items-center justify-end pb-4">
              <label className="relative flex items-center">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8d98a8]"
                />
                <input
                  value={keyword}
                  onChange={(event) => updateSearchParams(activeTab, event.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="h-9 w-[260px] border border-[#cfd5de] bg-white pl-9 pr-4 text-[14px] text-[#172132] outline-none transition placeholder:text-[#adb5bd] focus:border-[#001e45] focus:w-[320px]"
                  style={{ transition: "width 0.2s ease, border-color 0.2s" }}
                />
              </label>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-[#001e45]" size={40} />
              </div>
            ) : filteredNotices.length > 0 ? (
              <>
                <div className="mt-5 overflow-hidden border border-[#d8dce3] bg-white">
                  <div className="hidden grid-cols-[140px_minmax(0,1fr)_140px_140px] items-center gap-6 border-b border-[#d8dce3] bg-[#eef1f5] px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#5f6b7a] md:grid">
                    <span>구분</span>
                    <span>제목</span>
                    <span>첨부</span>
                    <span className="text-right">등록일</span>
                  </div>

                  <div className="divide-y divide-[#e3e7ee]">
                    {pagedNotices.map((item) => (
                      <Link
                        key={item.id}
                        to={`/notice/${item.id}`}
                        className="group block px-5 py-5 transition hover:bg-[#f8fafc] md:px-8"
                      >
                        <div className="flex flex-col gap-4 md:grid md:grid-cols-[140px_minmax(0,1fr)_140px_140px] md:items-center md:gap-6">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex min-w-[78px] items-center justify-center px-3 py-1.5 text-xs font-bold ${
                                getNoticeTabValue(item.category) === "resources"
                                  ? "bg-[#eef3f8] text-[#36506f]"
                                  : "bg-[#e8edf3] text-[#223754]"
                              }`}
                            >
                              {getCategoryLabel(item.category)}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#142033] transition group-hover:text-[#001e45] md:text-[16px]">
                              {item.title}
                            </h2>
                            <p className="mt-2 line-clamp-1 text-sm text-[#6a7584]">{item.excerpt}</p>
                          </div>

                          <div className="flex items-center gap-2 text-sm font-semibold text-[#536173]">
                            <Paperclip size={15} className="text-[#6b7b90]" />
                            <span>{getAttachmentLabel(item.attachments)}</span>
                          </div>

                          <p className="text-sm font-semibold text-[#617082] md:text-right">
                            {formatDisplayDate(item.publishedAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {totalPages > 1 ? (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={safeCurrentPage === 1}
                      className="border border-[#cfd5de] bg-white px-4 py-2 text-sm font-semibold text-[#4f5b69] transition hover:bg-[#f3f6fa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      이전
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-11 min-w-11 border text-sm font-bold transition ${
                          safeCurrentPage === page
                            ? "border-[#001e45] bg-[#001e45] text-white"
                            : "border-[#cfd5de] bg-white text-[#4f5b69] hover:bg-[#f3f6fa]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="border border-[#cfd5de] bg-white px-4 py-2 text-sm font-semibold text-[#4f5b69] transition hover:bg-[#f3f6fa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      다음
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-5 border border-dashed border-[#d8dce3] bg-white px-8 py-20 text-center">
                <p className="text-[20px] font-bold text-[#1b2535]">검색 조건에 맞는 게시물이 없습니다.</p>
                <p className="mt-3 text-sm leading-6 text-[#6d7888]">
                  다른 검색어를 입력하거나 상단 탭을 바꿔서 다시 확인해보세요.
                </p>
              </div>
            )}
          </div>
        )}
      </Container>
    </main>
  );
};

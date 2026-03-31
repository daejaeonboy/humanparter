import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PublicCollectionHero } from "../components/PublicCollectionHero";
import { Seo } from "../components/Seo";
import { Container } from "../components/ui/Container";
import { PublicPageEditButton } from "../components/admin/PublicPageEditButton";
import { NOTICE_FILTER_TABS, getNoticeTabValue } from "../src/config/publicMegaMenu";
import { buildBreadcrumbStructuredData, toAbsoluteUrl } from "../src/utils/seo";
import { NoticePost, getPublicNoticePosts } from "../src/api/noticeApi";

const NOTICES_PER_PAGE = 4;

const NOTICE_GALLERY_HERO_CONTENT: Record<string, { title: string; description: string; imageUrl: string }> = {
  all: {
    title: "공지사항",
    description: "휴먼파트너의 운영 소식, 상담 안내, 설치 및 렌탈 관련 주요 업데이트를 확인해보세요.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  },
  news: {
    title: "새 소식",
    description: "운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 한 번에 확인할 수 있습니다.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  },
  resources: {
    title: "자료실",
    description: "설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 빠르게 찾아볼 수 있습니다.",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
  },
};

const formatDisplayDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}.${parsed.getMonth() + 1}.${parsed.getDate()}`;
};

export const NoticeGallery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<NoticePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const requestedTab = searchParams.get("tab") || "all";
  const activeTab = NOTICE_FILTER_TABS.some((tab) => tab.value === requestedTab) ? requestedTab : "all";
  const heroContent = NOTICE_GALLERY_HERO_CONTENT[activeTab] || NOTICE_GALLERY_HERO_CONTENT.all;

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const data = await getPublicNoticePosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to load notice posts:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, []);

  const filteredNotices = useMemo(() => {
    if (activeTab === "all") return posts;
    return posts.filter((item) => getNoticeTabValue(item.category) === activeTab);
  }, [activeTab, posts]);

  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / NOTICES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * NOTICES_PER_PAGE;
  const pagedNotices = filteredNotices.slice(startIndex, startIndex + NOTICES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <main className="min-h-screen bg-white pb-20 pt-0">
      <Seo
        title="휴먼파트너 공지사항"
        description="휴먼파트너의 운영 소식, 상담 안내, 설치 및 렌탈 관련 주요 업데이트를 확인해보세요."
        canonicalPath={activeTab === "all" ? "/notice" : `/notice?tab=${encodeURIComponent(activeTab)}`}
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: "홈", path: "/" },
            { name: "공지사항", path: "/notice" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "휴먼파트너 공지사항",
            description: "휴먼파트너의 운영 소식, 상담 안내, 설치 및 렌탈 관련 주요 업데이트를 확인해보세요.",
            url: toAbsoluteUrl(activeTab === "all" ? "/notice" : `/notice?tab=${encodeURIComponent(activeTab)}`),
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
        title={heroContent.title}
        description={heroContent.description}
        imageUrl={heroContent.imageUrl}
        tabs={NOTICE_FILTER_TABS.map((tab) => ({ label: tab.label, value: tab.value }))}
        activeValue={activeTab}
        onSelect={(value) => setSearchParams(value === "all" ? {} : { tab: value })}
        topRightAction={<PublicPageEditButton to="/admin/notices" />}
      />

      <Container size="layout">
        <div className="mt-20 md:mt-24">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#001e45]" size={40} />
          </div>
        ) : filteredNotices.length > 0 ? (
          <>
            <section className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
              {pagedNotices.map((item, index) => (
                <Link key={item.id} to={`/notice/${item.id}`} className="group block h-full">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 group-hover:shadow-md">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading={index < NOTICES_PER_PAGE ? "eager" : "lazy"}
                    />
                  </div>
                  <div className="mt-5 flex flex-col px-1">
                    <h2 className="line-clamp-2 text-[16px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#001e45]">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-sm font-medium text-slate-400">{formatDisplayDate(item.publishedAt)}</p>
                  </div>
                </Link>
              ))}
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
                        ? "border-[#001e45] bg-[#001e45] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
            <p>등록된 공지사항이 없습니다.</p>
          </div>
        )}
        </div>
      </Container>
    </main>
  );
};

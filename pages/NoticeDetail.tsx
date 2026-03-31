import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Seo } from "../components/Seo";
import { Container } from "../components/ui/Container";
import { PublicPageEditButton } from "../components/admin/PublicPageEditButton";
import {
  buildBreadcrumbStructuredData,
  normalizeMetaText,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
} from "../src/utils/seo";
import { getPublicNoticePostById, getPublicNoticePosts, NoticePost, stripNoticeHtml } from "../src/api/noticeApi";

const TEXT = {
  notFoundTitle: "게시글을 찾을 수 없습니다.",
  notFoundDescription: "삭제되었거나 비공개 처리된 공지사항입니다.",
  backToList: "목록으로 돌아가기",
  backToNoticeList: "공지사항 목록으로",
  prevPost: "이전글",
  nextPost: "다음글",
  pageTitleSuffix: "휴먼파트너 공지사항",
  pageDescriptionFallback: "휴먼파트너의 주요 공지 및 운영 안내입니다.",
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
};

export const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<NoticePost | null>(null);
  const [allNotices, setAllNotices] = useState<NoticePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadNotice = async () => {
      setLoading(true);
      try {
        const [targetPost, notices] = await Promise.all([
          getPublicNoticePostById(id),
          getPublicNoticePosts(),
        ]);
        setPost(targetPost);
        setAllNotices(notices);
      } catch (error) {
        console.error("Failed to load notice detail:", error);
        setPost(null);
        setAllNotices([]);
      } finally {
        setLoading(false);
      }
    };

    void loadNotice();
  }, [id]);

  const pageDescription =
    normalizeMetaText(post?.excerpt || (post ? stripNoticeHtml(post.contentHtml) : "")) ||
    TEXT.pageDescriptionFallback;
  const currentIndex = useMemo(
    () => allNotices.findIndex((item) => item.id === id),
    [allNotices, id],
  );
  const previousNotice = currentIndex > 0 ? allNotices[currentIndex - 1] : null;
  const nextNotice = currentIndex >= 0 && currentIndex < allNotices.length - 1 ? allNotices[currentIndex + 1] : null;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#001e45]" size={40} />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-white pb-20 pt-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">{TEXT.notFoundTitle}</h1>
        <p className="mt-4 text-slate-500">{TEXT.notFoundDescription}</p>
        <button
          onClick={() => navigate("/notice")}
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
        image={post.imageUrl}
        imageAlt={post.title}
        type="article"
        canonicalPath={`/notice/${post.id}`}
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: "홈", path: "/" },
            { name: "공지사항", path: "/notice" },
            { name: post.title, path: `/notice/${post.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: pageDescription,
            image: [toAbsoluteUrl(post.imageUrl)],
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

      <Container className="max-w-[1000px]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/notice"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ChevronLeft size={16} />
            <span>{TEXT.backToNoticeList}</span>
          </Link>
          <PublicPageEditButton to="/admin/notices" className="mb-0" />
        </div>

        <article>
          <header className="border-b border-slate-200 pb-8 md:pb-10">
            <h1 className="max-w-5xl text-[30px] font-bold leading-[1.18] tracking-[-0.04em] text-slate-950 md:text-[44px]">
              {post.title}
            </h1>
            <p className="mt-5 text-sm font-semibold text-slate-400">{formatDate(post.publishedAt)}</p>
          </header>

          <div className="mt-8">
            <img src={post.imageUrl} alt={post.title} className="h-auto max-h-[760px] w-full object-cover" />
          </div>

          <div
            className="prose prose-slate mt-10 max-w-none [&_h2]:mt-10 [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:text-slate-900 [&_img]:rounded-none [&_img]:shadow-none [&_p]:text-[16px] [&_p]:leading-8 [&_p]:text-slate-700 md:mt-12 md:[&_h2]:text-[30px] md:[&_p]:text-[17px]"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>

        <div className="mt-16 border-t border-slate-200 pt-8 md:mt-20 md:pt-10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6">
            {previousNotice ? (
              <Link
                to={`/notice/${previousNotice.id}`}
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
              to="/notice"
              className="inline-flex min-w-[170px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 md:min-w-[220px] md:px-8"
            >
              {TEXT.backToList}
            </Link>

            {nextNotice ? (
              <Link
                to={`/notice/${nextNotice.id}`}
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

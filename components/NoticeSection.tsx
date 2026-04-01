import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/Container";
import { ResponsiveImage } from "./ui/ResponsiveImage";
import { FALLBACK_NOTICE_POSTS } from "../src/api/noticeApi";
import { getPublicHomeData, type PublicNoticeSummary } from "../src/api/publicDataApi";
import { usePrerenderData } from "../src/prerender/context";

export const NoticeSection: React.FC = () => {
  const preloadedNotices = usePrerenderData()?.home?.noticeSummaries;
  const [items, setItems] = useState<PublicNoticeSummary[]>(preloadedNotices || FALLBACK_NOTICE_POSTS.slice(0, 3));

  useEffect(() => {
    const loadNotices = async () => {
      try {
        if (preloadedNotices) {
          setItems(preloadedNotices);
        }

        const { noticeSummaries } = await getPublicHomeData();
        setItems(noticeSummaries.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured notices:", error);
      }
    };

    void loadNotices();
  }, [preloadedNotices]);

  return (
    <section className="bg-white py-12 md:py-24">
      <Container>
        <div className="mb-8 flex items-end justify-between md:mb-12">
          <h2 className="text-[24px] font-medium leading-tight text-black md:text-4xl">
            정보센터
          </h2>
          <Link
            to="/notice"
            className="text-[15px] font-bold text-slate-700 transition hover:text-black"
          >
            전체보기
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:pb-0">
          {items.map((item) => (
            <Link key={item.id} to={`/notice/${item.id}`} className="group min-w-[280px] md:min-w-0">
              <div className="mb-4 overflow-hidden rounded-[8px] bg-slate-100">
                <div className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105">
                  <ResponsiveImage
                    src={item.imageUrl}
                    alt={item.title}
                    kind="card"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-[17px] font-bold text-slate-900 transition-colors group-hover:text-brand-primary">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};

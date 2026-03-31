import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/Container";
import { FALLBACK_NOTICE_POSTS, getPublicNoticePosts, NoticePost } from "../src/api/noticeApi";

export const NoticeSection: React.FC = () => {
  const [items, setItems] = useState<NoticePost[]>(FALLBACK_NOTICE_POSTS.slice(0, 3));

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const notices = await getPublicNoticePosts();
        setItems(notices.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured notices:", error);
      }
    };

    void loadNotices();
  }, []);

  return (
    <section className="bg-white py-12 md:py-16">
      <Container>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[28px] font-bold leading-tight text-black md:text-[32px]">
            공지사항
          </h2>
          <Link
            to="/notice"
            className="text-[13px] font-semibold text-black/60 transition hover:text-black"
          >
            전체보기
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((item) => (
            <Link key={item.id} to={`/notice/${item.id}`} className="group">
              <div className="mb-4 overflow-hidden rounded-2xl bg-gray-100">
                <div className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-[16px] font-bold text-black transition-colors group-hover:text-black/70">
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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Container } from "./ui/Container";
import { getInstallationCases, InstallationCase } from "../src/api/cmsApi";

const fallbackCases: InstallationCase[] = [
  {
    id: "case-1",
    title: "대전컨벤션센터",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    link: "/cases",
    display_order: 1,
    is_active: true,
  },
  {
    id: "case-2",
    title: "판교 테크노밸리 오피스",
    image_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    link: "/cases",
    display_order: 2,
    is_active: true,
  },
  {
    id: "case-3",
    title: "서울 코엑스 박람회",
    image_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    link: "/cases",
    display_order: 3,
    is_active: true,
  },
];

export const InstallationCasesSection: React.FC = () => {
  const [cases, setCases] = useState<InstallationCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getInstallationCases();
        // 3단 구성을 위해 3개만 가져옴
        setCases(data.length > 0 ? data.slice(0, 3) : fallbackCases);
      } catch (error) {
        console.error("Failed to fetch installation cases:", error);
        setCases(fallbackCases);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={38} />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <Container>
        <div className="mb-8 flex items-end justify-between">
          <div className="flex items-end gap-6">
            <h2 className="text-[28px] font-bold leading-tight text-black md:text-[32px]">
              고객 사례
            </h2>
            <p className="mb-1 hidden text-[14px] font-medium text-black/40 md:block">
              휴먼파트너와 만드는 혁신
            </p>
          </div>
          <Link
            to="/cases"
            className="text-[13px] font-semibold text-black/60 transition hover:text-black"
          >
            전체보기
          </Link>
        </div>

        {/* 3단 구성 및 Gap 4px(Tailwind gap-1) 설정 */}
        <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
          {cases.map((item) => (
            <Link key={item.id} to={item.link || `/cases/${item.id}`} className="group">
              <div className="mb-4 overflow-hidden bg-gray-100">
                <div className="aspect-video w-full transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="px-1">
                <span className="mb-1 block text-[11px] font-bold tracking-tight text-black/30">
                  고객사례
                </span>
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

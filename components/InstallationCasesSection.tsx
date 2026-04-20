import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Container } from "./ui/Container";
import { ResponsiveImage } from "./ui/ResponsiveImage";
import { InstallationCase } from "../src/api/cmsApi";
import { getPublicHomeData, type PublicCaseSummary } from "../src/api/publicDataApi";
import { usePrerenderData } from "../src/prerender/context";

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
  const preloadedCases = usePrerenderData()?.home?.installationCases;
  const [cases, setCases] = useState<Array<InstallationCase | PublicCaseSummary>>(preloadedCases || []);
  const [loading, setLoading] = useState(!preloadedCases);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        if (preloadedCases) {
          setCases(preloadedCases);
          setLoading(false);
        }

        const { installationCases } = await getPublicHomeData();
        setCases(installationCases.length > 0 ? installationCases : fallbackCases);
      } catch (error) {
        console.error("Failed to fetch installation cases:", error);
        setCases(fallbackCases);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [preloadedCases]);

  if (loading) {
    return (
      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={38} />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-24">
      <Container>
        <div className="mb-10 flex items-end justify-between md:mb-12">
          <h2 className="text-[24px] font-medium leading-tight text-black md:text-4xl">
            고객 사례
          </h2>
          <Link
            to="/cases"
            className="text-[15px] font-bold text-slate-700 transition hover:text-black"
          >
            전체보기
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:pb-0">
          {cases.map((item) => (
            <Link key={item.id} to={item.link || `/cases/${item.id}`} className="group min-w-[280px] md:min-w-0">
              <div className="mb-4 overflow-hidden rounded-[8px] bg-slate-100">
                <div className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105">
                  <ResponsiveImage
                    src={item.image_url}
                    alt={item.title}
                    kind="card"
                    sizes="(min-width: 768px) 33vw, 280px"
                    className="h-full w-full object-cover"
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

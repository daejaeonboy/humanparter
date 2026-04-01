import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/Container";
import { ResponsiveImage } from "./ui/ResponsiveImage";
import { getPublicHomeData } from "../src/api/publicDataApi";
import { usePrerenderData } from "../src/prerender/context";

export const CompanyIntroSection: React.FC = () => {
  const preloadedImageUrl = usePrerenderData()?.home?.companyIntroImageUrl;
  const [imageUrl, setImageUrl] = useState(
    preloadedImageUrl || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  );

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        if (preloadedImageUrl && isMounted) {
          setImageUrl(preloadedImageUrl);
        }

        const data = await getPublicHomeData();
        if (isMounted && data.companyIntroImageUrl) {
          setImageUrl(data.companyIntroImageUrl);
        }
      } catch (error) {
        console.error("Failed to load company intro image:", error);
      }
    };

    void loadImage();
    return () => {
      isMounted = false;
    };
  }, [preloadedImageUrl]);

  return (
    <section className="bg-white py-12 md:py-24">
      <Container>
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:max-w-[560px] lg:text-left">
            <h2 className="text-[24px] font-medium leading-[1.2] text-black md:text-[48px] md:leading-[1.2] tracking-tight">
              기업의 비전을 <br className="hidden md:block" />
              완벽한 공간으로 구현하는 <br className="hidden md:block" />
              휴먼파트너입니다.
            </h2>
            <p className="mt-6 max-w-2xl text-[16px] font-normal leading-[1.6] text-slate-700 md:mt-10 md:text-[18px] md:leading-[1.8]">
              고객의 목표를 정확히 이해하고, 예산과 일정에 맞춘 가장 효율적이고 창의적인 렌탈 솔루션을 제안합니다.
            </p>
            
            <div className="mt-10 flex justify-center lg:justify-start md:mt-12">
              <Link
                to="/company"
                className="inline-flex h-12 min-w-[162px] items-center justify-center border border-black bg-transparent px-8 text-[16px] font-medium tracking-tight text-black transition-colors hover:bg-black hover:text-white active:bg-black active:text-white"
              >
                자세히 보기
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full flex-1 max-w-lg lg:ml-auto lg:max-w-[620px] lg:flex-[0.95]">
            <div className="aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-[8px] border border-gray-100 shadow-sm">
              <ResponsiveImage
                src={imageUrl}
                alt="Human Partner Office Solution"
                kind="detail"
                sizes="(min-width: 1024px) 620px, 100vw"
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

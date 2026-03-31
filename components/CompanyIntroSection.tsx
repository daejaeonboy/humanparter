import React from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/Container";

export const CompanyIntroSection: React.FC = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:max-w-[560px] lg:text-left">
            <h2 className="text-[32px] font-medium leading-[1.3] text-black md:text-[48px] md:leading-[1.2]">
              기업의 비전을 <br />
              완벽한 공간으로 구현하는 <br />
              휴먼파트너입니다.
            </h2>
            <p className="mt-10 max-w-2xl text-[16px] font-normal leading-[1.8] text-[#555555] md:text-[18px]">
              고객의 목표를 정확히 이해하고, 예산과 일정에 맞춘 가장 효율적이고 창의적인 렌탈 솔루션을 제안합니다.
            </p>
            
            <div className="mt-12 flex justify-center lg:justify-start">
              <Link
                to="/company"
                className="inline-flex h-12 min-w-[162px] items-center justify-center border border-black bg-transparent px-8 text-[16px] font-medium tracking-tight text-black transition-colors hover:bg-black hover:text-white"
              >
                자세히 보기
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full flex-1 max-w-lg lg:ml-auto lg:max-w-[620px] lg:flex-[0.95]">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
                alt="Human Partner Office Solution"
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

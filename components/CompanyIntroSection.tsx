import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container } from "./ui/Container";

export const CompanyIntroSection: React.FC = () => {
  return (
    <section className="bg-white py-12 md:py-16">
      <Container>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-6 text-[12px] font-bold tracking-[0.2em] text-gray-400 uppercase">
              SLOGAN
            </p>
            <h2 className="text-[32px] font-bold leading-[1.3] text-black md:text-[48px] md:leading-[1.2]">
              기업의 비전을 <br />
              완벽한 공간으로 구현하는 <br />
              휴먼파트너입니다.
            </h2>
            <p className="mt-8 max-w-2xl text-[16px] font-medium leading-[1.8] text-[#555555] md:text-[18px]">
              고객의 목표를 정확히 이해하고, 예산과 일정에 맞춘 가장 효율적이고 창의적인 렌탈 솔루션을 제안합니다.
            </p>
            
            <div className="mt-10 flex justify-center lg:justify-start">
              <Link
                to="/company"
                className="group inline-flex items-center justify-center border border-black bg-white px-10 py-4 text-[15px] font-bold text-black transition-all hover:bg-black hover:text-white"
              >
                자세히 보기
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex-1 w-full max-w-lg lg:ml-auto">
            <div className="aspect-[4/3] overflow-hidden rounded-[8px] shadow-xl border border-gray-100">
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

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui/Container';

export const PromoSection: React.FC = () => {
  return (
    <section className="bg-white pb-24 pt-16 md:pb-32 md:pt-24">
      <Container>
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl bg-[#001E45] px-8 py-16 text-center shadow-xl md:min-h-[380px] md:px-16 md:py-20">
          <div className="relative z-10 mx-auto flex w-full max-w-[800px] flex-col items-center justify-center">
            <h2 className="mb-4 text-[32px] font-bold leading-[1.3] text-white md:text-[48px] md:leading-[1.2] tracking-tight">
              최적의 렌탈 솔루션,
              <br />
              휴먼파트너
            </h2>
            
            <p className="mb-10 text-[16px] font-medium text-white/60 md:mb-12 md:text-[18px]">
              비즈니스에 필요한 모든 렌탈을 제안합니다.
            </p>

            <Link
              to="/quote-request"
              className="group flex h-[60px] items-center gap-3 rounded-full bg-white px-12 text-[17px] font-bold text-[#001E45] transition-all hover:scale-105 hover:shadow-lg active:scale-95"
            >
              견적 문의하기
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

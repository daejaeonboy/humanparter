import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui/Container';

export const PromoSection: React.FC = () => {
  return (
    <section className="bg-white py-12 md:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[40px] bg-[#050b1a] px-8 py-20 text-center md:px-16 md:py-28 shadow-2xl">
          {/* Background Gradients */}
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center">
            <span className="mb-8 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-2 text-[12px] font-bold tracking-[0.2em] text-blue-400">
              CONTACT US
            </span>
            
            <h2 className="mb-8 text-[32px] font-bold leading-[1.3] text-white md:text-[52px] md:leading-[1.2]">
              성공적인 비즈니스를 위한
              <br />
              최적의 렌탈 솔루션을 제안합니다.
            </h2>
            
            <p className="mb-14 max-w-2xl text-[15px] font-medium leading-[1.8] text-white/50 md:text-[18px]">
              기업 규모와 환경에 맞는 맞춤형 컨설팅부터 설치, 유지관리, 회수까지
              <br className="hidden md:block" />
              휴먼파트너가 모든 과정을 책임집니다. 지금 바로 견적 문의를 시작하세요.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Link
                to="/quote-request"
                className="group flex h-[64px] items-center gap-3 rounded-2xl bg-white px-10 text-[17px] font-bold text-black transition-transform hover:scale-105"
              >
                견적 문의하기
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/cs"
                className="flex h-[64px] items-center rounded-2xl border border-white/20 bg-white/5 px-10 text-[17px] font-bold text-white transition-colors hover:bg-white/10"
              >
                제휴 및 대량 견적 문의
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

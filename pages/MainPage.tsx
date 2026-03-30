import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Seo } from "../components/Seo";
import { Container } from "../components/ui/Container";
import { MainVisualSlider } from "../components/MainVisualSlider";
import { MainCategoryTabs } from "../components/MainCategoryTabs";
import { CompanyIntroSection } from "../components/CompanyIntroSection";
import { InstallationCasesSection } from "../components/InstallationCasesSection";
import { PromoSection } from "../components/PromoSection";
import { ClientLogoMarqueeSection } from "../components/ClientLogoMarqueeSection";
import { PopupManager } from "../components/Layout/PopupManager";
import { buildOrganizationStructuredData, buildWebsiteStructuredData } from "../src/utils/seo";

interface OperationStep {
  step: string;
  title: string;
  description: string;
}

const operationSteps: OperationStep[] = [
  {
    step: "01",
    title: "상담",
    description: "규모를 파악 후 사용목적에 적합한 맞춤형 컨설팅 제공 및 견적서 발송",
  },
  {
    step: "02",
    title: "계약",
    description: "최적화된 렌탈 플랜 확정 및 간편한 온라인 계약 체결 프로세스 진행",
  },
  {
    step: "03",
    title: "설치",
    description: "약속된 일정에 맞춰 전문 인력이 직접 방문하여 안전하고 신속하게 설치",
  },
  {
    step: "04",
    title: "관리",
    description: "사용 기간 중 정기 점검 및 장애 발생 시 즉각적인 A/S와 사후 관리 지원",
  },
];

export const MainPage: React.FC = () => {
  return (
    <main className="bg-white text-black">
      <Seo
        title="휴먼파트너 | 종합렌탈 전문기업"
        description="기업 환경에 맞춘 사무가구 렌탈부터 설치, 운영 지원까지 제공하는 휴먼파트너의 B2B 렌탈 서비스입니다."
        canonicalPath="/"
        structuredData={[buildOrganizationStructuredData(), buildWebsiteStructuredData()]}
      />
      <PopupManager />

      <MainVisualSlider />
      
      <CompanyIntroSection />

      {/* 체계적인 렌탈 프로세스 섹션 */}
      <section className="bg-white py-10 md:py-16">
        <Container>
          <div className="mb-10 md:mb-14">
            <p className="mb-4 text-[11px] font-bold tracking-[0.15em] text-black/40 uppercase">OPERATION FLOW</p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-black md:text-4xl">
              체계적인 렌탈 프로세스
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {operationSteps.map((item) => (
              <article
                key={item.step}
                className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center transition-all hover:border-black/5 hover:shadow-xl hover:shadow-black/[0.04] md:items-start md:text-left"
              >
                <span className="mb-6 block text-4xl font-black italic tracking-tighter text-black/5 transition-colors group-hover:text-black/10">
                  {item.step}
                </span>
                <h3 className="mb-4 text-xl font-bold text-black">{item.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-black/60">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <MainCategoryTabs />

      <InstallationCasesSection />

      <ClientLogoMarqueeSection />

      <PromoSection />
    </main>
  );
};

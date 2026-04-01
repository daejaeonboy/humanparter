import React from "react";
import { Seo } from "../components/Seo";
import { Container } from "../components/ui/Container";
import { MainVisualSlider } from "../components/MainVisualSlider";
import { MainCategoryTabs } from "../components/MainCategoryTabs";
import { CompanyIntroSection } from "../components/CompanyIntroSection";
import { InstallationCasesSection } from "../components/InstallationCasesSection";
import { NoticeSection } from "../components/NoticeSection";
import { PromoSection } from "../components/PromoSection";
import { RentalProcessSection } from "../components/RentalProcessSection";
import { ClientLogoMarqueeSection } from "../components/ClientLogoMarqueeSection";
import { PopupManager } from "../components/Layout/PopupManager";
import { buildLocalBusinessStructuredData, buildOrganizationStructuredData, buildWebsiteStructuredData } from "../src/utils/seo";

export const MainPage: React.FC = () => {
  return (
    <main className="bg-white text-black">
      <Seo
        title="휴먼파트너 | 종합렌탈 전문기업"
        description="기업 환경에 맞춘 사무가구 렌탈부터 설치, 운영 지원까지 제공하는 휴먼파트너의 B2B 렌탈 서비스입니다."
        canonicalPath="/"
        structuredData={[buildOrganizationStructuredData(), buildWebsiteStructuredData(), buildLocalBusinessStructuredData()]}
      />
      <PopupManager />

      <MainVisualSlider />

      <ClientLogoMarqueeSection />
      
      <CompanyIntroSection />

      <RentalProcessSection />

      <MainCategoryTabs />

      <InstallationCasesSection />

      <NoticeSection />

      <PromoSection />
    </main>
  );
};

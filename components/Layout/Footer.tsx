import React, { useEffect, useState } from "react";
import { ArrowUp, MonitorPlay } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { siteBrand } from "../../src/config/siteBrand";

type FooterLink = {
  label: string;
  to: string;
};

const footerColumns: FooterLink[][] = [
  [
    { label: "회사 소개", to: "/company" },
    { label: "사업영역", to: "/company/business" },
    { label: "오시는길", to: "/company/location" },
  ],
  [
    { label: "렌탈 품목", to: "/products" },
    { label: "설치 사례", to: "/cases" },
    { label: "견적 요청", to: "/quote-request" },
  ],
  [
    { label: "고객센터", to: "/cs" },
    { label: "A/S 안내", to: "/cs/as-guide" },
    { label: "정보센터", to: "/notice" },
  ],
];

const policyLinks: FooterLink[] = [
  { label: "\uC774\uC6A9\uC57D\uAD00", to: "/terms" },
  { label: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68", to: "/privacy" },
];

const labels = {
  homeAria: "\uD734\uBA3C\uD30C\uD2B8\uB108 \uD648\uC73C\uB85C \uC774\uB3D9",
  kakao: "\uCE74\uCE74\uC624 \uC0C1\uB2F4",
  phone: "\uC804\uD654 \uBB38\uC758",
  mail: "\uBA54\uC77C \uBB38\uC758",
  remote: "\uC628\uB77C\uC778 \uC6D0\uACA9\uC0C1\uB2F4",
  remoteAria: "\uC628\uB77C\uC778 \uC6D0\uACA9\uC0C1\uB2F4 \uC5F4\uAE30",
};

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentYear = new Date().getFullYear();
  const footer = siteBrand.footer;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-20 bg-[#202936] pb-20 text-white md:mt-28 md:pb-10">
      <Container className="py-14 md:py-16">
        <div className="flex flex-col gap-12 border-b border-white/10 pb-10 md:gap-14 md:pb-12 lg:flex-row lg:items-start lg:justify-between">
          <Link
            to="/"
            aria-label={labels.homeAria}
            className="inline-flex items-center"
          >
            <img src="/footerlogo.png" alt={siteBrand.header.logoText} className="h-[34px] w-auto object-contain md:h-[40px]" />
          </Link>

          <div className="grid w-full flex-1 grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-4 md:gap-x-12 lg:max-w-[980px] lg:gap-x-16">
            {footerColumns.map((column, columnIndex) => (
              <ul key={`footer-column-${columnIndex}`} className="space-y-4 text-[15px] font-semibold tracking-[-0.02em] text-white">
                {column.map((item) => (
                  <li key={`${item.label}-${item.to}`}>
                    <Link to={item.to} className="transition-colors hover:text-white/70">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

            <ul className="col-span-2 space-y-4 text-[15px] font-semibold tracking-[-0.02em] text-white md:col-span-1">
              <li>
                <a
                  href={footer.kakaoChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center transition-colors hover:text-white/70"
                >
                  {labels.kakao}
                </a>
              </li>
              <li>
                <a
                  href="tel:18001985"
                  className="flex flex-col items-start gap-1 transition-colors hover:text-white/70"
                >
                  <span>{labels.phone}</span>
                  <span className="text-sm font-medium text-white/55">1800-1985</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hm_solution@naver.com"
                  className="flex flex-col items-start gap-1 transition-colors hover:text-white/70"
                >
                  <span>{labels.mail}</span>
                  <span className="break-all text-sm font-medium text-white/55 md:break-normal">hm_solution@naver.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8 pt-8 md:pt-10">
          <div className="space-y-3 text-sm leading-relaxed text-white/65">
            {footer.companyInfoLines.map((line) => (
              <p key={line}>{line}</p>
            ))}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-[14px] font-semibold text-white/90">
              <span>Copyright {currentYear}. {footer.copyrightOwner}. All rights reserved.</span>
              {policyLinks.map((item) => (
                <Link key={`${item.label}-${item.to}`} to={item.to} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <a
        href="https://367.co.kr"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-8 left-1/2 z-[60] hidden w-[calc(100%-2rem)] max-w-[340px] -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-[#0b2a5a] bg-[#001E45] px-5 py-3.5 text-[14px] font-semibold tracking-[0.01em] text-white transition-all duration-300 hover:-translate-x-1/2 hover:-translate-y-1 hover:bg-[#0b2a5a] lg:inline-flex"
        aria-label={labels.remoteAria}
      >
        <MonitorPlay size={16} className="transition-transform duration-300 group-hover:scale-105" />
        <span>{labels.remote}</span>
      </a>

      <div className="fixed bottom-[100px] right-4 z-[60] flex flex-col gap-2 md:bottom-12 md:right-8">
        <a
          href={footer.kakaoChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[#fde500] shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:h-12 md:w-12"
          aria-label={footer.kakaoButtonAriaLabel}
        >
          <img
            src={footer.kakaoImagePath}
            alt={footer.kakaoButtonAriaLabel}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </a>

        <button
          onClick={scrollToTop}
          className="group flex h-12 w-12 items-center justify-center rounded-lg bg-[#001E45] text-white shadow-md transition-all duration-500 hover:bg-[#0b2a5a] hover:shadow-lg md:h-12 md:w-12 translate-y-0 scale-100 opacity-100 blur-0"
          aria-label={footer.scrollTopAriaLabel}
        >
          <ArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  );
}

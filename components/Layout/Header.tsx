import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Container } from "../ui/Container";
import { siteBrand } from "../../src/config/siteBrand";

interface NavLinkItem {
  label: string;
  to: string;
  cta?: boolean;
}

const gnbLinks: NavLinkItem[] = [
  { label: "고객사례", to: "/cases" },
  { label: "기업소개", to: "/company" },
  { label: "렌탈품목", to: "/products" },
  { label: "견적문의", to: "/quote-request", cta: true },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);

  useEffect(() => {
    if (!mobileMenuMounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuMounted]);

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuMounted(true);
      return;
    }

    if (!mobileMenuMounted) return;
    const timeout = window.setTimeout(() => setMobileMenuMounted(false), 320);
    return () => window.clearTimeout(timeout);
  }, [mobileMenuMounted, mobileMenuOpen]);

  const openMobileMenu = () => {
    setMobileMenuMounted(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMobileMenuOpen(true));
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const desktopLinkClassName = "text-slate-800 hover:text-black";

  return (
    <header className="w-full bg-white">
      <Container size="wide">
        <div className="flex h-[80px] items-center justify-between">
          <Link
            to="/"
            className="flex items-center text-xl font-medium tracking-tight text-black md:text-2xl"
          >
            <img
              src="/logo.png"
              alt={siteBrand.header.logoText}
              className="h-[48px] w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {gnbLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[16px] font-medium tracking-tight transition ${desktopLinkClassName}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={openMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-none text-black md:hidden"
            aria-label="모바일 메뉴 열기"
          >
            <Menu size={20} />
          </button>
        </div>
      </Container>

      {mobileMenuMounted && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobileMenu}
            aria-label="모바일 메뉴 닫기"
          />

          <aside
            className={`absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <span className="text-lg font-medium tracking-tight text-black">
                <img src="/logo.png" alt={siteBrand.header.logoText} className="h-[36px] w-auto object-contain" />
              </span>
              <button
                onClick={closeMobileMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-none border border-gray-200 text-black"
                aria-label="모바일 메뉴 닫기 버튼"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-4 py-4">
              <nav className="space-y-2">
                {gnbLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`block rounded-none border border-gray-100 px-4 py-3 text-sm font-medium text-black`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};

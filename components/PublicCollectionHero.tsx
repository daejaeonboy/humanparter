import React, { useState } from 'react';
import { ResponsiveImage } from './ui/ResponsiveImage';

export interface PublicCollectionHeroTab {
  label: string;
  value: string;
}

interface PublicCollectionHeroProps {
  title: string;
  description: string;
  imageUrl: string;
  tabs?: PublicCollectionHeroTab[];
  activeValue?: string;
  onSelect?: (value: string) => void;
  topRightAction?: React.ReactNode;
}

export const PublicCollectionHero: React.FC<PublicCollectionHeroProps> = ({
  title,
  description,
  imageUrl,
  tabs = [],
  activeValue,
  onSelect,
  topRightAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTabLabel = tabs.find(t => t.value === activeValue)?.label || '선택하기';
  const hasTabs = tabs.length > 0;

  return (
    <section className="relative overflow-visible bg-transparent">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
          <ResponsiveImage
            src={imageUrl}
            alt=""
            kind="hero"
            priority
            className="h-full w-full object-cover"
            sizes="100vw"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,18,46,0.95)_0%,rgba(1,12,34,0.84)_46%,rgba(0,7,22,0.96)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.22)_100%)]" />

        {topRightAction && (
          <div className="pointer-events-auto absolute right-4 top-4 z-40 md:right-8 md:top-8">
            {topRightAction}
          </div>
        )}

        <div className="pointer-events-none relative z-20 flex h-[280px] items-center justify-center px-6 py-6 text-center md:h-[420px] md:px-10 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-[32px] font-extrabold tracking-tight text-white md:text-[62px] md:leading-[1.1]">
              {title}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-white/95 md:mt-5 md:text-lg md:leading-8">
              {description}
            </p>
          </div>
        </div>
      </div>

      {hasTabs && (
        <div className="absolute bottom-0 left-1/2 z-30 w-full max-w-[1440px] -translate-x-1/2 translate-y-1/2 px-4 md:px-8">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 bg-white">
            <div className="flex min-w-max overflow-hidden md:min-w-0">
              {tabs.map((tab, index) => {
                const isLast = index === tabs.length - 1;
                const isActive = activeValue === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => onSelect?.(tab.value)}
                    className={`min-w-[140px] flex-1 px-5 py-4 text-sm font-semibold transition md:text-base ${
                      isActive
                        ? 'bg-[#eeeeee] text-slate-900'
                        : 'bg-white text-slate-700 hover:bg-[#f5f5f5]'
                    } ${isLast ? '' : 'border-r border-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Dropdown View */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-900 shadow-lg"
            >
              <span>{activeTabLabel}</span>
              <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
            
            {isOpen && (
              <div className="absolute left-0 top-full mt-1 w-full border border-slate-200 bg-white shadow-xl">
                {tabs.map((tab) => {
                  const isActive = activeValue === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => {
                        onSelect?.(tab.value);
                        setIsOpen(false);
                      }}
                      className={`block w-full px-5 py-4 text-left text-sm font-semibold transition ${
                        isActive ? 'bg-[#eeeeee] text-[#001e45]' : 'bg-white text-slate-700 active:bg-slate-50'
                      } border-b border-slate-100 last:border-0`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

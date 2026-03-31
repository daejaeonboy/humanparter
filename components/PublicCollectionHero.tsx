import React from 'react';

export interface PublicCollectionHeroTab {
  label: string;
  value: string;
}

interface PublicCollectionHeroProps {
  title: string;
  description: string;
  imageUrl: string;
  tabs: PublicCollectionHeroTab[];
  activeValue: string;
  onSelect: (value: string) => void;
  topRightAction?: React.ReactNode;
}

export const PublicCollectionHero: React.FC<PublicCollectionHeroProps> = ({
  title,
  description,
  imageUrl,
  tabs,
  activeValue,
  onSelect,
  topRightAction,
}) => {
  return (
    <section className="relative overflow-visible bg-transparent">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,18,46,0.95)_0%,rgba(1,12,34,0.84)_46%,rgba(0,7,22,0.96)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.22)_100%)]" />

        {topRightAction && (
          <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
            {topRightAction}
          </div>
        )}

        <div className="relative z-20 flex h-[320px] items-center justify-center px-6 py-16 text-center md:h-[420px] md:px-10 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-[34px] font-extrabold tracking-tight text-white md:text-[62px] md:leading-[1.1]">
              {title}
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/80 md:text-lg md:leading-8">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-[1440px] -translate-x-1/2 translate-y-1/2 px-4 md:px-8">
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <div className="flex min-w-max overflow-hidden md:min-w-0">
            {tabs.map((tab, index) => {
              const isLast = index === tabs.length - 1;
              const isActive = activeValue === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onSelect(tab.value)}
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
      </div>
    </section>
  );
};

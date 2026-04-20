import React, { useEffect, useState } from "react";
import { AllianceMember, getAllianceMembers } from "../src/api/cmsApi";

interface LogoItem {
  id?: string;
  name: string;
  imageSrc?: string;
}

interface MarqueeRowProps {
  logos: LogoItem[];
}

const logoFrameClass =
  "flex h-14 w-[150px] shrink-0 items-center justify-center rounded-2xl border border-transparent px-3 md:h-16 md:w-[210px]";

const fallbackLogos: LogoItem[] = [
  { name: "KOREA NATIONAL UNIVERSITY" },
  { name: "SK telecom" },
  { name: "SHINSEGAE" },
  { name: "LG\uC0DD\uD65C\uAC74\uAC15" },
  { name: "THE HYUNDAI" },
  { name: "\uB300\uD55C\uBBFC\uAD6D\uBC15\uBB3C\uAD00\uD611\uD68C" },
  { name: "emart" },
  { name: "citi" },
  { name: "Hanwha Hotels & Resorts" },
  { name: "\uC0BC\uC131\uC11C\uC6B8\uBCD1\uC6D0" },
  { name: "BIFAN" },
];

const ensureMinimumRowLength = (items: LogoItem[], minimum: number) => {
  if (items.length === 0) return items;

  const repeated: LogoItem[] = [];
  while (repeated.length < minimum) {
    repeated.push(...items);
  }

  return repeated;
};

const MarqueeRow: React.FC<MarqueeRowProps> = ({ logos }) => {
  // Triple the logos to ensure enough width for continuous animation
  const repeated = [...logos, ...logos, ...logos];
  // Calculate duration based on single logo set length (one logos array is roughly what moves in duration)
  const animationDuration = `${Math.max(20, logos.length * 4)}s`;

  return (
    <div className="w-full overflow-hidden">
      <div
        className="animate-marquee-left flex w-max items-center gap-6 py-4 will-change-transform md:gap-10 md:py-5"
        style={{ "--duration": animationDuration } as React.CSSProperties}
      >
        {repeated.map((item, index) => (
          <div key={`${item.id || item.name}-${index}`} className={logoFrameClass}>
            {item.imageSrc ? (
              <img
                src={item.imageSrc}
                alt={item.name}
                className="max-h-9 w-auto max-w-full object-contain md:max-h-11"
                loading="lazy"
              />
            ) : (
              <span className="text-center text-lg font-black tracking-[-0.02em] text-slate-500/80 md:text-[28px]">
                {item.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ClientLogoMarqueeSection: React.FC = () => {
  const [logos, setLogos] = useState<LogoItem[]>(fallbackLogos);

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const data = await getAllianceMembers();
        const mapped = data
          .filter((item: AllianceMember) => item.is_active && item.logo_url)
          .map((item: AllianceMember) => ({
            id: item.id,
            name: item.name,
            imageSrc: item.logo_url || undefined,
          }));

        if (mapped.length > 0) {
          setLogos(mapped);
        }
      } catch (error) {
        console.error("Failed to load client logos:", error);
      }
    };

    loadLogos();
  }, []);
  const marqueeLogos = ensureMinimumRowLength(logos.length > 0 ? logos : fallbackLogos, 6);

  return (
    <section className="bg-white py-8 md:py-16">
      <div className="w-full overflow-x-hidden">
        <MarqueeRow logos={marqueeLogos} />
      </div>
    </section>
  );
};

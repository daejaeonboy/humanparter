import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/Container";
import { ResponsiveImage } from "./ui/ResponsiveImage";
import { ArrowRight } from "lucide-react";
import { buildCategoryTabItems, FALLBACK_CATEGORY_TAB_ITEMS } from "../src/config/categoryTabs";
import { getPublicBootstrapData } from "../src/api/publicDataApi";
import { usePrerenderData } from "../src/prerender/context";

interface MainCategoryTabsProps {
  variant?: "default" | "compact";
}

export const MainCategoryTabs: React.FC<MainCategoryTabsProps> = ({ variant = "default" }) => {
  const preloadedNavItems = usePrerenderData()?.bootstrap?.navItems;
  const [categoryItems, setCategoryItems] = useState(
    preloadedNavItems ? buildCategoryTabItems(preloadedNavItems) : FALLBACK_CATEGORY_TAB_ITEMS,
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const isCompact = variant === "compact";

  useEffect(() => {
    let isMounted = true;

    const applyNavItems = (navItems: typeof preloadedNavItems) => {
      if (!navItems || !isMounted) return;
      setCategoryItems(buildCategoryTabItems(navItems));
    };

    const loadCategoryTabs = async () => {
      try {
        const { navItems } = await getPublicBootstrapData();
        applyNavItems(navItems);
      } catch (error) {
        console.error("Failed to load category tabs:", error);
      }
    };

    applyNavItems(preloadedNavItems);
    void loadCategoryTabs();

    return () => {
      isMounted = false;
    };
  }, [preloadedNavItems]);

  useEffect(() => {
    setHoveredIndex((current) => {
      if (categoryItems.length === 0) return null;
      if (current === null || current >= categoryItems.length) return 0;
      return current;
    });
  }, [categoryItems.length]);

  if (isCompact) {
    return (
      <section className="border-b border-gray-100 bg-white py-6">
        <Container>
          <div className="flex flex-wrap gap-2 justify-center">
            {[{name: "전체", to: "/products"}, ...categoryItems].map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:border-black hover:text-black transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-24">
      <Container>
        <div className="mb-10 flex items-end justify-between md:mb-14">
          <h2 className="text-[24px] font-medium leading-tight tracking-tight text-black md:text-4xl">카테고리</h2>
          <Link to="/products" className="flex items-center gap-1.5 text-[15px] font-bold text-slate-700 hover:text-black transition-colors">
            전체보기 <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4 md:hidden">
          {categoryItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className="relative aspect-[4/5] min-w-[240px] overflow-hidden rounded-[8px]"
            >
              <ResponsiveImage
                src={item.imageUrl}
                alt={item.name}
                kind="card"
                sizes="240px"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6">
                <span className="block text-xl font-bold text-white">
                  {item.name}
                </span>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/90">
                  <span>품목 보기</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop Accordion Style */}
        <div className="hidden md:flex aspect-[3/1] w-full gap-4 overflow-hidden">
          {categoryItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <Link
                key={item.name}
                to={item.to}
                onMouseEnter={() => setHoveredIndex(index)}
                className={`relative h-full overflow-hidden rounded-[8px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isHovered ? "flex-[3.2] shadow-2xl" : "flex-1 grayscale opacity-70 hover:opacity-100"
                }`}
              >
                {/* Background Image */}
                <ResponsiveImage
                  src={item.imageUrl}
                  alt={item.name}
                  kind="card"
                  sizes="(min-width: 768px) 25vw, 240px"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
                  style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-40'}`} />

                {/* Content */}
                <div className={`absolute bottom-0 left-0 w-full p-4 md:p-8 transition-all duration-500 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"}`}>
                  <span className={`block font-bold tracking-tight text-white transition-all duration-500 ${isHovered ? "text-xl md:text-3xl" : "text-sm md:text-base [writing-mode:vertical-lr] md:[writing-mode:horizontal-tb]"}`}>
                    {item.name}
                  </span>
                  
                  {isHovered && (
                    <div className="mt-3 flex items-center gap-2 text-[12px] font-medium text-white/95 md:text-sm">
                      <span>자세히 보기</span>
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

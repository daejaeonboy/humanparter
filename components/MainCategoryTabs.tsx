import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/Container";
import { ArrowRight } from "lucide-react";
import { getNavMenuItems } from "../src/api/cmsApi";
import { buildCategoryTabItems, FALLBACK_CATEGORY_TAB_ITEMS } from "../src/config/categoryTabs";

interface MainCategoryTabsProps {
  variant?: "default" | "compact";
}

export const MainCategoryTabs: React.FC<MainCategoryTabsProps> = ({ variant = "default" }) => {
  const [categoryItems, setCategoryItems] = useState(FALLBACK_CATEGORY_TAB_ITEMS);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const isCompact = variant === "compact";

  useEffect(() => {
    let isMounted = true;

    const loadCategoryTabs = async () => {
      try {
        const navItems = await getNavMenuItems();
        const nextItems = buildCategoryTabItems(navItems);
        if (isMounted) {
          setCategoryItems(nextItems);
        }
      } catch (error) {
        console.error("Failed to load category tabs:", error);
      }
    };

    void loadCategoryTabs();

    return () => {
      isMounted = false;
    };
  }, []);

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
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mb-12 flex items-end justify-between md:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-black md:text-[32px]">카테고리</h2>
          <Link to="/products" className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-black transition-colors">
            전체보기 <ArrowRight size={16} />
          </Link>
        </div>

        {/* 
          비율 계산: 5개 아이템
          확대된 아이템 flex-[3.2], 나머지 4개 flex-[1] => 총합 7.2
          전체 컨테이너 aspect-[3/1] 설정 시
          확대 아이템 비율: (3.2 / 7.2 * 3) / 1 = 1.333 (정확히 4:3)
        */}
        <div className="flex aspect-[4/3] w-full gap-4 overflow-hidden md:aspect-[3/1]">
          {categoryItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <Link
                key={item.name}
                to={item.to}
                onMouseEnter={() => setHoveredIndex(index)}
                className={`relative h-full overflow-hidden rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isHovered ? "flex-[3.2] shadow-2xl" : "flex-1 grayscale opacity-70 hover:opacity-100"
                }`}
              >
                {/* Background Image */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
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
                    <div className="mt-3 flex items-center gap-2 text-[12px] font-medium text-white/80 md:text-sm">
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

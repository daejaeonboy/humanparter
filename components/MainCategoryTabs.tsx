import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "./ui/Container";
import { ArrowRight } from "lucide-react";

interface CategoryItem {
  name: string;
  to: string;
  imageUrl: string;
}

const createCategoryLink = (category?: string) => {
  const params = new URLSearchParams();
  if (category && category !== "전체") {
    params.set("category", category);
  }
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
};

const categoryItems: CategoryItem[] = [
  {
    name: "IT장비",
    to: createCategoryLink("IT장비"),
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "사무기기",
    to: createCategoryLink("사무기기"),
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "사무가구",
    to: createCategoryLink("사무가구"),
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "가전제품",
    to: createCategoryLink("가전제품"),
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "행사용품",
    to: createCategoryLink("행사용품"),
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
  },
];

interface MainCategoryTabsProps {
  variant?: "default" | "compact";
}

export const MainCategoryTabs: React.FC<MainCategoryTabsProps> = ({ variant = "default" }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const isCompact = variant === "compact";

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
    <section className="bg-white py-12 md:py-16">
      <Container>
        <div className="mb-10 flex items-end justify-between">
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
        <div className="flex aspect-[4/3] w-full gap-1 overflow-hidden md:aspect-[3/1]">
          {categoryItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <Link
                key={item.name}
                to={item.to}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(index)}
                className={`relative h-full overflow-hidden rounded-[4px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
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

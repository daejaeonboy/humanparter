import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { PublicCollectionHero } from '../components/PublicCollectionHero';
import { Container } from '../components/ui/Container';
import { Seo } from '../components/Seo';
import { CS_SECTION_TABS } from '../src/config/publicMegaMenu';
import { getCollectionHeroVisual } from '../src/content/publicVisualsContent';
import { usePublicVisuals } from '../src/hooks/usePublicVisuals';
import { buildBreadcrumbStructuredData, buildSeoTitle } from '../src/utils/seo';

type AsGuideItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const AS_GUIDE_ITEMS: AsGuideItem[] = [
  {
    id: 'as-guide-1',
    category: '접수안내',
    question: 'A/S 접수는 어디로 하면 되나요?',
    answer:
      '대표번호 1800-1985 또는 카카오 채널을 통해 접수하실 수 있습니다. 장애 증상, 설치 장소, 담당자 연락처를 함께 전달해주시면 보다 빠르게 확인할 수 있습니다.',
  },
  {
    id: 'as-guide-2',
    category: '접수안내',
    question: '접수할 때 어떤 정보를 미리 준비하면 좋나요?',
    answer:
      '제품명 또는 사용 품목, 설치 위치, 장애 발생 시점, 현재 증상, 현장 사진을 준비해주시면 원격 확인과 현장 대응 여부를 빠르게 판단할 수 있습니다.',
  },
  {
    id: 'as-guide-3',
    category: '처리절차',
    question: 'A/S는 어떤 순서로 진행되나요?',
    answer:
      '접수 후 담당자가 장애 내용을 1차 확인하고, 원격 안내로 해결 가능한 경우 우선 조치합니다. 현장 방문이 필요한 경우 일정 조율 후 점검, 교체 또는 재설치를 진행합니다.',
  },
  {
    id: 'as-guide-4',
    category: '처리절차',
    question: '긴급 장애도 대응이 가능한가요?',
    answer:
      '행사, 교육, 공공 프로젝트처럼 운영 일정이 중요한 현장은 우선순위를 높여 대응합니다. 일정과 증상에 따라 대체 장비 투입 여부도 함께 검토합니다.',
  },
  {
    id: 'as-guide-5',
    category: '방문지원',
    question: '현장 방문 지원 범위는 어디까지인가요?',
    answer:
      '기본 점검, 장비 교체, 재배치, 케이블 및 연결 상태 확인, 사용 환경 점검까지 현장 상황에 맞춰 지원합니다. 대규모 현장은 별도 일정 협의 후 순차 대응합니다.',
  },
  {
    id: 'as-guide-6',
    category: '방문지원',
    question: '설치 이후 위치 변경이나 재세팅도 요청할 수 있나요?',
    answer:
      '네, 운영 중 좌석 변경, 장비 재배치, 행사/교육 환경 변경에 따른 재세팅도 요청 가능합니다. 요청 범위와 일정에 따라 별도 안내가 함께 제공됩니다.',
  },
  {
    id: 'as-guide-7',
    category: '유의사항',
    question: 'A/S 요청 전에 먼저 확인하면 좋은 항목이 있나요?',
    answer:
      '전원 상태, 멀티탭 및 케이블 연결, 네트워크 연결 여부, 주변기기 연결 상태를 먼저 확인해주시면 간단한 장애는 빠르게 해결될 수 있습니다.',
  },
  {
    id: 'as-guide-8',
    category: '유의사항',
    question: '소모품이나 사용자 부주의로 인한 문제도 지원되나요?',
    answer:
      '기본 점검은 가능하지만, 소모품 교체나 파손 상태에 따라 별도 비용 또는 대체 장비 안내가 필요할 수 있습니다. 접수 시 현장 사진을 함께 전달해주시면 보다 정확히 안내드립니다.',
  },
];

const AS_GUIDE_CATEGORIES = ['접수안내', '처리절차', '방문지원', '유의사항'];

export const AsGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const publicVisuals = usePublicVisuals();
  const [activeCategory, setActiveCategory] = useState(AS_GUIDE_CATEGORIES[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const heroContent = getCollectionHeroVisual(publicVisuals, 'cs', 'asGuide');

  const filteredItems = useMemo(
    () => AS_GUIDE_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  const toggleAccordion = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-white pb-20 pt-0">
      <Seo
        title={buildSeoTitle('A/S 안내')}
        description="휴먼파트너의 A/S 접수 방법, 처리 절차, 방문 지원 범위와 운영 기준을 안내합니다."
        canonicalPath="/cs/as-guide"
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: '홈', path: '/' },
            { name: '고객센터', path: '/cs' },
            { name: 'A/S 안내', path: '/cs/as-guide' },
          ]),
        ]}
      />

      <PublicCollectionHero
        title={heroContent.title || 'A/S 안내'}
        description={heroContent.description}
        imageUrl={heroContent.imageUrl}
        tabs={CS_SECTION_TABS.map((tab) => ({ label: tab.label, value: tab.value }))}
        activeValue="as-guide"
        onSelect={(value) => {
          const selectedTab = CS_SECTION_TABS.find((tab) => tab.value === value);
          if (selectedTab) {
            navigate(selectedTab.to);
          }
        }}
        topRightAction={<PublicPageEditButton to="/admin/public-visuals" label="상단 배너 수정" />}
      />

      <Container size="layout">
        <div className="mt-20 md:mt-24">
        <div className="mb-12 flex flex-col items-center justify-between gap-6 rounded-[8px] bg-slate-50 p-6 md:flex-row md:p-10">
          <div className="flex w-full items-center gap-5 md:w-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm md:h-16 md:w-16">
              <Phone size={24} className="md:h-8 md:w-8" />
            </div>
            <div>
              <div className="mb-1 text-2xl font-extrabold text-slate-900 md:text-3xl">1800-1985</div>
              <div className="space-y-0.5 text-xs font-medium text-slate-700 md:text-sm">
                <p>고객행복센터(전화): <br className="md:hidden" />오전 9시 ~ 오후 6시 운영</p>
                <p>채팅 상담 문의: 24시간 운영</p>
              </div>
            </div>
          </div>

          <a
            href="https://pf.kakao.com/_iRxghX/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] md:w-auto"
          >
            <MessageCircle size={20} className="text-slate-600" />
            채팅 상담
          </a>
        </div>

        <div id="as-guide" className="mb-6 scroll-mt-28">
          <div className="mb-8 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
            {AS_GUIDE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`min-h-[44px] rounded-[4px] border px-4 py-2 text-sm font-bold transition-all md:min-h-12 md:rounded-[8px] md:px-5 md:py-2.5 ${
                  activeCategory === category
                    ? 'border-[#001e45] bg-[#001e45] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-[#001e45]/20 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100">
            {filteredItems.map((item) => (
              <div key={item.id} className="border-b border-slate-100">
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="flex w-full items-center gap-3 px-2 py-5 text-left transition-colors hover:bg-slate-50/50"
                >
                  <span className="text-lg font-bold text-[#001e45]">A</span>
                  <span className="flex-1 text-[15px] font-bold leading-snug text-slate-800 md:text-base">
                    {item.question}
                  </span>
                  <span className={`text-slate-600 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </span>
                </button>

                {expandedId === item.id && (
                  <div className="animate-fadeIn px-10 pb-6 pt-1">
                    <div className="rounded-[8px] bg-slate-50 p-5 text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap md:text-[15px]">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
      </Container>
    </main>
  );
};

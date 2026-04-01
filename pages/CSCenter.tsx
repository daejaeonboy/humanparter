import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { PublicCollectionHero } from '../components/PublicCollectionHero';
import { Container } from '../components/ui/Container';
import { Phone, MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Seo } from '../components/Seo';
import { FAQ } from '../src/api/faqApi';
import { getPublicSupportData } from '../src/api/publicDataApi';
import { CS_SECTION_TABS } from '../src/config/publicMegaMenu';
import { getCollectionHeroVisual } from '../src/content/publicVisualsContent';
import { usePublicVisuals } from '../src/hooks/usePublicVisuals';
import { usePrerenderData } from '../src/prerender/context';
import { buildBreadcrumbStructuredData } from '../src/utils/seo';
const DEFAULT_FAQ_CATEGORIES = ['자주 묻는 질문', '공통', '이용문의', '견적/결제', '취소/환불', '상품문의', '기타'];

export const CSCenter: React.FC = () => {
    const navigate = useNavigate();
    const preloadedSupport = usePrerenderData()?.support;
    const publicVisuals = usePublicVisuals();
    const [faqs, setFaqs] = useState<FAQ[]>(preloadedSupport?.faqs || []);
    const [loading, setLoading] = useState(!preloadedSupport);
    const [activeCategory, setActiveCategory] = useState('자주 묻는 질문');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>(
        preloadedSupport?.categories?.map((item) => item.name) || ['자주 묻는 질문'],
    );

    useEffect(() => {
        const loadData = async () => {
            try {
                if (preloadedSupport) {
                    setFaqs(preloadedSupport.faqs);
                    const preloadedCategories = preloadedSupport.categories.map((item) => item.name);
                    if (preloadedCategories.length > 0) {
                        setCategories(preloadedCategories);
                    }
                    setLoading(false);
                }

                const { faqs: faqData, categories: categoryData } = await getPublicSupportData();
                const faqCategories = Array.from(new Set(faqData.map((item) => item.category).filter(Boolean)));
                const resolvedCategories = categoryData.length > 0
                    ? categoryData.map((c) => c.name)
                    : Array.from(new Set([...DEFAULT_FAQ_CATEGORIES, ...faqCategories]));

                setFaqs(faqData);
                setCategories(resolvedCategories);
                setActiveCategory((current) => {
                    const currentHasFaq = faqData.some((item) => item.category === current);
                    if (currentHasFaq) return current;

                    return resolvedCategories.find((category) => faqData.some((item) => item.category === category))
                        ?? resolvedCategories[0]
                        ?? '자주 묻는 질문';
                });
            } catch (error) {
                console.error('Failed to load data:', error);
                setCategories(DEFAULT_FAQ_CATEGORIES);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [preloadedSupport]);

    const toggleAccordion = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFAQ = faqs.filter(item => {
        return item.category === activeCategory;
    });
    const faqStructuredData = faqs.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs
                .filter((item) => item.question && item.answer)
                .map((item) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                    },
                })),
        }
        : null;

    const faqHeroContent = getCollectionHeroVisual(publicVisuals, 'cs', 'faq');

    return (
        <main className="min-h-screen bg-white pb-20 pt-0">
            <Seo
                title="고객센터 | 휴먼파트너"
                description="휴먼파트너 고객센터입니다. 자주 묻는 질문부터 실시간 상담까지 도와드립니다."
                canonicalPath="/cs"
                structuredData={[
                    buildBreadcrumbStructuredData([
                        { name: '홈', path: '/' },
                        { name: '고객센터', path: '/cs' },
                    ]),
                    ...(faqStructuredData ? [faqStructuredData] : []),
                ]}
            />

            <PublicCollectionHero
                title={faqHeroContent.title || 'FAQ'}
                description={faqHeroContent.description}
                imageUrl={faqHeroContent.imageUrl}
                tabs={CS_SECTION_TABS.map((tab) => ({ label: tab.label, value: tab.value }))}
                activeValue="faq"
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
                {/* CS Info Card */}
                <div className="bg-slate-50 rounded-[8px] p-6 md:p-10 mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600">
                            <Phone size={24} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">1800-1985</div>
                            <div className="text-xs md:text-sm text-slate-700 font-medium space-y-0.5">
                                <p>고객행복센터(전화): <br className="md:hidden" />오전 9시 ~ 오후 6시 운영</p>
                                <p>채팅 상담 문의: 24시간 운영</p>
                            </div>
                        </div>
                    </div>

                    <a
                        href="https://pf.kakao.com/_iRxghX/chat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-8 py-4 bg-white border border-slate-200 rounded-[8px] shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-bold text-slate-700 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <MessageCircle size={20} className="text-slate-600" />
                        채팅 상담
                    </a>
                </div>

                {/* FAQ Section */}
                <div id="faq" className="mb-6 scroll-mt-28">
                    {/* Category Tabs */}
                    <div className="mb-8 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`
                                    min-h-[44px] rounded-[4px] border px-4 py-2 text-sm font-bold transition-all md:min-h-12 md:rounded-[8px] md:px-5 md:py-2.5
                                    ${activeCategory === cat
                                        ? 'border-[#001e45] bg-[#001e45] text-white'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#001e45]/20 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* FAQ List (Accordion) */}
                    <div className="border-t border-slate-100">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="animate-spin text-[#001e45]" size={40} />
                            </div>
                        ) : filteredFAQ.length > 0 ? (
                            filteredFAQ.map(item => (
                                <div key={item.id} className="border-b border-slate-100">
                                    <button
                                        onClick={() => toggleAccordion(item.id!)}
                                        className="w-full py-5 flex items-center gap-3 text-left hover:bg-slate-50/50 transition-colors px-2"
                                    >
                                        <span className="text-[#001e45] font-bold text-lg">Q</span>
                                        <span className="flex-1 font-bold text-slate-800 text-[15px] md:text-base leading-snug">
                                            {item.question}
                                        </span>
                                        <span className={`text-slate-600 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} />
                                        </span>
                                    </button>

                                    {expandedId === item.id && (
                                        <div className="px-10 pb-6 pt-1 animate-fadeIn">
                                            <div className="bg-slate-50 p-5 rounded-[8px] text-slate-700 text-sm md:text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                                                {item.answer}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center text-slate-600 font-medium">
                                해당 카테고리에 등록된 질문이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </Container>
        </main>
    );
};


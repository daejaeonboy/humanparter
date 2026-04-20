import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Container } from './ui/Container';
import { ResponsiveImage } from './ui/ResponsiveImage';
import { Banner } from '../src/api/cmsApi';
import { getPublicHomeData } from '../src/api/publicDataApi';
import { usePrerenderData } from '../src/prerender/context';

interface VisualSlide {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    link: string;
    buttonText: string;
    brandText: string;
}

const fallbackSlides: VisualSlide[] = [
    {
        id: 'fallback-1',
        title: '휴먼파트너 렌탈',
        subtitle: '기업 사무가구와 IT 장비를 빠르게 구성하고 설치하는 종합 B2B 렌탈 솔루션입니다.',
        imageUrl:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1900&q=80',
        link: '/products',
        buttonText: '렌탈 품목 보기',
        brandText: 'HUMAN PARTNER',
    },
    {
        id: 'fallback-2',
        title: '기업 프로젝트 맞춤 렌탈',
        subtitle: '상담부터 견적, 설치, 운영 지원까지 휴먼파트너가 한 번에 진행합니다.',
        imageUrl:
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1900&q=80',
        link: '/quote-request',
        buttonText: '견적 문의하기',
        brandText: 'ENTERPRISE RENTAL',
    },
    {
        id: 'fallback-3',
        title: '사무가구·복합기·노트북 종합렌탈',
        subtitle: '프로젝트 일정과 공간 환경에 맞춰 설치와 운영 지원까지 안정적으로 제공합니다.',
        imageUrl:
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1900&q=80',
        link: '/cases',
        buttonText: '설치 사례 보기',
        brandText: 'B2B SOLUTION',
    },
];

const mapBannerToSlide = (banner: Banner, index: number): VisualSlide | null => {
    if (!banner.image_url) return null;

    const link = banner.target_product_code
        ? `/p/${banner.target_product_code}`
        : banner.link || '/';

    return {
        id: banner.id || `hero-${index}`,
        title: banner.title || 'HUMAN PARTNER',
        subtitle: banner.subtitle || '',
        imageUrl: banner.image_url,
        link,
        buttonText: banner.button_text || '자세히 보기',
        brandText: banner.brand_text || 'HUMAN PARTNER',
    };
};

const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

export const MainVisualSlider: React.FC = () => {
    const preloadedHomeData = usePrerenderData()?.home;
    const preloadedSlides = useMemo(
        () => (preloadedHomeData?.heroBanners || []).map(mapBannerToSlide).filter((item): item is VisualSlide => item !== null),
        [preloadedHomeData?.heroBanners],
    );
    const [slides, setSlides] = useState<VisualSlide[]>(preloadedSlides.length > 0 ? preloadedSlides : fallbackSlides);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    // Drag state for both touch and mouse
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragEnd, setDragEnd] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const minSwipeDistance = 50;

    const handleStart = (e: React.PointerEvent) => {
        // Only handle left click
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        
        setDragStart(e.clientX);
        setDragEnd(e.clientX);
        setIsDragging(true);
    };

    const handleMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setDragEnd(e.clientX);
    };

    const handleEnd = (e: React.PointerEvent) => {
        if (!isDragging || dragStart === null || dragEnd === null) {
            setIsDragging(false);
            return;
        }

        const distance = dragStart - dragEnd;
        const absDistance = Math.abs(distance);

        if (absDistance > minSwipeDistance) {
            if (distance > 0) {
                goNext();
            } else {
                goPrev();
            }
        }

        // Delay resetting isDragging slightly to prevent accidental clicks
        setTimeout(() => {
            setIsDragging(false);
            setDragStart(null);
            setDragEnd(null);
        }, 50);
    };

    // Helper to prevent link navigation during drag
    const handleClick = (e: React.MouseEvent) => {
        if (dragStart !== null && dragEnd !== null && Math.abs(dragStart - dragEnd) > 10) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    useEffect(() => {
        const loadSlides = async () => {
            try {
                if (preloadedSlides.length > 0) {
                    setSlides(preloadedSlides);
                    setLoading(false);
                }

                const { heroBanners } = await getPublicHomeData();
                const banners = heroBanners as Banner[];
                const mappedSlides = banners
                    .map(mapBannerToSlide)
                    .filter((item): item is VisualSlide => item !== null);
                setSlides(mappedSlides.length > 0 ? mappedSlides : fallbackSlides);
            } catch (error) {
                console.error('Failed to load main visual slides:', error);
                setSlides(fallbackSlides);
            } finally {
                setLoading(false);
            }
        };
        loadSlides();
    }, [preloadedSlides]);

    const slideCount = slides.length;

    useEffect(() => {
        if (slideCount <= 1 || paused) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % slideCount);
        }, 5000);
        return () => clearInterval(timer);
    }, [paused, slideCount]);

    const goPrev = () => {
        if (slideCount <= 1) return;
        setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
    };

    const goNext = () => {
        if (slideCount <= 1) return;
        setActiveIndex((prev) => (prev + 1) % slideCount);
    };

    const safeIndex = useMemo(() => {
        if (slideCount === 0) return 0;
        return Math.min(activeIndex, slideCount - 1);
    }, [activeIndex, slideCount]);

    if (loading && slides.length === 0) {
        return (
            <section className="relative h-[500px] bg-slate-900 md:h-[72vh] lg:h-[78vh]">
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={38} />
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white py-0">
            <Container size="wide" className="!px-0 md:!px-8">
                <div
                    className={`relative h-[280px] overflow-hidden bg-slate-900 md:h-[500px] md:rounded-2xl lg:h-[600px] select-none touch-pan-y ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => {
                        setPaused(false);
                        if (isDragging) setIsDragging(false);
                    }}
                    onPointerDown={handleStart}
                    onPointerMove={handleMove}
                    onPointerUp={handleEnd}
                    onPointerCancel={handleEnd}
                    onClickCapture={handleClick}
                >
                    {slides.map((slide, index) => {
                        const visible = safeIndex === index;
                        const overlayContent = (
                            <>
                                <div className="absolute inset-0 pointer-events-none">
                                    <ResponsiveImage
                                        src={slide.imageUrl}
                                        alt={slide.title}
                                        kind="hero"
                                        priority={index === 0}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        className="h-full w-full object-cover transition-transform duration-[7000ms] ease-out"
                                        draggable={false}
                                        sizes="100vw"
                                        style={{
                                            transform: visible ? 'scale(1.04)' : 'scale(1)',
                                        }}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.3)_42%,rgba(0,0,0,0.1)_100%)] pointer-events-none" />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.1)_34%,rgba(0,0,0,0.2)_100%)] pointer-events-none" />
                                <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
                                    <div className="max-w-4xl text-white">
                                        <h1 className="mt-3 md:mt-5 whitespace-pre-wrap break-keep text-[32px] font-medium leading-[1.2] tracking-tight md:text-[4rem] md:leading-[1.1]">
                                            {slide.title}
                                        </h1>
                                        <p className="mt-4 md:mt-6 mx-auto max-w-3xl whitespace-pre-wrap break-keep text-[16px] font-medium leading-relaxed text-white/90 md:text-[1.25rem]">
                                            {slide.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </>
                        );

                        const baseClass = `absolute inset-0 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`;

                        if (isExternalLink(slide.link)) {
                            return (
                                <a
                                    key={slide.id}
                                    href={slide.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={baseClass}
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    {overlayContent}
                                </a>
                            );
                        }

                        return (
                            <Link 
                                key={slide.id} 
                                to={slide.link} 
                                className={baseClass}
                                onDragStart={(e) => e.preventDefault()}
                            >
                                {overlayContent}
                            </Link>
                        );
                    })}

                    {slideCount > 1 && (
                        <>
                            <button
                                onClick={goPrev}
                                className="absolute left-6 top-1/2 z-20 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 md:flex"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={goNext}
                                className="absolute right-6 top-1/2 z-20 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 md:flex"
                                aria-label="Next slide"
                            >
                                <ChevronRight size={32} />
                            </button>

                            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setActiveIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-300 shadow-sm ${safeIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </Container>
        </section>
    );
};

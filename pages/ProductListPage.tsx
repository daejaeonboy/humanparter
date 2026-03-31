import React, { useState, useEffect, useCallback } from 'react';
import { Container } from '../components/ui/Container';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { getProductNavigationTarget, getProducts, Product } from '../src/api/productApi';
import { getAllNavMenuItems } from '../src/api/cmsApi';
import { usePrerenderData } from '../src/prerender/context';
import { supabase } from '../src/lib/supabase';
import { getCategoryTabDescription, getCategoryTabImage } from '../src/config/categoryTabs';
import { buildBreadcrumbStructuredData, normalizeMetaText, toAbsoluteUrl } from '../src/utils/seo';

const ALL_CATEGORY = '전체';
const PRODUCTS_PER_PAGE = 16;

export const ProductListPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const urlCategory = searchParams.get('category');
    const urlTitle = searchParams.get('title');
    const prerenderData = usePrerenderData();
    const preloadedList = prerenderData?.productList;

    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
    const [products, setProducts] = useState<Product[]>(preloadedList?.products || []);
    const [loading, setLoading] = useState(!preloadedList);
    const [displayedCategories, setDisplayedCategories] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Grouping State
    const [parentToChildMap, setParentToChildMap] = useState<Record<string, string[]>>({});
    const [childToParentMap, setChildToParentMap] = useState<Record<string, string>>({});
    const [parentCategories, setParentCategories] = useState<string[]>([]);
    const [currentGroup, setCurrentGroup] = useState<string | null>(null);

    const applyProductData = useCallback((productData: Product[], navItems: Awaited<ReturnType<typeof getAllNavMenuItems>>) => {
            // Build category maps from nav_menu_items FIRST
            const pMap: Record<string, string[]> = {};
            const cMap: Record<string, string> = {};
            const topCategories: string[] = [];
            const categoryIndexMap: Record<string, number> = {};

            const sortedNavItems = navItems
                .filter(item => item.is_active !== false)
                .sort((a, b) => {
                    const orderA = typeof a.display_order === 'number' ? a.display_order : 999;
                    const orderB = typeof b.display_order === 'number' ? b.display_order : 999;
                    return orderA - orderB;
                });

            sortedNavItems.forEach((item) => {
                const name = item.name?.trim();
                const parent = item.category?.trim();
                if (!name) return;

                if (!parent) {
                    if (!topCategories.includes(name)) {
                        topCategories.push(name);
                    }
                    return;
                }

                if (!pMap[parent]) pMap[parent] = [];
                if (!pMap[parent].includes(name)) {
                    pMap[parent].push(name);
                }
                cMap[name] = parent;
            });

            let absoluteIndex = 0;
            topCategories.forEach(parentName => {
                categoryIndexMap[parentName] = absoluteIndex++;
                if (pMap[parentName]) {
                    pMap[parentName].forEach(childName => {
                        categoryIndexMap[childName] = absoluteIndex++;
                    });
                }
            });

            const basicProducts = productData.filter((p) => {
                const category = p.category || '';
                return (
                    p.product_type === 'basic' ||
                    (!p.product_type && !category.includes('추가') && !category.includes('장소') && !category.includes('음식'))
                );
            });

            setProducts(
                [...basicProducts].sort((a, b) => {
                    const catA = a.category ? a.category.trim() : '';
                    const catB = b.category ? b.category.trim() : '';

                    let rootA = catA;
                    while (cMap[rootA]) rootA = cMap[rootA];

                    let rootB = catB;
                    while (cMap[rootB]) rootB = cMap[rootB];

                    const rootIndexA = categoryIndexMap[rootA] ?? 9999;
                    const rootIndexB = categoryIndexMap[rootB] ?? 9999;

                    if (rootIndexA !== rootIndexB) {
                        return rootIndexA - rootIndexB;
                    }

                    const exactIndexA = categoryIndexMap[catA] ?? 9999;
                    const exactIndexB = categoryIndexMap[catB] ?? 9999;
                    if (exactIndexA !== exactIndexB) {
                        return exactIndexA - exactIndexB;
                    }

                    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
                    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return bCreated - aCreated;
                })
            );

            setParentToChildMap(pMap);
            setChildToParentMap(cMap);
            setParentCategories(topCategories);
            const defaultParentCategory = topCategories[0] ?? null;
            const defaultDisplayed = defaultParentCategory ? [...(pMap[defaultParentCategory] || [])] : [];

            let targetGroup: string | null = defaultParentCategory;
            let targetActive = ALL_CATEGORY;
            let targetDisplayed = defaultDisplayed;

            if (urlCategory) {
                const normalizedCategory = urlCategory.trim();

                if (pMap[normalizedCategory] && pMap[normalizedCategory].length > 0) {
                    targetGroup = normalizedCategory;
                    targetActive = ALL_CATEGORY;
                    targetDisplayed = [...pMap[normalizedCategory]];
                } else if (cMap[normalizedCategory]) {
                    const parent = cMap[normalizedCategory];
                    targetGroup = parent;
                    targetActive = normalizedCategory;
                    targetDisplayed = [...(pMap[parent] || [])];
                } else {
                    targetActive = normalizedCategory;
                    targetDisplayed = defaultDisplayed;

                    if (normalizedCategory.includes(',')) {
                        const selected = normalizedCategory
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean);
                        targetDisplayed = [...selected];
                    }
                }
            }

            setCurrentGroup(targetGroup);
            setActiveCategory(targetActive);
            setDisplayedCategories(Array.from(new Set(targetDisplayed.filter(Boolean))));
    }, [urlCategory]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [productData, navItems] = preloadedList
                ? [preloadedList.products, preloadedList.navItems]
                : await Promise.all([
                    getProducts(),
                    getAllNavMenuItems()
                ]);

            applyProductData(productData, navItems);
        } catch (error) {
            console.error("Error getting products: ", error);
        } finally {
            setLoading(false);
        }
    }, [applyProductData, preloadedList]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const channel = supabase
            .channel('product-list-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nav_menu_items' },
                () => {
                    fetchProducts();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    fetchProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProducts]);

    // Enhanced Filter Logic
    const filteredProducts = products.filter(p => {
        const productCategory = p.category || '';

        // 1. If Active is "전체"
        if (activeCategory === ALL_CATEGORY) {
            // If we are in a group context, "전체" means "Any product belonging to this group's children"
            if (currentGroup && parentToChildMap[currentGroup]) {
                const children = parentToChildMap[currentGroup];
                if (children.length > 0) {
                    return children.includes(productCategory);
                }
                return productCategory === currentGroup;
            }
            // Otherwise, it means EVERYTHING
            return true;
        }

        // 1-2. Parent category click in default tab list
        if (parentToChildMap[activeCategory]?.length > 0) {
            return parentToChildMap[activeCategory].includes(productCategory);
        }

        // 2. Direct Match
        if (productCategory === activeCategory) return true;

        // 3. Comma-separated list Match
        if (activeCategory.includes(',')) {
            return activeCategory.split(',').includes(productCategory);
        }

        return false;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, currentGroup, urlCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const pagedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const heroCategory = currentGroup
        || childToParentMap[activeCategory]
        || (activeCategory !== ALL_CATEGORY ? activeCategory : null);
    const pageHeading = currentGroup || urlTitle || (activeCategory !== ALL_CATEGORY ? activeCategory : '렌탈 품목');
    const pageTitle = pageHeading === '모든 상품' ? '제품 안내 | 휴먼파트너' : `${pageHeading} | 휴먼파트너`;
    const pageDescription = normalizeMetaText(
        pageHeading === '모든 상품' || pageHeading === '렌탈 품목'
            ? '사무가구를 중심으로 기업 운영에 필요한 렌탈 품목을 휴먼파트너에서 확인해보세요.'
            : `${pageHeading} 카테고리의 기업용 렌탈 품목과 사무환경 구성 상품을 휴먼파트너에서 확인해보세요.`,
    );
    const normalizedCategory = urlCategory?.trim();
    const canonicalPath = normalizedCategory
        ? `/products?category=${encodeURIComponent(normalizedCategory)}`
        : '/products';
    const collectionStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageTitle,
        description: pageDescription,
        url: toAbsoluteUrl(canonicalPath),
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: pagedProducts
                .filter((product) => product.id)
                .map((product, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: toAbsoluteUrl(`/products/${product.id}`),
                    name: product.name,
                })),
        },
    };

    const handleParentCategorySelect = (category: string | null) => {
        if (!category) {
            setCurrentGroup(null);
            setActiveCategory(ALL_CATEGORY);
            setDisplayedCategories([]);
            return;
        }

        const children = parentToChildMap[category] || [];
        setCurrentGroup(category);
        setActiveCategory(ALL_CATEGORY);
        setDisplayedCategories(children);
    };

    const isSubcategoryFilterVisible = currentGroup !== null || (activeCategory !== ALL_CATEGORY && !!childToParentMap[activeCategory]);
    const visibleSubcategories = displayedCategories.filter((cat) => Boolean(cat?.trim()) && cat !== ALL_CATEGORY);
    const hasVisibleSubcategoryFilters = isSubcategoryFilterVisible && visibleSubcategories.length > 0;
    const heroImageUrl = getCategoryTabImage(heroCategory || undefined);
    const heroDescription = getCategoryTabDescription(heroCategory || undefined);
    const heroTitle = currentGroup || (activeCategory !== ALL_CATEGORY ? activeCategory : '렌탈 품목');

    return (
        <main className="bg-white min-h-screen pb-24 pt-0">
            <Seo
                title={pageTitle}
                description={pageDescription}
                canonicalPath={canonicalPath}
                structuredData={[
                    buildBreadcrumbStructuredData([
                        { name: '홈', path: '/' },
                        { name: '제품 안내', path: '/products' },
                    ]),
                    collectionStructuredData,
                ]}
            />

            <section className="relative overflow-visible bg-transparent">
                <div className="relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                        style={{ backgroundImage: `url(${heroImageUrl})` }}
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,18,46,0.95)_0%,rgba(1,12,34,0.84)_46%,rgba(0,7,22,0.96)_100%)]" />
                    <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.22)_100%)]" />

                    <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
                        <PublicPageEditButton to="/admin/products" />
                    </div>

                    <div className="relative z-20 flex h-[320px] items-center justify-center px-6 py-16 text-center md:h-[420px] md:px-10 md:py-20">
                        <div className="max-w-3xl">
                            <h1 className="text-[34px] font-extrabold tracking-tight text-white md:text-[62px] md:leading-[1.1]">
                                {heroTitle}
                            </h1>
                            <p className="mt-5 text-sm leading-7 text-white/80 md:text-lg md:leading-8">
                                {heroDescription}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-[1440px] -translate-x-1/2 translate-y-1/2 px-4 md:px-8">
                    <div className="overflow-x-auto border border-slate-200 bg-white">
                        <div className="flex min-w-max overflow-hidden md:min-w-0">
                            {parentCategories.map((cat, index) => {
                                const isActiveParent = (currentGroup || childToParentMap[activeCategory] || null) === cat;
                                const isLast = index === parentCategories.length - 1;

                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleParentCategorySelect(cat)}
                                        className={`min-w-[140px] flex-1 px-5 py-4 text-sm font-semibold transition md:text-base ${
                                            isActiveParent
                                                ? 'bg-[#eeeeee] text-slate-900'
                                                : 'bg-white text-slate-700 hover:bg-[#f5f5f5]'
                                        } ${isLast ? '' : 'border-r border-slate-200'}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <Container size="layout">

                {/* Category Filter */}
                {hasVisibleSubcategoryFilters && (
                    <div className="mb-12 mt-20 overflow-x-auto md:mt-24">
                        <div className="flex min-w-max items-center gap-2">
                            {visibleSubcategories.map((cat, idx) => {
                                const isActive = activeCategory === cat;
                                return (
                                    <button
                                        key={`${cat}-${idx}`}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`min-h-12 rounded-[8px] border px-5 py-2.5 text-sm font-bold transition-all duration-300
                                            ${isActive
                                                ? 'border-[#001e45] bg-[#001e45] text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#001e45]/20 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className={hasVisibleSubcategoryFilters ? '' : 'mt-12'}>
                    {loading ? (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <Loader2 className="animate-spin text-[#001e45]" size={40} />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
                            <p className="text-lg font-medium text-slate-500">등록된 상품이 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-y-12">
                                {pagedProducts.map((product) => {
                                    const navigation = getProductNavigationTarget(product);
                                    const cardContent = (
                                        <>
                                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 group-hover:shadow-md">
                                                <img
                                                    src={product.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                                                
                                                {product.stock === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                                                        <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-sm font-extrabold text-[#001e45] shadow-sm">품절</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-5 flex flex-col px-1">
                                                <span className="mb-2 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                                                    {product.category || '기본 상품'}
                                                </span>
                                                 
                                                <h3 className="line-clamp-2 text-[16px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#001e45]">
                                                    {product.name}
                                                </h3>
                                            </div>
                                        </>
                                    );

                                    return navigation.external ? (
                                        <a href={navigation.href} key={product.id} className="group flex flex-col">
                                            {cardContent}
                                        </a>
                                    ) : (
                                        <Link to={navigation.href} key={product.id} className="group flex flex-col">
                                            {cardContent}
                                        </Link>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={safeCurrentPage === 1}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        이전
                                    </button>

                                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-bold transition-colors ${
                                                safeCurrentPage === page
                                                    ? 'border-[#001e45] bg-[#001e45] text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={safeCurrentPage === totalPages}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        다음
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Container>
        </main>
    );
};

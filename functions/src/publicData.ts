const SUPABASE_URL =
    process.env.SUPABASE_URL?.trim() || "https://mnxsvjrqrayhbcmhwddz.supabase.co";
const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY?.trim() || "sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv";

const PUBLIC_CACHE_CONTROL = "public, max-age=60, s-maxage=600, stale-while-revalidate=86400";
const MEMORY_CACHE_TTL_MS = 60 * 1000;

const responseCache = new Map<string, { expiresAt: number; payload: unknown }>();

const NAV_ITEM_SELECT = "id,name,link,category,image_url,description,display_order,is_active,created_at";
const LEGACY_NAV_ITEM_SELECT = "id,name,link,category,display_order,is_active,created_at";
const HERO_BANNER_SELECT =
    "id,title,subtitle,image_url,link,button_text,brand_text,banner_type,tab_id,display_order,is_active,created_at,target_product_code";
const POPUP_SELECT =
    "id,title,image_url,link,start_date,end_date,display_order,is_active,created_at,target_product_code";
const PRODUCT_SUMMARY_SELECT =
    "id,product_code,name,category,display_order,external_link_url,price,description,short_description,image_url,stock,created_at,product_type";
const PRODUCT_DETAIL_SELECT =
    "id,name,category,_parent_category,display_order,external_link_url,price,description,short_description,image_url,stock,discount_rate,rating,review_count,created_at,product_type,basic_components,additional_components,cooperative_components,place_components,food_components";
const CASE_SUMMARY_SELECT = "id,title,subtitle,image_url,link,display_order,is_active,created_at";
const CASE_DETAIL_SELECT = `${CASE_SUMMARY_SELECT},content`;
const NOTICE_SUMMARY_SELECT =
    "id,title,excerpt,image_url,published_at,category,display_order,is_active,created_at,updated_at";
const NOTICE_DETAIL_SELECT = `${NOTICE_SUMMARY_SELECT},content_html`;
const FAQ_SELECT = "id,category,question,answer,display_order,created_at,updated_at";
const FAQ_CATEGORY_SELECT = "id,name,display_order,created_at";

const DEFAULT_COMPANY_INTRO_IMAGE_URL = "/company/abouthuman.png";
const DEFAULT_PUBLIC_VISUALS_CONTENT = {
    productDefaults: {
        all: {
            imageUrl:
                "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
            description: "휴먼파트너의 전체 렌탈 품목을 한눈에 확인해보세요.",
        },
    },
    collectionHeroes: {
        cs: {
            faq: {
                title: "FAQ",
                description: "자주 묻는 질문과 상담 채널을 한 번에 확인하고 필요한 안내를 빠르게 찾아보세요.",
                imageUrl:
                    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
            },
            asGuide: {
                title: "A/S 안내",
                description: "접수 방법부터 처리 절차, 방문 지원 범위까지 운영 중 필요한 유지관리 안내를 확인해보세요.",
                imageUrl:
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
            },
        },
        notice: {
            all: {
                title: "정보센터",
                description: "휴먼파트너의 운영 소식, 상담 안내, 설치 및 렌탈 관련 주요 업데이트를 확인해보세요.",
                imageUrl:
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
            },
            news: {
                title: "공지사항",
                description: "운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 한 번에 확인할 수 있습니다.",
                imageUrl:
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
            },
            resources: {
                title: "자료실",
                description: "설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 빠르게 찾아볼 수 있습니다.",
                imageUrl:
                    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
            },
        },
        cases: {
            all: {
                title: "설치 사례",
                description: "기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요.",
                imageUrl:
                    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
            },
            temporaryOffice: {
                title: "임시사무실",
                description: "단기 프로젝트와 임시 업무공간에 맞춘 렌탈 구성 사례를 빠르게 비교해보세요.",
                imageUrl:
                    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
            },
            publicInstitution: {
                title: "공공기관",
                description: "공공기관과 교육 현장 중심의 설치 사례를 통해 실제 운영 구성을 확인할 수 있습니다.",
                imageUrl:
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
            },
        },
    },
    megaMenu: {
        company: {
            "/company": {
                imageUrl: "/company/abouthuman.png",
                description: "휴먼파트너의 운영 경험과 B2B 렌탈 파트너로서의 강점을 확인해보세요.",
            },
            "/company/business": {
                imageUrl: "/company/service-01.jpg",
                description: "사무가구, IT 장비, 현장 운영까지 휴먼파트너의 핵심 사업영역을 살펴볼 수 있습니다.",
            },
            "/company/vision": {
                imageUrl: "/company/service-02.png",
                description: "공간과 운영을 함께 설계하는 휴먼파트너의 서비스 방향성을 살펴볼 수 있습니다.",
            },
            "/company/location": {
                imageUrl:
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                description: "휴먼파트너 위치와 연락처, 상담 채널 정보를 바로 확인할 수 있습니다.",
            },
        },
        cases: {
            "/cases?tab=temporary-office": {
                imageUrl:
                    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
                description: "단기 프로젝트와 임시 업무공간을 위한 설치 사례를 빠르게 모아볼 수 있습니다.",
            },
            "/cases?tab=public-institution": {
                imageUrl:
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                description: "공공기관과 교육 현장 중심의 구축 사례를 확인할 수 있습니다.",
            },
        },
        notice: {
            "/notice?tab=news": {
                imageUrl:
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
                description: "운영 변경, 서비스 업데이트, 상담 안내 등 최신 공지를 모아볼 수 있습니다.",
            },
            "/notice?tab=resources": {
                imageUrl:
                    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
                description: "설치 안내와 현장 체크리스트 같은 참고 자료형 공지를 확인할 수 있습니다.",
            },
        },
        cs: {
            "/cs": {
                imageUrl:
                    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
                description: "자주 묻는 질문과 답변을 바로 확인하고 필요한 상담 채널로 이동할 수 있습니다.",
            },
            "/cs/as-guide": {
                imageUrl:
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
                description: "장애 접수 방법과 처리 절차, 방문 지원 범위 등 A/S 운영 기준을 확인할 수 있습니다.",
            },
        },
    },
};

type SupabaseRow = Record<string, unknown>;

type FetchRowsOptions = {
    select?: string;
    filters?: Record<string, string>;
    order?: string;
    limit?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toNumber = (value: unknown, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

const toStringValue = (value: unknown, fallback = "") =>
    typeof value === "string" ? value : fallback;

const toOptionalString = (value: unknown) => (typeof value === "string" ? value : undefined);

const toIsoDate = (value: unknown) => {
    if (typeof value !== "string" || !value.trim()) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
};

const createdAtTime = (value: unknown) => {
    if (typeof value !== "string" || !value.trim()) return 0;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const sortByDisplayOrder = (items: SupabaseRow[]) =>
    [...items].sort((a, b) => {
        const aOrder = toNumber(a.display_order, Number.MAX_SAFE_INTEGER);
        const bOrder = toNumber(b.display_order, Number.MAX_SAFE_INTEGER);
        if (aOrder !== bOrder) return aOrder - bOrder;
        return createdAtTime(b.created_at) - createdAtTime(a.created_at);
    });

const sortNoticeSummaries = (items: SupabaseRow[]) =>
    [...items].sort((a, b) => {
        const aOrder = toNumber(a.display_order, Number.MAX_SAFE_INTEGER);
        const bOrder = toNumber(b.display_order, Number.MAX_SAFE_INTEGER);
        if (aOrder !== bOrder) return aOrder - bOrder;

        const publishedDelta = createdAtTime(b.published_at) - createdAtTime(a.published_at);
        if (publishedDelta !== 0) return publishedDelta;

        return createdAtTime(b.created_at) - createdAtTime(a.created_at);
    });

const sortFaqRows = (items: SupabaseRow[]) =>
    [...items].sort((a, b) => {
        const aOrder = toNumber(a.display_order, Number.MAX_SAFE_INTEGER);
        const bOrder = toNumber(b.display_order, Number.MAX_SAFE_INTEGER);
        if (aOrder !== bOrder) return aOrder - bOrder;
        return createdAtTime(a.created_at) - createdAtTime(b.created_at);
    });

const buildSupabaseUrl = (table: string, options: FetchRowsOptions) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    url.searchParams.set("select", options.select || "*");

    if (options.order) {
        url.searchParams.set("order", options.order);
    }

    if (typeof options.limit === "number") {
        url.searchParams.set("limit", String(options.limit));
    }

    Object.entries(options.filters || {}).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    return url;
};

const fetchSupabaseRows = async (table: string, options: FetchRowsOptions = {}): Promise<SupabaseRow[]> => {
    const response = await fetch(buildSupabaseUrl(table, options), {
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${table} fetch failed (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as unknown;
    return Array.isArray(payload) ? (payload as SupabaseRow[]) : [];
};

const isIgnorableSchemaError = (error: unknown) => {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return (
        message.includes("schema cache") ||
        message.includes("could not find the table") ||
        message.includes("does not exist")
    );
};

const safeFetchSupabaseRows = async (
    table: string,
    options: FetchRowsOptions = {},
    fallback: SupabaseRow[] = [],
    { quietOnSchemaError = false }: { quietOnSchemaError?: boolean } = {},
): Promise<SupabaseRow[]> => {
    try {
        return await fetchSupabaseRows(table, options);
    } catch (error) {
        if (quietOnSchemaError && isIgnorableSchemaError(error)) {
            return fallback;
        }
        throw error;
    }
};

const fetchNavMenuRows = async (options: Omit<FetchRowsOptions, "select"> = {}) => {
    try {
        return await fetchSupabaseRows("nav_menu_items", {
            ...options,
            select: NAV_ITEM_SELECT,
        });
    } catch (error) {
        if (isIgnorableSchemaError(error)) {
            return fetchSupabaseRows("nav_menu_items", {
                ...options,
                select: LEGACY_NAV_ITEM_SELECT,
            });
        }
        throw error;
    }
};

const getCachedPayload = async (key: string, loader: () => Promise<unknown>) => {
    const cached = responseCache.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
        return cached.payload;
    }

    const payload = await loader();
    responseCache.set(key, {
        payload,
        expiresAt: now + MEMORY_CACHE_TTL_MS,
    });
    return payload;
};

const setPublicResponseHeaders = (res: {
    setHeader: (name: string, value: string) => void;
}) => {
    res.setHeader("Cache-Control", PUBLIC_CACHE_CONTROL);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
};

const getNormalizedRoutePath = (rawPath: string) => {
    const stripped = rawPath.replace(/^\/api\/public/, "") || "/";
    return stripped.startsWith("/") ? stripped : `/${stripped}`;
};

const getRouteSegments = (rawPath: string) =>
    getNormalizedRoutePath(rawPath)
        .replace(/^\/+|\/+$/g, "")
        .split("/")
        .filter(Boolean);

const createNoticeSummary = (item: SupabaseRow) => ({
    id: toStringValue(item.id),
    title: toStringValue(item.title),
    excerpt: toStringValue(item.excerpt),
    imageUrl: toStringValue(item.image_url),
    publishedAt: toIsoDate(item.published_at),
    category: toStringValue(item.category),
    displayOrder: toNumber(item.display_order),
    isActive: item.is_active !== false,
    created_at: toOptionalString(item.created_at),
    updated_at: toOptionalString(item.updated_at),
});

const createCaseSummary = (item: SupabaseRow) => ({
    id: toStringValue(item.id),
    title: toStringValue(item.title),
    subtitle: toOptionalString(item.subtitle),
    image_url: toStringValue(item.image_url),
    link: toStringValue(item.link),
    display_order: toNumber(item.display_order),
    is_active: item.is_active !== false,
    created_at: toOptionalString(item.created_at),
});

const loadBootstrapPayload = async () => {
    const [navItems, publicVisualEntries] = await Promise.all([
        fetchNavMenuRows(),
        safeFetchSupabaseRows("page_contents", {
            select: "content",
            filters: {
                page_key: "eq.public-visuals",
            },
            limit: 1,
        }, [], { quietOnSchemaError: true }),
    ]);

    return {
        generatedAt: new Date().toISOString(),
        navItems: sortByDisplayOrder(navItems),
        publicVisuals: isRecord(publicVisualEntries[0]) && isRecord(publicVisualEntries[0].content)
            ? publicVisualEntries[0].content
            : DEFAULT_PUBLIC_VISUALS_CONTENT,
    };
};

const loadHomePayload = async () => {
    const [heroBanners, installationCases, noticeRows, popups, companyEntries] = await Promise.all([
        fetchSupabaseRows("banners", {
            select: HERO_BANNER_SELECT,
            filters: {
                is_active: "eq.true",
                banner_type: "eq.hero",
            },
            order: "display_order.asc",
        }),
        fetchSupabaseRows("installation_cases", {
            select: CASE_SUMMARY_SELECT,
            filters: {
                is_active: "eq.true",
            },
            order: "display_order.asc,created_at.desc",
            limit: 3,
        }),
        safeFetchSupabaseRows("notice_posts", {
            select: NOTICE_SUMMARY_SELECT,
            filters: {
                is_active: "eq.true",
            },
            order: "display_order.asc,published_at.desc,created_at.desc",
            limit: 3,
        }, [], { quietOnSchemaError: true }),
        fetchSupabaseRows("popups", {
            select: POPUP_SELECT,
            filters: {
                is_active: "eq.true",
            },
            order: "display_order.asc",
        }),
        safeFetchSupabaseRows("page_contents", {
            select: "content",
            filters: {
                page_key: "eq.company",
            },
            limit: 1,
        }, [], { quietOnSchemaError: true }),
    ]);

    const companyContent = isRecord(companyEntries[0]) && isRecord(companyEntries[0].content)
        ? companyEntries[0].content
        : null;
    const companyOverview = companyContent && isRecord(companyContent.overview) ? companyContent.overview : null;
    const companyIntroImageUrl =
        typeof companyOverview?.imageUrl === "string" && companyOverview.imageUrl.trim()
            ? companyOverview.imageUrl
            : DEFAULT_COMPANY_INTRO_IMAGE_URL;

    return {
        generatedAt: new Date().toISOString(),
        heroBanners: sortByDisplayOrder(heroBanners),
        installationCases: sortByDisplayOrder(installationCases).map(createCaseSummary),
        noticeSummaries: sortNoticeSummaries(noticeRows).map(createNoticeSummary),
        popups: sortByDisplayOrder(popups),
        companyIntroImageUrl,
    };
};

const loadProductsPayload = async () => {
    const [products, navItems] = await Promise.all([
        fetchSupabaseRows("products", {
            select: PRODUCT_SUMMARY_SELECT,
            order: "display_order.asc,created_at.desc",
        }),
        fetchNavMenuRows({
            order: "display_order.asc",
        }),
    ]);

    return {
        generatedAt: new Date().toISOString(),
        products: sortByDisplayOrder(products),
        navItems: sortByDisplayOrder(navItems),
    };
};

const loadProductDetailPayload = async (id: string) => {
    const productRows = await fetchSupabaseRows("products", {
        select: PRODUCT_DETAIL_SELECT,
        filters: {
            id: `eq.${id}`,
        },
        limit: 1,
    });

    const product = productRows[0] || null;

    let relatedProducts: SupabaseRow[] = [];
    if (product && typeof product.category === "string" && product.category.trim()) {
        relatedProducts = await fetchSupabaseRows("products", {
            select: PRODUCT_SUMMARY_SELECT,
            filters: {
                category: `eq.${product.category}`,
                id: `neq.${id}`,
            },
            order: "display_order.asc,created_at.desc",
            limit: 4,
        });
    }

    return {
        generatedAt: new Date().toISOString(),
        product,
        relatedProducts: sortByDisplayOrder(relatedProducts),
    };
};

const loadCasesPayload = async () => {
    const rows = await fetchSupabaseRows("installation_cases", {
        select: CASE_SUMMARY_SELECT,
        filters: {
            is_active: "eq.true",
        },
        order: "display_order.asc,created_at.desc",
    });

    return {
        generatedAt: new Date().toISOString(),
        cases: sortByDisplayOrder(rows).map(createCaseSummary),
    };
};

const loadCaseDetailPayload = async (id: string) => {
    const [detailRows, summaryRows] = await Promise.all([
        fetchSupabaseRows("installation_cases", {
            select: CASE_DETAIL_SELECT,
            filters: {
                id: `eq.${id}`,
                is_active: "eq.true",
            },
            limit: 1,
        }),
        fetchSupabaseRows("installation_cases", {
            select: CASE_SUMMARY_SELECT,
            filters: {
                is_active: "eq.true",
            },
            order: "display_order.asc,created_at.desc",
        }),
    ]);

    const orderedCases = sortByDisplayOrder(summaryRows).map(createCaseSummary);
    const currentIndex = orderedCases.findIndex((item) => item.id === id);

    return {
        generatedAt: new Date().toISOString(),
        post: detailRows[0] || null,
        previousCase: currentIndex > 0 ? orderedCases[currentIndex - 1] : null,
        nextCase: currentIndex >= 0 && currentIndex < orderedCases.length - 1 ? orderedCases[currentIndex + 1] : null,
    };
};

const loadNoticesPayload = async () => {
    const rows = await safeFetchSupabaseRows("notice_posts", {
        select: NOTICE_SUMMARY_SELECT,
        filters: {
            is_active: "eq.true",
        },
        order: "display_order.asc,published_at.desc,created_at.desc",
    }, [], { quietOnSchemaError: true });

    return {
        generatedAt: new Date().toISOString(),
        posts: sortNoticeSummaries(rows).map(createNoticeSummary),
    };
};

const loadNoticeDetailPayload = async (id: string) => {
    const [detailRows, summaryRows] = await Promise.all([
        safeFetchSupabaseRows("notice_posts", {
            select: NOTICE_DETAIL_SELECT,
            filters: {
                id: `eq.${id}`,
                is_active: "eq.true",
            },
            limit: 1,
        }, [], { quietOnSchemaError: true }),
        safeFetchSupabaseRows("notice_posts", {
            select: NOTICE_SUMMARY_SELECT,
            filters: {
                is_active: "eq.true",
            },
            order: "display_order.asc,published_at.desc,created_at.desc",
        }, [], { quietOnSchemaError: true }),
    ]);

    const orderedNotices = sortNoticeSummaries(summaryRows).map(createNoticeSummary);
    const currentIndex = orderedNotices.findIndex((item) => item.id === id);

    return {
        generatedAt: new Date().toISOString(),
        post: detailRows[0]
            ? {
                  ...detailRows[0],
                  imageUrl: toStringValue(detailRows[0].image_url),
                  publishedAt: toIsoDate(detailRows[0].published_at),
                  contentHtml: toStringValue(detailRows[0].content_html),
                  displayOrder: toNumber(detailRows[0].display_order),
                  isActive: detailRows[0].is_active !== false,
                  created_at: toOptionalString(detailRows[0].created_at),
                  updated_at: toOptionalString(detailRows[0].updated_at),
              }
            : null,
        previousNotice: currentIndex > 0 ? orderedNotices[currentIndex - 1] : null,
        nextNotice:
            currentIndex >= 0 && currentIndex < orderedNotices.length - 1
                ? orderedNotices[currentIndex + 1]
                : null,
    };
};

const loadSupportPayload = async () => {
    const [faqs, categories] = await Promise.all([
        fetchSupabaseRows("faqs", {
            select: FAQ_SELECT,
        }),
        safeFetchSupabaseRows("faq_categories", {
            select: FAQ_CATEGORY_SELECT,
        }, [], { quietOnSchemaError: true }),
    ]);

    return {
        generatedAt: new Date().toISOString(),
        faqs: sortFaqRows(faqs),
        categories: sortFaqRows(categories),
    };
};

const loadCompanyPayload = async () => {
    const rows = await safeFetchSupabaseRows("page_contents", {
        select: "content",
        filters: {
            page_key: "eq.company",
        },
        limit: 1,
    }, [], { quietOnSchemaError: true });

    return {
        generatedAt: new Date().toISOString(),
        content: isRecord(rows[0]) ? rows[0].content ?? {} : {},
    };
};

const loadPayloadForPath = async (path: string) => {
    const segments = getRouteSegments(path);

    if (segments.length === 0) {
        return loadBootstrapPayload();
    }

    if (segments[0] === "bootstrap" && segments.length === 1) {
        return loadBootstrapPayload();
    }

    if (segments[0] === "home" && segments.length === 1) {
        return loadHomePayload();
    }

    if (segments[0] === "products" && segments.length === 1) {
        return loadProductsPayload();
    }

    if (segments[0] === "products" && segments.length === 2) {
        return loadProductDetailPayload(segments[1]);
    }

    if (segments[0] === "cases" && segments.length === 1) {
        return loadCasesPayload();
    }

    if (segments[0] === "cases" && segments.length === 2) {
        return loadCaseDetailPayload(segments[1]);
    }

    if (segments[0] === "notices" && segments.length === 1) {
        return loadNoticesPayload();
    }

    if (segments[0] === "notices" && segments.length === 2) {
        return loadNoticeDetailPayload(segments[1]);
    }

    if (segments[0] === "support" && segments.length === 1) {
        return loadSupportPayload();
    }

    if (segments[0] === "company" && segments.length === 1) {
        return loadCompanyPayload();
    }

    return null;
};

export const handlePublicDataRequest = async (
    req: { method: string; path: string; originalUrl?: string },
    res: {
        status: (code: number) => { json: (value: unknown) => void; send: (value: string) => void };
        json: (value: unknown) => void;
        setHeader: (name: string, value: string) => void;
    },
) => {
    if (req.method !== "GET") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const routePath = getNormalizedRoutePath(req.path || req.originalUrl || "/");

    try {
        const payload = await getCachedPayload(routePath, async () => {
            const nextPayload = await loadPayloadForPath(routePath);
            if (nextPayload === null) {
                throw new Error("NOT_FOUND");
            }
            return nextPayload;
        });

        setPublicResponseHeaders(res);
        res.json(payload);
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            res.status(404).json({ error: "Not Found" });
            return;
        }

        console.error("Public data request failed:", routePath, error);
        res.status(500).json({ error: "Failed to load public data" });
    }
};

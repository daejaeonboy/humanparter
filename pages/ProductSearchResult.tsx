import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Product, getProductNavigationTarget, searchProducts } from '../src/api/productApi';
import { Seo } from '../components/Seo';
import { Container } from '../components/ui/Container';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { Loader2, Search } from 'lucide-react';
import { getPublicProductsData } from '../src/api/publicDataApi';
import { buildSeoTitle } from '../src/utils/seo';

export const ProductSearchResult: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                if (query) {
                    try {
                        const { products: allProducts } = await getPublicProductsData();
                        const normalizedQuery = query.trim().toLowerCase();
                        const results = allProducts.filter((product) => {
                            const name = product.name?.toLowerCase() || '';
                            const shortDescription = product.short_description?.toLowerCase() || '';
                            const description = product.description?.toLowerCase() || '';
                            const isBasicProduct =
                                product.product_type === 'basic' ||
                                (!product.product_type &&
                                    !String(product.category || '').includes('추가') &&
                                    !String(product.category || '').includes('장소') &&
                                    !String(product.category || '').includes('음식'));

                            if (!isBasicProduct) return false;

                            return (
                                name.includes(normalizedQuery) ||
                                shortDescription.includes(normalizedQuery) ||
                                description.includes(normalizedQuery)
                            );
                        });
                        setProducts(results);
                    } catch (cacheError) {
                        console.warn('Falling back to direct Supabase product search:', cacheError);
                        const results = await searchProducts(query);
                        setProducts(results);
                    }
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const resultCount = useMemo(() => products.length, [products.length]);

    return (
        <div className="min-h-screen bg-slate-50 py-8 md:py-12">
            <Seo
                title={query ? buildSeoTitle(`"${query}" 검색 결과`) : buildSeoTitle('검색')}
                description={query ? `휴먼파트너 사이트 내 ${query} 검색 결과 페이지입니다.` : '휴먼파트너 사이트 내 검색 페이지입니다.'}
                canonicalPath={false}
                urlPath={false}
                noindex
            />

            <Container>
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Search className="text-[#001e45]" />
                        <span>{query ? `'${query}' 검색 결과` : '검색 결과'}</span>
                        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border ml-2">
                            총 {resultCount}개
                        </span>
                    </h1>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#001e45]" size={40} />
                    </div>
                )}

                {/* Empty State */}
                {!loading && products.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-slate-500 mb-6">다른 검색어로 다시 시도해보세요.</p>
                        <div className="flex gap-2 justify-center">
                            <span className="px-3 py-1 bg-slate-100 text-sm text-slate-600 rounded-lg">#의자</span>
                            <span className="px-3 py-1 bg-slate-100 text-sm text-slate-600 rounded-lg">#테이블</span>
                            <span className="px-3 py-1 bg-slate-100 text-sm text-slate-600 rounded-lg">#천막</span>
                        </div>
                    </div>
                )}

                {/* Results Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((product) => {
                            const navigation = getProductNavigationTarget(product);
                            const cardContent = (
                                <>
                                    <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                                        {product.image_url ? (
                                            <ResponsiveImage
                                                src={product.image_url}
                                                alt={product.name}
                                                kind="card"
                                                sizes="(min-width: 1024px) 25vw, 50vw"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-800 mb-1 truncate group-hover:text-[#001e45] transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-2 line-clamp-1 h-4">
                                            {product.short_description || ''}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-extrabold text-[#001e45]">
                                                {product.price?.toLocaleString()}<span className="text-xs font-medium ml-0.5">원</span>
                                            </span>
                                        </div>
                                    </div>
                                </>
                            );

                            return navigation.external ? (
                                <a
                                    key={product.id}
                                    href={navigation.href}
                                    className="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {cardContent}
                                </a>
                            ) : (
                                <Link
                                    key={product.id}
                                    to={navigation.href}
                                    className="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {cardContent}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </Container>
        </div>
    );
};

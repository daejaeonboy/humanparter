import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Boxes, CheckCircle2, Loader2, Package, Phone } from 'lucide-react';
import { PublicPageEditButton } from '../components/admin/PublicPageEditButton';
import { Seo } from '../components/Seo';
import { Container } from '../components/ui/Container';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { getProductNavigationTarget, normalizeExternalLinkUrl, Product } from '../src/api/productApi';
import { getPublicProductDetailData } from '../src/api/publicDataApi';
import { usePrerenderData } from '../src/prerender/context';
import { buildBreadcrumbStructuredData, normalizeMetaText, toAbsoluteUrl } from '../src/utils/seo';

const fallbackImage =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';

const formatPrice = (price?: number) => {
  if (!price) return '견적 문의';
  return `${price.toLocaleString()}원`;
};

const renderComponentList = (
  title: string,
  items:
    | Product['basic_components']
    | Product['additional_components']
    | Product['cooperative_components']
    | Product['place_components']
    | Product['food_components'],
) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${item.name}-${index}`}
            className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
          >
            <div>
              <p className="font-semibold text-slate-900">{item.name}</p>
              {'model_name' in item && item.model_name && (
                <p className="mt-1 text-sm text-slate-500">{item.model_name}</p>
              )}
            </div>
            <div className="text-right text-sm font-semibold text-[#001e45]">
              {'quantity' in item && typeof item.quantity === 'number' && <p>{item.quantity}개</p>}
              {'price' in item && typeof item.price === 'number' && <p>{formatPrice(item.price)}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const prerenderData = usePrerenderData();
  const preloadedDetail = prerenderData?.productDetail;
  const hasPreloadedDetail = !!(id && preloadedDetail?.product?.id === id);
  const [product, setProduct] = useState<Product | null>(hasPreloadedDetail ? preloadedDetail?.product || null : null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(hasPreloadedDetail ? preloadedDetail?.relatedProducts || [] : []);
  const [loading, setLoading] = useState(!hasPreloadedDetail);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasPreloadedDetail && preloadedDetail) {
      setProduct(preloadedDetail.product);
      setRelatedProducts(preloadedDetail.relatedProducts);
      setError(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      if (!id) {
        setError('상품 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const detail = await getPublicProductDetailData(id);
        const productData = detail.product;

        if (!productData) {
          setError('상품 정보를 찾을 수 없습니다.');
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        setProduct(productData);
        setRelatedProducts(detail.relatedProducts);
      } catch (loadError) {
        console.error('Failed to load product detail:', loadError);
        setError('상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [hasPreloadedDetail, id, preloadedDetail]);

  const description = useMemo(() => {
    if (!product) return '';
    return product.description || product.short_description || '제품 상세 정보는 견적 문의를 통해 안내해드립니다.';
  }, [product]);
  const externalProductUrl = normalizeExternalLinkUrl(product?.external_link_url);
  const metaDescription =
    normalizeMetaText(product?.short_description || description) ||
    '기업 환경에 필요한 렌탈 품목입니다. 제품 사양과 구성은 견적 문의를 통해 안내해드립니다.';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#001e45]" size={40} />
      </div>
    );
  }

  if (!product || error) {
    return (
      <main className="bg-white py-20">
        <Seo
          title="상품을 찾을 수 없습니다 | 휴먼파트너"
          description="요청하신 상품 정보를 찾을 수 없습니다."
          canonicalPath={false}
          urlPath={false}
          noindex
          nofollow
        />
        <Container className="max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-slate-900">{error || '상품 정보를 찾을 수 없습니다.'}</h1>
          <p className="mt-4 text-slate-500">상품 목록으로 돌아가 다른 제품을 확인해보세요.</p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#001e45] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#132f66]"
          >
            상품 목록으로 이동
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 pb-24 pt-8 md:pt-12">
      <Seo
        title={`${product.name} | 휴먼파트너`}
        description={metaDescription}
        image={product.image_url || fallbackImage}
        imageAlt={product.name}
        type="product"
        canonicalPath={product.id ? `/products/${product.id}` : '/products'}
        structuredData={[
          buildBreadcrumbStructuredData([
            { name: '홈', path: '/' },
            { name: '제품 안내', path: '/products' },
            { name: product.name, path: product.id ? `/products/${product.id}` : '/products' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: metaDescription,
            image: [toAbsoluteUrl(product.image_url || fallbackImage)],
            category: product.category || '사무 환경 구성',
            sku: product.id,
            brand: {
              '@type': 'Brand',
              name: '휴먼파트너',
            },
            ...(product.price > 0
              ? {
                  offers: {
                    '@type': 'Offer',
                    priceCurrency: 'KRW',
                    price: product.price,
                    availability:
                      product.stock > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                    url: toAbsoluteUrl(product.id ? `/products/${product.id}` : '/products'),
                  },
                }
              : {}),
          },
        ]}
      />

      <Container className="space-y-8">
        <PublicPageEditButton to="/admin/products" />
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#001e45]">
          <ArrowLeft size={16} />
          상품 목록으로 돌아가기
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <ResponsiveImage
              src={product.image_url || fallbackImage}
              alt={product.name}
              kind="detail"
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#001e45]/70">
              {product.category || 'PRODUCT'}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">{description}</p>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <span className="text-sm font-semibold text-slate-500">기준 안내</span>
                <span className="text-2xl font-extrabold text-[#001e45]">{formatPrice(product.price)}</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span>재고</span>
                  <span className="font-semibold text-slate-900">{product.stock > 0 ? `${product.stock}개` : '문의 필요'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>추천 용도</span>
                  <span className="font-semibold text-slate-900">{product.category || '사무 환경 구성'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {externalProductUrl && (
                <a
                  href={externalProductUrl}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#001e45] bg-white px-6 py-4 text-sm font-bold text-[#001e45] transition hover:bg-[#001e45]/5"
                >
                  외부 사이트로 이동
                </a>
              )}
              <Link
                to="/quote-request"
                className="inline-flex items-center justify-center rounded-2xl bg-[#001e45] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#132f66]"
              >
                견적 문의하기
              </Link>
              <a
                href="tel:1800-1985"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Phone size={16} />
                전화 상담 1800-1985
              </a>
            </div>

            <div className="mt-8 rounded-2xl border border-[#001e45]/10 bg-[#001e45]/5 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-[#001e45]" size={18} />
                <div className="text-sm leading-6 text-slate-600">
                  설치 일정, 수량, 현장 조건에 따라 최종 견적은 달라질 수 있습니다.
                  문의를 남겨주시면 담당자가 확인 후 맞춤 제안을 드립니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <Package className="text-[#001e45]" size={20} />
                <h2 className="text-xl font-bold text-slate-900">제품 소개</h2>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600 md:text-base">{description}</p>
            </section>

            {renderComponentList('기본 구성', product.basic_components)}
            {renderComponentList('협력 품목', product.cooperative_components)}
            {renderComponentList('추가 구성', product.additional_components)}
            {renderComponentList('장소 관련 품목', product.place_components)}
            {renderComponentList('식음 관련 품목', product.food_components)}
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Boxes className="text-[#001e45]" size={20} />
                <h2 className="text-lg font-bold text-slate-900">도입 안내</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <li>필요 수량과 기간을 남겨주시면 맞춤 견적을 안내합니다.</li>
                <li>현장 여건에 따라 배송, 설치, 회수 조건이 달라질 수 있습니다.</li>
                <li>기업/기관 환경에 맞는 구성 제안이 가능합니다.</li>
              </ul>
            </section>

            {relatedProducts.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">같은 카테고리 상품</h2>
                <div className="mt-5 space-y-4">
                  {relatedProducts.map((related) => {
                    const navigation = getProductNavigationTarget(related);
                    const itemContent = (
                      <>
                        <ResponsiveImage
                          src={related.image_url || fallbackImage}
                          alt={related.name}
                          kind="thumbnail"
                          sizes="64px"
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">{related.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{related.category || '기본 상품'}</p>
                        </div>
                      </>
                    );

                    return navigation.external ? (
                      <a
                        key={related.id}
                        href={navigation.href}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                      >
                        {itemContent}
                      </a>
                    ) : (
                      <Link
                        key={related.id}
                        to={navigation.href}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                      >
                        {itemContent}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </aside>
        </section>
      </Container>
    </main>
  );
};

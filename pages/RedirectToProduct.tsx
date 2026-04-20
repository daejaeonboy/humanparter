import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { getProductByCode, getProductById, getProductNavigationTarget } from '../src/api/productApi';
import { getPublicProductsData } from '../src/api/publicDataApi';
import { buildSeoTitle } from '../src/utils/seo';

export const RedirectToProduct = () => {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const resolveProduct = async () => {
            if (!code) {
                navigate('/');
                return;
            }

            try {
                let product = null;

                // Check if code is a UUID (UUID v4 format check)
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code);

                try {
                    const { products } = await getPublicProductsData();
                    product = products.find((item) => item.id === code || item.product_code === code) || null;
                } catch (cacheError) {
                    console.warn('Failed to load cached public products for redirect lookup:', cacheError);
                }

                if (isUuid) {
                    product = product || await getProductById(code);
                }

                // If not UUID or not found by ID, try looking up by product_code
                if (!product) {
                    product = await getProductByCode(code);
                }

                if (product) {
                    const navigationTarget = getProductNavigationTarget(product);
                    if (navigationTarget.external) {
                        window.location.replace(navigationTarget.href);
                        return;
                    }
                    navigate(navigationTarget.href, { replace: true });
                } else {
                    // Product not found
                    console.warn(`Product not found for code/id: ${code}`);
                    alert('상품을 찾을 수 없습니다.');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error resolving product code:', error);
                navigate('/');
            }
        };

        resolveProduct();
    }, [code, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <Seo
                title={buildSeoTitle('상품 페이지 이동')}
                description="요청하신 상품 페이지로 이동하고 있습니다."
                canonicalPath={false}
                urlPath={false}
                noindex
                nofollow
            />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001e45]"></div>
        </div>
    );
};

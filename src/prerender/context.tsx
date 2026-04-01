import React, { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import {
  primePublicBootstrapData,
  primePublicCaseDetailData,
  primePublicCasesData,
  primePublicCompanyData,
  primePublicHomeData,
  primePublicNoticeDetailData,
  primePublicNoticesData,
  primePublicProductDetailData,
  primePublicProductsData,
  primePublicSupportData,
  type PublicBootstrapData,
  type PublicCaseDetailPayload,
  type PublicCasesData,
  type PublicCompanyData,
  type PublicHomeData,
  type PublicNoticeDetailPayload,
  type PublicNoticesData,
  type PublicProductDetailPayload,
  type PublicProductsData,
  type PublicSupportData,
} from '../api/publicDataApi';

export type PrerenderData = {
  generatedAt?: string;
  bootstrap?: PublicBootstrapData;
  home?: PublicHomeData;
  productList?: PublicProductsData;
  productDetail?: PublicProductDetailPayload;
  installationCases?: PublicCasesData;
  installationCaseDetail?: PublicCaseDetailPayload;
  notices?: PublicNoticesData;
  noticeDetail?: PublicNoticeDetailPayload;
  support?: PublicSupportData;
  company?: PublicCompanyData;
};

declare global {
  interface Window {
    __HP_PRERENDER_DATA__?: PrerenderData;
  }
}

const PrerenderDataContext = createContext<PrerenderData | null>(null);

const getClientPrerenderData = (): PrerenderData | null => {
  if (typeof window === 'undefined') return null;
  return window.__HP_PRERENDER_DATA__ || null;
};

export const PrerenderDataProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: PrerenderData | null;
}) => {
  const value = useMemo(() => initialData ?? getClientPrerenderData(), [initialData]);

  useEffect(() => {
    if (!value) return;

    if (value.bootstrap) {
      primePublicBootstrapData(value.bootstrap);
    }

    if (value.home) {
      primePublicHomeData(value.home);
    }

    if (value.productList) {
      primePublicProductsData(value.productList);
    }

    if (value.productDetail?.product?.id) {
      primePublicProductDetailData(value.productDetail.product.id, value.productDetail);
    }

    if (value.installationCases) {
      primePublicCasesData(value.installationCases);
    }

    if (value.installationCaseDetail?.post?.id) {
      primePublicCaseDetailData(value.installationCaseDetail.post.id, value.installationCaseDetail);
    }

    if (value.notices) {
      primePublicNoticesData(value.notices);
    }

    if (value.noticeDetail?.post?.id) {
      primePublicNoticeDetailData(value.noticeDetail.post.id, value.noticeDetail);
    }

    if (value.support) {
      primePublicSupportData(value.support);
    }

    if (value.company) {
      primePublicCompanyData(value.company);
    }
  }, [value]);

  return (
    <PrerenderDataContext.Provider value={value}>
      {children}
    </PrerenderDataContext.Provider>
  );
};

export const usePrerenderData = () => useContext(PrerenderDataContext);

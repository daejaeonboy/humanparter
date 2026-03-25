import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { InstallationCase, NavMenuItem } from '../api/cmsApi';
import type { Product } from '../api/productApi';

export type PrerenderData = {
  generatedAt?: string;
  productList?: {
    products: Product[];
    navItems: NavMenuItem[];
  };
  productDetail?: {
    product: Product;
    relatedProducts: Product[];
  };
  installationCases?: {
    cases: InstallationCase[];
  };
  installationCaseDetail?: {
    post: InstallationCase;
    allCases: InstallationCase[];
  };
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

  return (
    <PrerenderDataContext.Provider value={value}>
      {children}
    </PrerenderDataContext.Provider>
  );
};

export const usePrerenderData = () => useContext(PrerenderDataContext);

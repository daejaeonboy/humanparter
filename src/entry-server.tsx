import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router';
import { AppContent, AppProviders } from '../App';
import type { PrerenderData } from './prerender/context';

export function render(url: string, prerenderData?: PrerenderData | null) {
  const helmetContext = {} as { helmet?: any };
  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <AppProviders prerenderData={prerenderData}>
        <StaticRouter location={url}>
          <AppContent />
        </StaticRouter>
      </AppProviders>
    </HelmetProvider>,
  );

  return {
    appHtml,
    helmet: helmetContext.helmet,
  };
}

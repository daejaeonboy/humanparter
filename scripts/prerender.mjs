import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const serverBundlePath = path.join(projectRoot, '.prerender', 'entry-server.js');
const templatePath = path.join(distDir, 'index.html');

const SITE_URL = 'https://humanpartner.kr';
const SUPABASE_URL = 'https://mnxsvjrqrayhbcmhwddz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv';
const SUPABASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

const STATIC_ROUTES = [
  {
    route: '/',
    sitemap: { changefreq: 'daily', priority: '1.0' },
  },
  {
    route: '/products',
    sitemap: { changefreq: 'daily', priority: '0.9' },
  },
  {
    route: '/company',
    sitemap: { changefreq: 'monthly', priority: '0.8' },
  },
  {
    route: '/quote-request',
    sitemap: { changefreq: 'monthly', priority: '0.9' },
  },
  {
    route: '/cs',
    sitemap: { changefreq: 'weekly', priority: '0.7' },
  },
  {
    route: '/cases',
    sitemap: { changefreq: 'weekly', priority: '0.8' },
  },
  {
    route: '/terms',
    sitemap: { changefreq: 'yearly', priority: '0.3' },
  },
  {
    route: '/privacy',
    sitemap: { changefreq: 'yearly', priority: '0.3' },
  },
];

const escapeAttributeValue = (value) => value.replace(/"/g, '&quot;');

const escapeInlineJson = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const normalizeIsoDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const sortProducts = (items) => {
  return [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });
};

const sortNavItems = (items) => {
  return [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
  });
};

const sortInstallationCases = (items) => {
  return [...items].sort((a, b) => {
    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });
};

const fetchSupabaseRows = async (table, { select = '*', filters = {}, order } = {}) => {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', select);

  if (order) {
    url.searchParams.set('order', order);
  }

  Object.entries(filters).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: SUPABASE_HEADERS,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${table} fetch failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

const loadDatasets = async () => {
  const generatedAt = new Date().toISOString();

  try {
    const [products, navItems, installationCases] = await Promise.all([
      fetchSupabaseRows('products'),
      fetchSupabaseRows('nav_menu_items'),
      fetchSupabaseRows('installation_cases', {
        filters: {
          is_active: 'eq.true',
        },
      }),
    ]);

    return {
      generatedAt,
      products: sortProducts(products || []),
      navItems: sortNavItems((navItems || []).filter((item) => item.is_active !== false)),
      installationCases: sortInstallationCases(installationCases || []),
    };
  } catch (error) {
    console.warn('Dynamic prerender data fetch skipped:', error);
    return null;
  }
};

const buildPrerenderEntries = (datasets) => {
  const entries = STATIC_ROUTES.map((item) => ({
    route: item.route,
    data: null,
    sitemap: {
      route: item.route,
      ...item.sitemap,
    },
  }));

  if (!datasets) {
    return entries;
  }

  const productsEntry = entries.find((entry) => entry.route === '/products');
  if (productsEntry) {
    productsEntry.data = {
      generatedAt: datasets.generatedAt,
      productList: {
        products: datasets.products,
        navItems: datasets.navItems,
      },
    };
  }

  const casesEntry = entries.find((entry) => entry.route === '/cases');
  if (casesEntry) {
    casesEntry.data = {
      generatedAt: datasets.generatedAt,
      installationCases: {
        cases: datasets.installationCases,
      },
    };
  }

  datasets.products.forEach((product) => {
    if (!product?.id) return;

    const relatedProducts = datasets.products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 4);

    entries.push({
      route: `/products/${product.id}`,
      data: {
        generatedAt: datasets.generatedAt,
        productDetail: {
          product,
          relatedProducts,
        },
      },
      sitemap: {
        route: `/products/${product.id}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: normalizeIsoDate(product.created_at) || datasets.generatedAt,
      },
    });
  });

  datasets.installationCases.forEach((item) => {
    if (!item?.id) return;

    entries.push({
      route: `/cases/${item.id}`,
      data: {
        generatedAt: datasets.generatedAt,
        installationCaseDetail: {
          post: item,
          allCases: datasets.installationCases,
        },
      },
      sitemap: {
        route: `/cases/${item.id}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: normalizeIsoDate(item.created_at) || datasets.generatedAt,
      },
    });
  });

  return entries;
};

const buildSitemapXml = (entries) => {
  const uniqueEntries = [];
  const seenRoutes = new Set();

  entries.forEach((entry) => {
    if (!entry?.route || seenRoutes.has(entry.route)) return;
    seenRoutes.add(entry.route);
    uniqueEntries.push(entry);
  });

  const xmlEntries = uniqueEntries
    .map((entry) => {
      const lines = [
        '  <url>',
        `    <loc>${new URL(entry.route, SITE_URL).toString()}</loc>`,
      ];

      if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }

      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      lines.push(`    <priority>${entry.priority}</priority>`);
      lines.push('  </url>');
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>\n`;
};

const applyAttributes = (html, tagName, attributesMarkup) => {
  if (!attributesMarkup) return html;

  return html.replace(
    new RegExp(`<${tagName}([^>]*)>`, 'i'),
    (match, existingAttributes = '') => {
      const trimmedAttributes = attributesMarkup.trim();
      if (!trimmedAttributes) return match;

      const nextAttributes = `${existingAttributes} ${trimmedAttributes}`.replace(/\s+/g, ' ').trimEnd();
      return `<${tagName}${nextAttributes ? ` ${nextAttributes}` : ''}>`;
    },
  );
};

const injectHead = (template, helmet) => {
  const titleMarkup = helmet?.title?.toString?.() || '';
  const headFragments = [
    helmet?.priority?.toString?.() || '',
    helmet?.meta?.toString?.() || '',
    helmet?.link?.toString?.() || '',
    helmet?.style?.toString?.() || '',
    helmet?.base?.toString?.() || '',
    helmet?.script?.toString?.() || '',
    helmet?.noscript?.toString?.() || '',
  ].filter(Boolean);

  let html = template;

  if (titleMarkup) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, titleMarkup);
  }

  if (headFragments.length > 0) {
    html = html.replace('</head>', `  ${headFragments.join('\n  ')}\n  </head>`);
  }

  html = applyAttributes(html, 'html', helmet?.htmlAttributes?.toString?.() || '');
  html = applyAttributes(html, 'body', helmet?.bodyAttributes?.toString?.() || '');

  return html;
};

const injectPrerenderData = (html, data) => {
  if (!data) return html;

  const serializedData = escapeInlineJson(data);
  const scriptTag = `<script>window.__HP_PRERENDER_DATA__=${serializedData};</script>`;
  return html.replace('</head>', `  ${scriptTag}\n  </head>`);
};

const injectAppHtml = (template, appHtml) => {
  return template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
};

const routeToOutputPath = (route) => {
  if (route === '/') return path.join(distDir, 'index.html');

  const normalizedSegments = route.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return path.join(distDir, ...normalizedSegments, 'index.html');
};

const run = async () => {
  const template = await readFile(templatePath, 'utf8');
  const { render } = await import(pathToFileURL(serverBundlePath).href);
  const datasets = await loadDatasets();
  const prerenderEntries = buildPrerenderEntries(datasets);

  for (const entry of prerenderEntries) {
    const { appHtml, helmet } = render(entry.route, entry.data);
    let html = injectHead(template, helmet);
    html = injectPrerenderData(html, entry.data);
    html = injectAppHtml(html, appHtml);

    const outputPath = routeToOutputPath(entry.route);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, 'utf8');
  }

  const notFoundHtml = render('/__prerender_404__', null);
  let notFoundDocument = injectHead(template, notFoundHtml.helmet);
  notFoundDocument = injectAppHtml(notFoundDocument, notFoundHtml.appHtml);
  notFoundDocument = notFoundDocument.replace(
    '<html lang="ko" data-theme="light">',
    `<html lang="ko" data-theme="light" data-prerendered="${escapeAttributeValue('true')}">`,
  );
  await writeFile(path.join(distDir, '404.html'), notFoundDocument, 'utf8');

  const sitemapXml = buildSitemapXml(prerenderEntries.map((entry) => entry.sitemap));
  await writeFile(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');

  await rm(path.join(projectRoot, '.prerender'), { recursive: true, force: true });
};

run().catch((error) => {
  console.error('Prerender failed:', error);
  process.exitCode = 1;
});

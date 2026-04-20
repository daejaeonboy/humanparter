import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  buildRobotsContent,
  DEFAULT_LOCALE,
  DEFAULT_SOCIAL_IMAGE,
  normalizeMetaText,
  SITE_NAME,
  toAbsoluteUrl,
} from '../src/utils/seo';

type StructuredData = Record<string, unknown>;

type SeoProps = {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  canonicalPath?: string | false;
  urlPath?: string | false;
  keywords?: string;
  noindex?: boolean;
  nofollow?: boolean;
  robots?: string;
  structuredData?: StructuredData | StructuredData[];
};

export const Seo = ({
  title,
  description,
  image = DEFAULT_SOCIAL_IMAGE,
  imageAlt,
  type = 'website',
  canonicalPath,
  urlPath,
  keywords,
  noindex,
  nofollow,
  robots,
  structuredData,
}: SeoProps) => {
  const location = useLocation();
  const resolvedDescription = normalizeMetaText(description);
  const currentPath = `${location.pathname}${location.search}`;
  const resolvedCanonicalPath = canonicalPath === undefined ? currentPath : canonicalPath;
  const resolvedUrlPath = urlPath === undefined ? currentPath : urlPath;
  const canonicalUrl = resolvedCanonicalPath === false ? undefined : toAbsoluteUrl(resolvedCanonicalPath);
  const pageUrl = resolvedUrlPath === false ? undefined : toAbsoluteUrl(resolvedUrlPath);
  const imageUrl = toAbsoluteUrl(image);
  const schemas = Array.isArray(structuredData)
    ? structuredData.filter(Boolean)
    : structuredData
      ? [structuredData]
      : [];

  return (
    <Helmet>
      <title>{title}</title>
      {resolvedDescription && <meta name="description" content={resolvedDescription} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots || buildRobotsContent({ noindex, nofollow })} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type" content={type} />
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={DEFAULT_LOCALE} />
      <meta property="og:title" content={title} />
      {resolvedDescription && <meta property="og:description" content={resolvedDescription} />}
      <meta property="og:image" content={imageUrl} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {resolvedDescription && <meta name="twitter:description" content={resolvedDescription} />}
      <meta name="twitter:image" content={imageUrl} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}

      {schemas.map((schema, index) => (
        <script key={`structured-data-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

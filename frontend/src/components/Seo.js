import { Helmet } from 'react-helmet-async';

export const SITE_NAME = 'BBOreporters';
export const DEFAULT_TITLE = 'BBOreporters | Breaking News, Politics, Business & Sports';
export const DEFAULT_DESCRIPTION =
  'BBOreporters delivers breaking news and in-depth reporting on politics, business, sports, entertainment, health and education.';
export const SITE_URL = (process.env.REACT_APP_SITE_URL || window.location.origin).replace(/\/+$/, '');

export const absoluteUrl = (url) => {
  if (!url) return `${SITE_URL}/logo.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const stripHtml = (html = '') =>
  String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export const truncate = (text = '', max = 160) => {
  const clean = String(text).replace(/\.{3}$|…$/, '').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = 'website',
  noindex = false,
  jsonLd = [],
  children,
}) => {
  const canonical = path ? `${SITE_URL}${path}` : undefined;
  const imageUrl = absoluteUrl(image);
  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {children}
      {jsonLd.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data).replace(/</g, '\\u003c')}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;

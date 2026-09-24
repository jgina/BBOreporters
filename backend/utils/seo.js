const SITE_NAME = 'BBOreporters';
const DEFAULT_TITLE = 'BBOreporters | Breaking News, Politics, Business & Sports';
const DEFAULT_DESCRIPTION =
  'BBOreporters delivers breaking news and in-depth reporting on politics, business, sports, entertainment, health and education.';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeXml = escapeHtml;

const stripHtml = (html = '') =>
  String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text = '', max = 160) => {
  const clean = String(text).replace(/\.{3}$|…$/, '').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

const getSiteUrl = (req) => {
  const configured = process.env.SITE_URL || process.env.CLIENT_URL;
  if (configured) return configured.replace(/\/+$/, '');
  const forwardedProto = req.get('x-forwarded-proto');
  const protocol = forwardedProto ? forwardedProto.split(',')[0] : req.protocol;
  return `${protocol}://${req.get('host')}`;
};

const absoluteUrl = (siteUrl, url) => {
  if (!url) return `${siteUrl}/logo.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const toIso = (date) => (date ? new Date(date).toISOString() : undefined);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const postDate = (post) => post.publishAt || post.createdAt;

// JSON.stringify does not escape "<", so "</script>" inside content could break out of the tag.
const jsonLdTag = (data) =>
  `<script type="application/ld+json" data-rh="true">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const organizationSchema = (siteUrl) => ({
  '@type': 'NewsMediaOrganization',
  '@id': `${siteUrl}/#organization`,
  name: SITE_NAME,
  url: `${siteUrl}/`,
  logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
  email: 'support@bboreporters.com',
});

const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

module.exports = {
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  escapeHtml,
  escapeXml,
  stripHtml,
  truncate,
  getSiteUrl,
  absoluteUrl,
  toIso,
  formatDate,
  postDate,
  jsonLdTag,
  organizationSchema,
  breadcrumbSchema,
};

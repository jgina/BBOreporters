const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const Category = require('../models/Category');
const Author = require('../models/Author');
const { buildVisiblePostsFilter } = require('./postController');
const {
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
} = require('../utils/seo');

const BUILD_INDEX = path.join(__dirname, '..', '..', 'frontend', 'build', 'index.html');
const CATEGORY_PAGE_SIZE = 10;

let cachedTemplate = null;
const getTemplate = () => {
  if (!cachedTemplate) cachedTemplate = fs.readFileSync(BUILD_INDEX, 'utf8');
  return cachedTemplate;
};

const listFields = 'title slug excerpt image category sourceName publishAt createdAt updatedAt';
const visiblePosts = (extra = {}) => ({ $and: [buildVisiblePostsFilter(), extra] });
const sortNewest = { createdAt: -1 };

const postDescription = (post) =>
  truncate(stripHtml(post.excerpt) || stripHtml(post.content), 160) || DEFAULT_DESCRIPTION;

// Tags carry data-rh so react-helmet-async replaces them once the app mounts instead of duplicating them.
const metaTag = (attr, key, content) =>
  content ? `<meta ${attr}="${key}" content="${escapeHtml(content)}" data-rh="true"/>` : '';

const buildHead = ({ siteUrl, title, description, canonical, image, type, robots, jsonLd, extraMeta = [] }) => {
  const imageUrl = absoluteUrl(siteUrl, image);
  return [
    `<title>${escapeHtml(title)}</title>`,
    metaTag('name', 'description', description),
    metaTag('name', 'robots', robots),
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" data-rh="true"/>` : '',
    metaTag('property', 'og:site_name', SITE_NAME),
    metaTag('property', 'og:type', type),
    metaTag('property', 'og:title', title),
    metaTag('property', 'og:description', description),
    metaTag('property', 'og:url', canonical),
    metaTag('property', 'og:image', imageUrl),
    metaTag('property', 'og:image:alt', title),
    metaTag('name', 'twitter:card', 'summary_large_image'),
    metaTag('name', 'twitter:title', title),
    metaTag('name', 'twitter:description', description),
    metaTag('name', 'twitter:image', imageUrl),
    ...extraMeta.map(([attr, key, content]) => metaTag(attr, key, content)),
    ...jsonLd.map(jsonLdTag),
  ].join('');
};

const renderLayout = (categories, main) => `
<header class="ssr-header">
  <a href="/" class="ssr-brand"><img src="/logo.png" alt="${SITE_NAME} logo" width="48" height="48"/> ${SITE_NAME}</a>
  <nav aria-label="Sections">
    <a href="/">Home</a>
    ${categories.map((c) => `<a href="/category/${encodeURIComponent(c.slug)}">${escapeHtml(c.name)}</a>`).join('')}
    <a href="/authors">Authors</a>
  </nav>
</header>
<main class="page-content container-lg">${main}</main>
<footer class="ssr-footer">
  <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
  <nav aria-label="Legal"><a href="/privacy-policy">Privacy Policy</a> <a href="/authors">Our Authors</a></nav>
</footer>`;

const renderPostCard = (post) => {
  const url = `/post/${encodeURIComponent(post.slug)}`;
  const category = post.category?.slug
    ? `<a class="news-card-category" href="/category/${encodeURIComponent(post.category.slug)}">${escapeHtml(post.category.name)}</a>`
    : '';
  return `
<article class="news-card">
  <a href="${url}" class="news-card-image"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy"/></a>
  <div class="news-card-body">
    <div class="news-card-meta">${category} <time datetime="${toIso(postDate(post))}">${formatDate(postDate(post))}</time></div>
    <h3><a href="${url}">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(truncate(stripHtml(post.excerpt), 180))}</p>
  </div>
</article>`;
};

const renderPostList = (posts) =>
  posts.length
    ? `<div class="latest-news-grid">${posts.map(renderPostCard).join('')}</div>`
    : '<p class="empty-state">No stories published yet.</p>';

const getCategories = () => Category.find().select('name slug').sort({ name: 1 }).lean();

const sendPage = (req, res, page) => {
  const siteUrl = getSiteUrl(req);
  const head = buildHead({
    siteUrl,
    title: page.title || DEFAULT_TITLE,
    description: page.description || DEFAULT_DESCRIPTION,
    canonical: page.canonical,
    image: page.image,
    type: page.type || 'website',
    robots: page.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    jsonLd: page.jsonLd || [],
    extraMeta: page.extraMeta,
  });

  // Function replacers keep "$" sequences in article text from being treated as regex back-references.
  const html = getTemplate()
    .replace(/<title>[\s\S]*?<\/title>/, () => head)
    .replace('<div id="root"></div>', () => `<div id="root">${page.body || ''}</div>`);

  res
    .status(page.status || 200)
    .set('Cache-Control', 'public, max-age=0, must-revalidate')
    .type('html')
    .send(html);
};

const renderNotFound = async (req, res) => {
  const categories = await getCategories();
  sendPage(req, res, {
    status: 404,
    title: `Page not found | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    robots: 'noindex, follow',
    body: renderLayout(
      categories,
      '<h1>Page not found</h1><p>The page you are looking for does not exist. <a href="/">Return to the homepage</a>.</p>'
    ),
  });
};

const withFallback = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('SEO render error:', error);
    res.status(503).set('Retry-After', '120').type('html').send(getTemplate());
  }
};

exports.renderHome = withFallback(async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const [posts, categories] = await Promise.all([
    Post.find(visiblePosts()).select(listFields).populate('category', 'name slug').sort(sortNewest).limit(30).lean(),
    getCategories(),
  ]);

  const main = `
<h1>${SITE_NAME}: Latest News and Headlines</h1>
<p>${escapeHtml(DEFAULT_DESCRIPTION)}</p>
<section aria-labelledby="latest-news"><h2 id="latest-news">Latest News</h2>${renderPostList(posts)}</section>`;

  sendPage(req, res, {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonical: `${siteUrl}/`,
    image: posts[0]?.image,
    jsonLd: [
      { '@context': 'https://schema.org', ...organizationSchema(siteUrl) },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: SITE_NAME,
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
    body: renderLayout(categories, main),
  });
});

exports.renderCategory = withFallback(async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === req.params.slug);
  if (!category) return renderNotFound(req, res);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const filter = visiblePosts({ category: category._id });
  const [total, posts] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter)
      .select(listFields)
      .populate('category', 'name slug')
      .sort(sortNewest)
      .skip((page - 1) * CATEGORY_PAGE_SIZE)
      .limit(CATEGORY_PAGE_SIZE)
      .lean(),
  ]);
  const pages = Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE));
  if (page > pages) return renderNotFound(req, res);

  const basePath = `/category/${encodeURIComponent(category.slug)}`;
  const pageUrl = (n) => (n > 1 ? `${basePath}?page=${n}` : basePath);
  const pagination =
    pages > 1
      ? `<nav class="pagination-controls" aria-label="Pagination">
          ${page > 1 ? `<a href="${pageUrl(page - 1)}" rel="prev">Previous</a>` : ''}
          <span>Page ${page} of ${pages}</span>
          ${page < pages ? `<a href="${pageUrl(page + 1)}" rel="next">Next</a>` : ''}
        </nav>`
      : '';

  const title = `${category.name} News${page > 1 ? ` (Page ${page})` : ''} | ${SITE_NAME}`;
  const description = `Latest ${category.name} news, updates and analysis from ${SITE_NAME}.`;
  const canonical = `${siteUrl}${pageUrl(page)}`;

  sendPage(req, res, {
    title,
    description,
    canonical,
    image: posts[0]?.image,
    jsonLd: [
      breadcrumbSchema([
        { name: 'Home', url: `${siteUrl}/` },
        { name: category.name, url: `${siteUrl}${basePath}` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.name} News`,
        description,
        url: canonical,
        isPartOf: { '@id': `${siteUrl}/#website` },
      },
    ],
    body: renderLayout(
      categories,
      `<h1>${escapeHtml(category.name)} News</h1>
       <p>Latest coverage and updates from the ${escapeHtml(category.name)} desk.</p>
       ${renderPostList(posts)}${pagination}`
    ),
  });
});

exports.renderPost = withFallback(async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const [post, categories] = await Promise.all([
    Post.findOne(visiblePosts({ slug: req.params.slug })).populate('category', 'name slug').lean(),
    getCategories(),
  ]);
  if (!post) return renderNotFound(req, res);

  const [related, author] = await Promise.all([
    post.category
      ? Post.find(visiblePosts({ category: post.category._id, _id: { $ne: post._id } }))
          .select(listFields)
          .populate('category', 'name slug')
          .sort(sortNewest)
          .limit(4)
          .lean()
      : [],
    post.sourceName ? Author.findOne({ name: post.sourceName, active: true }).select('name slug').lean() : null,
  ]);

  const canonical = `${siteUrl}/post/${encodeURIComponent(post.slug)}`;
  const description = postDescription(post);
  const authorName = post.sourceName || `${SITE_NAME} Desk`;
  const authorUrl = author ? `${siteUrl}/authors/${encodeURIComponent(author.slug)}` : undefined;
  const images = (post.images?.length ? post.images : [post.image]).filter(Boolean);
  const published = toIso(postDate(post));
  const modified = toIso(post.updatedAt) || published;

  const crumbs = [{ name: 'Home', url: `${siteUrl}/` }];
  if (post.category) {
    crumbs.push({ name: post.category.name, url: `${siteUrl}/category/${encodeURIComponent(post.category.slug)}` });
  }
  crumbs.push({ name: post.title, url: canonical });

  const byline = authorUrl
    ? `<a href="/authors/${encodeURIComponent(author.slug)}" rel="author">${escapeHtml(authorName)}</a>`
    : escapeHtml(authorName);
  const gallery =
    images.length > 1
      ? `<section><h2>Photo Gallery</h2>${images
          .slice(1)
          .map((src, i) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(`${post.title} photo ${i + 1}`)}" loading="lazy"/>`)
          .join('')}</section>`
      : '';
  const tags = post.tags?.length
    ? `<p>Tags: ${post.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join(', ')}</p>`
    : '';

  const main = `
<nav aria-label="Breadcrumb" class="ssr-breadcrumb">
  ${crumbs
    .slice(0, -1)
    .map((c) => `<a href="${escapeHtml(c.url.replace(siteUrl, '') || '/')}">${escapeHtml(c.name)}</a> &rsaquo; `)
    .join('')}
</nav>
<article class="post-detail">
  <header class="post-meta">
    ${post.category ? `<a class="post-category" href="/category/${encodeURIComponent(post.category.slug)}">${escapeHtml(post.category.name)}</a>` : ''}
    <h1>${escapeHtml(post.title)}</h1>
    <p class="post-byline">By ${byline} &middot; <time datetime="${published}">${formatDate(postDate(post))}</time></p>
  </header>
  ${post.image ? `<img class="post-featured" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}"/>` : ''}
  <div class="post-content">${post.content}</div>
  ${gallery}
  ${tags}
</article>
${related.length ? `<section class="related-section"><h2>Related Stories</h2>${renderPostList(related)}</section>` : ''}`;

  sendPage(req, res, {
    title: `${post.title} | ${SITE_NAME}`,
    description,
    canonical,
    image: post.image,
    type: 'article',
    extraMeta: [
      ['property', 'article:published_time', published],
      ['property', 'article:modified_time', modified],
      ['property', 'article:section', post.category?.name],
      ['name', 'author', authorName],
      ...(post.tags || []).map((tag) => ['property', 'article:tag', tag]),
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title.slice(0, 110),
        description,
        image: images.map((src) => absoluteUrl(siteUrl, src)),
        datePublished: published,
        dateModified: modified,
        author: [{ '@type': authorUrl ? 'Person' : 'Organization', name: authorName, url: authorUrl }],
        publisher: organizationSchema(siteUrl),
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        articleSection: post.category?.name,
        keywords: post.tags?.length ? post.tags.join(', ') : undefined,
        isAccessibleForFree: true,
      },
      breadcrumbSchema(crumbs),
    ],
    body: renderLayout(categories, main),
  });
});

exports.renderAuthors = withFallback(async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const [authors, categories] = await Promise.all([
    Author.find({ active: true }).sort({ displayOrder: 1, name: 1 }).lean(),
    getCategories(),
  ]);

  const description = `Meet the editors, correspondents and reporters behind ${SITE_NAME}.`;
  const main = `
<h1>Our Authors</h1>
<p>${escapeHtml(description)}</p>
<div class="authors-grid">
${authors
  .map(
    (a) => `<article class="author-card">
  <img src="${escapeHtml(a.image)}" alt="${escapeHtml(a.name)}" class="author-card-image" loading="lazy"/>
  <div class="author-card-body">
    <h2><a href="/authors/${encodeURIComponent(a.slug)}">${escapeHtml(a.name)}</a></h2>
    <p class="author-card-role">${escapeHtml(a.title)}</p>
    <p>${escapeHtml(a.summary)}</p>
  </div>
</article>`
  )
  .join('')}
</div>`;

  sendPage(req, res, {
    title: `Our Authors | ${SITE_NAME}`,
    description,
    canonical: `${siteUrl}/authors`,
    jsonLd: [
      breadcrumbSchema([
        { name: 'Home', url: `${siteUrl}/` },
        { name: 'Authors', url: `${siteUrl}/authors` },
      ]),
    ],
    body: renderLayout(categories, main),
  });
});

exports.renderAuthorProfile = withFallback(async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const [author, categories] = await Promise.all([
    Author.findOne({ slug: req.params.slug, active: true }).lean(),
    getCategories(),
  ]);
  if (!author) return renderNotFound(req, res);

  const posts = await Post.find(visiblePosts({ sourceName: author.name }))
    .select(listFields)
    .populate('category', 'name slug')
    .sort({ publishAt: -1, createdAt: -1 })
    .limit(12)
    .lean();

  const canonical = `${siteUrl}/authors/${encodeURIComponent(author.slug)}`;
  const description = truncate(
    stripHtml(author.summary) || stripHtml(author.bio) || `${author.name}, ${author.title} at ${SITE_NAME}.`,
    160
  );

  const main = `
<article class="author-profile-shell">
  <img src="${escapeHtml(author.image)}" alt="${escapeHtml(author.name)}" class="author-profile-image"/>
  <h1>${escapeHtml(author.name)}</h1>
  <p class="author-profile-role">${escapeHtml(author.title)}</p>
  <p>${escapeHtml(author.summary)}</p>
  <section><h2>Biography</h2>${author.bio || '<p>No biography has been added yet.</p>'}</section>
</article>
<section><h2>Latest Stories by ${escapeHtml(author.name)}</h2>${renderPostList(posts)}</section>`;

  sendPage(req, res, {
    title: `${author.name}, ${author.title} | ${SITE_NAME}`,
    description,
    canonical,
    image: author.image,
    type: 'profile',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: canonical,
        mainEntity: {
          '@type': 'Person',
          name: author.name,
          jobTitle: author.title,
          description,
          image: absoluteUrl(siteUrl, author.image),
          url: canonical,
          worksFor: { '@id': `${siteUrl}/#organization` },
        },
      },
      breadcrumbSchema([
        { name: 'Home', url: `${siteUrl}/` },
        { name: 'Authors', url: `${siteUrl}/authors` },
        { name: author.name, url: canonical },
      ]),
    ],
    body: renderLayout(categories, main),
  });
});

exports.renderPrivacyPolicy = withFallback(async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const categories = await getCategories();
  sendPage(req, res, {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Read the ${SITE_NAME} Privacy Policy to understand how personal information, cookies, analytics and user rights are handled.`,
    canonical: `${siteUrl}/privacy-policy`,
    body: renderLayout(
      categories,
      `<h1>Privacy Policy</h1><p>How ${SITE_NAME} collects, uses and protects personal information, cookies and analytics data.</p>`
    ),
  });
});

exports.renderNoIndex = withFallback(async (req, res) => {
  sendPage(req, res, { title: SITE_NAME, robots: 'noindex, nofollow' });
});

exports.renderNotFound = withFallback(renderNotFound);

exports.robotsTxt = (req, res) => {
  const siteUrl = getSiteUrl(req);
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /search',
      '',
      `Sitemap: ${siteUrl}/sitemap.xml`,
      `Sitemap: ${siteUrl}/news-sitemap.xml`,
      '',
    ].join('\n')
  );
};

const urlEntry = ({ loc, lastmod, changefreq, priority, images = [] }) =>
  `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${
    changefreq ? `<changefreq>${changefreq}</changefreq>` : ''
  }${priority ? `<priority>${priority}</priority>` : ''}${images
    .map((src) => `<image:image><image:loc>${escapeXml(src)}</image:loc></image:image>`)
    .join('')}</url>`;

exports.sitemapXml = async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const [posts, categories, authors] = await Promise.all([
    Post.find(visiblePosts()).select('slug image updatedAt').sort({ updatedAt: -1 }).limit(45000).lean(),
    Category.find().select('slug updatedAt').lean(),
    Author.find({ active: true }).select('slug updatedAt').lean(),
  ]);
  const latest = toIso(posts[0]?.updatedAt);

  const entries = [
    urlEntry({ loc: `${siteUrl}/`, lastmod: latest, changefreq: 'hourly', priority: '1.0' }),
    urlEntry({ loc: `${siteUrl}/authors`, changefreq: 'monthly', priority: '0.4' }),
    urlEntry({ loc: `${siteUrl}/privacy-policy`, changefreq: 'yearly', priority: '0.2' }),
    ...categories.map((c) =>
      urlEntry({ loc: `${siteUrl}/category/${encodeURIComponent(c.slug)}`, lastmod: latest, changefreq: 'hourly', priority: '0.8' })
    ),
    ...authors.map((a) =>
      urlEntry({ loc: `${siteUrl}/authors/${encodeURIComponent(a.slug)}`, lastmod: toIso(a.updatedAt), changefreq: 'weekly', priority: '0.5' })
    ),
    ...posts.map((p) =>
      urlEntry({
        loc: `${siteUrl}/post/${encodeURIComponent(p.slug)}`,
        lastmod: toIso(p.updatedAt),
        changefreq: 'weekly',
        priority: '0.7',
        images: p.image ? [absoluteUrl(siteUrl, p.image)] : [],
      })
    ),
  ];

  res
    .type('application/xml')
    .set('Cache-Control', 'public, max-age=900')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}</urlset>`
    );
};

exports.rssXml = async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const posts = await Post.find(visiblePosts())
    .select(listFields)
    .populate('category', 'name')
    .sort(sortNewest)
    .limit(50)
    .lean();

  const items = posts
    .map((p) => {
      const url = `${siteUrl}/post/${encodeURIComponent(p.slug)}`;
      return `<item><title>${escapeXml(p.title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><pubDate>${new Date(postDate(p)).toUTCString()}</pubDate>${
        p.category?.name ? `<category>${escapeXml(p.category.name)}</category>` : ''
      }<description>${escapeXml(truncate(stripHtml(p.excerpt), 300))}</description>${
        p.image ? `<enclosure url="${escapeXml(absoluteUrl(siteUrl, p.image))}" type="image/jpeg" length="0"/>` : ''
      }</item>`;
    })
    .join('');

  res
    .type('application/rss+xml')
    .set('Cache-Control', 'public, max-age=300')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${SITE_NAME}</title><link>${siteUrl}/</link><description>${escapeXml(DEFAULT_DESCRIPTION)}</description><language>en</language><atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`
    );
};

// Google News only reads articles published in the last 48 hours.
exports.newsSitemapXml = async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const posts = await Post.find(
    visiblePosts({ $or: [{ publishAt: { $gte: since } }, { publishAt: null, createdAt: { $gte: since } }] })
  )
    .select('title slug publishAt createdAt')
    .sort(sortNewest)
    .limit(1000)
    .lean();

  const entries = posts.map(
    (p) => `<url><loc>${escapeXml(`${siteUrl}/post/${encodeURIComponent(p.slug)}`)}</loc><news:news><news:publication><news:name>${SITE_NAME}</news:name><news:language>en</news:language></news:publication><news:publication_date>${toIso(postDate(p))}</news:publication_date><news:title>${escapeXml(p.title)}</news:title></news:news></url>`
  );

  res
    .type('application/xml')
    .set('Cache-Control', 'public, max-age=300')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${entries.join('')}</urlset>`
    );
};

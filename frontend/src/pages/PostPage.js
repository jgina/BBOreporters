import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostBySlug, fetchPosts } from '../services/postService';
import { getSiteContent } from '../services/siteContentService';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import Seo, { SITE_NAME, SITE_URL, absoluteUrl, breadcrumbSchema, stripHtml, truncate } from '../components/Seo';

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const siteContent = getSiteContent();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchPostBySlug(slug);
        const postData = response.data;
        setPost(postData);

        const requests = [
          fetchPosts({
            limit: 6,
            status: 'published',
          }),
        ];

        if (postData?.category?.slug) {
          requests.push(
            fetchPosts({
              category: postData.category.slug,
              limit: 5,
              status: 'published',
            })
          );
        }

        const [trendingRes, relatedRes] = await Promise.all(requests);

        setTrending((trendingRes?.data?.posts || []).filter((item) => item.slug !== slug).slice(0, 6));
        setRelated((relatedRes?.data?.posts || []).filter((item) => item.slug !== slug).slice(0, 3));
      } catch {
        setError('Story not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return <div className="loading-state container-lg">Loading story...</div>;
  }

  if (error || !post) {
    return <div className="empty-state container-lg">{error || 'Story not found.'}</div>;
  }

  const articlePath = `/post/${post.slug}`;
  const articleUrl = `${SITE_URL}${articlePath}`;
  const shareUrl = `${SITE_URL}/share/${post.slug}`;

  const metaDescription = truncate(stripHtml(post.excerpt) || stripHtml(post.content), 160);
  const galleryImages = post.images?.length ? post.images : post.image ? [post.image] : [];
  const authorName = post.sourceName || `${SITE_NAME} Desk`;
  const publishedIso = new Date(post.publishAt || post.createdAt).toISOString();
  const breadcrumbs = [
    { name: 'Home', url: `${SITE_URL}/` },
    ...(post.category?.slug
      ? [{ name: post.category.name, url: `${SITE_URL}/category/${post.category.slug}` }]
      : []),
    { name: post.title, url: articleUrl },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 1800);
    } catch {
      setCopySuccess(false);
    }
  };

  return (
    <section className="page-content container-lg post-page">
      <Seo
        title={`${post.title} | ${SITE_NAME}`}
        description={metaDescription}
        path={articlePath}
        image={post.image}
        type="article"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.title.slice(0, 110),
            description: metaDescription,
            image: galleryImages.map(absoluteUrl),
            datePublished: publishedIso,
            dateModified: post.updatedAt || publishedIso,
            author: [{ '@type': 'Organization', name: authorName }],
            publisher: {
              '@type': 'NewsMediaOrganization',
              name: SITE_NAME,
              url: `${SITE_URL}/`,
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
            articleSection: post.category?.name,
            keywords: post.tags?.length ? post.tags.join(', ') : undefined,
            isAccessibleForFree: true,
          },
          breadcrumbSchema(breadcrumbs),
        ]}
      >
        <meta property="article:published_time" content={publishedIso} />
        {post.updatedAt ? <meta property="article:modified_time" content={post.updatedAt} /> : null}
        {post.category?.name ? <meta property="article:section" content={post.category.name} /> : null}
        <meta name="author" content={authorName} />
      </Seo>

      <div className="post-layout">
        <article className="post-detail">
          <div className="post-meta">
            {post.category?.slug ? (
              <Link to={`/category/${post.category.slug}`} className="post-category">
                {post.category.name}
              </Link>
            ) : (
              <span className="post-category">{post.category?.name || 'News'}</span>
            )}

            <h1>{post.title}</h1>

            <div className="post-byline">
              <span>By {authorName}</span>
              <time dateTime={publishedIso}>{new Date(publishedIso).toLocaleDateString()}</time>
            </div>
          </div>

          <img className="post-featured" src={post.image} alt={post.title} fetchpriority="high" />

          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          {galleryImages.length > 1 ? (
            <section className="post-gallery-section">
              <div className="section-heading">
                <h2>Photo Gallery</h2>
                <p>More images from this story.</p>
              </div>
              <div className="post-gallery-grid">
                {galleryImages.slice(1).map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${post.title} gallery ${index + 1}`}
                    className="post-gallery-image"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="post-share">
            <span>Share this story:</span>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="share-btn wa"
            >
              WhatsApp
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="share-btn fb"
            >
              Facebook
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="share-btn tw"
            >
              X
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="share-btn ln"
            >
              LinkedIn
            </a>

            <button
              className="share-btn copy"
              onClick={handleCopyLink}
            >
              Copy Link
            </button>
            {copySuccess ? <span className="copy-success-pill">Copied</span> : null}
          </div>
        </article>

        <Sidebar
          trending={trending}
          sponsored={siteContent.sponsored}
          advertisement={siteContent.advertisement}
        />
      </div>

      {related.length > 0 ? (
        <section className="related-section">
          <h2>Related Stories</h2>
          <div className="related-grid">
            {related.map((item) => (
              <NewsCard key={item._id} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
};

export default PostPage;

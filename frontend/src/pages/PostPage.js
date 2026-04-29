import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPostBySlug, fetchPosts } from '../services/postService';
import { getSiteContent } from '../services/siteContentService';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';

const stripHtml = (content = '') => content.replace(/<[^>]+>/g, '');

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

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thebboreporters.com';
  const articleUrl = `${siteUrl}/post/${post.slug}`;
  const shareUrl = `${siteUrl}/share/${post.slug}`;

  const metaTitle = `${post.title} | BBOreporters`;
  const metaDescription = post.excerpt || `${stripHtml(post.content).slice(0, 155)}...`;
  const galleryImages = post.images?.length ? post.images : post.image ? [post.image] : [];
  const metaImage = post?.image?.startsWith('http') ? post.image : `${siteUrl}${post.image}`;

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
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="TheBBOreporters" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:image:secure_url" content={metaImage} />
        <meta property="og:image:alt" content={post.title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <meta name="twitter:image:alt" content={post.title} />
      </Helmet>

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
              <span>By {post.sourceName || 'BBOreporters Desk'}</span>
              <span>{new Date(post.publishAt || post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <img className="post-featured" src={post.image} alt={post.title} loading="lazy" />

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

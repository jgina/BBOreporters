import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../services/categoryService';
import { fetchPosts } from '../services/postService';
import { getSiteContent } from '../services/siteContentService';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import LoadingSkeleton from '../components/LoadingSkeleton';

const preferredCategories = ['politics', 'business', 'sports', 'entertainment', 'health', 'education'];
const POSTS_PER_PAGE = 12;

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const currentPageRef = useRef(1);
  const siteContent = getSiteContent();

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const [categoriesRes, postsRes] = await Promise.all([
          fetchCategories(),
          fetchPosts({ limit: POSTS_PER_PAGE, page: 1, status: 'published' }),
        ]);
        if (!mounted) return;
        setCategories(categoriesRes.data || []);
        setPosts(postsRes.data?.posts || []);
        setPage(postsRes.data?.page || 1);
        setPages(postsRes.data?.pages || 1);
        currentPageRef.current = postsRes.data?.page || 1;
      } catch {
        if (mounted) setError('Unable to load stories right now.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const refreshFromAdminUpdates = async () => {
      try {
        const activePage = currentPageRef.current;
        const postsRes = await fetchPosts({
          limit: POSTS_PER_PAGE * activePage,
          page: 1,
          status: 'published',
        });
        if (!mounted) return;
        setPosts(postsRes.data?.posts || []);
        setPages(postsRes.data?.pages || 1);
      } catch {
        // Keep existing UI state during silent refresh failures.
      }
    };

    loadInitialData();
    const refreshTimer = setInterval(refreshFromAdminUpdates, 30000);

    return () => {
      mounted = false;
      clearInterval(refreshTimer);
    };
  }, []);

  const topStory = posts[0];
  const latest = posts.slice(1, 9);
  const additionalFeed = posts.slice(9);
  const trending = posts.slice(1, 7);
  const tickerPosts = posts.slice(0, 8);
  const categorySections = preferredCategories.map((slug) => {
    const category = categories.find((cat) => cat.slug === slug);
    const items = posts.filter((post) => post.category?.slug === slug).slice(0, 4);
    return { category, items };
  });

  const handleLoadMore = async () => {
    if (loadingMore || page >= pages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await fetchPosts({
        limit: POSTS_PER_PAGE,
        page: nextPage,
        status: 'published',
      });
      const incoming = response.data?.posts || [];
      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post._id));
        const uniqueIncoming = incoming.filter((post) => !existingIds.has(post._id));
        return [...prev, ...uniqueIncoming];
      });
      setPage(response.data?.page || nextPage);
      setPages(response.data?.pages || pages);
      currentPageRef.current = response.data?.page || nextPage;
    } catch {
      setError('Could not load more stories. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  // Helper inside the component to ensure it's accessible
  const stripHtml = (content = '') => content.replace(/<[^>]+>/g, '');

  // --- Metadata Logic ---
  const siteUrl = "https://thebboreporters.com";
  const metaTitle = topStory ? `${topStory.title} | TheBBOreporters` : 'TheBBOreporters | Breaking News & Local Coverage';
  const metaDescription = topStory 
    ? (topStory.excerpt || stripHtml(topStory.content).slice(0, 150) + '...') 
    : 'Stay updated with breaking news, politics, business, sports, and more.';
  
  // Force Absolute URL for the image
  const metaImage = topStory?.image?.startsWith('http') 
    ? topStory.image 
    : `${siteUrl}${topStory?.image || '/default-og-image.jpg'}`;

  return (
    <section className="page-content container-lg">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />

        {/* Facebook / WhatsApp / LinkedIn / Telegram */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:image:secure_url" content={metaImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* X (Twitter) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Helmet>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {error ? <div className="empty-state">{error}</div> : null}
          <section className="breaking-ticker">
            <span className="breaking-label">Breaking</span>
            <div className="breaking-track">
              {tickerPosts.map((post) => (
                <Link key={post._id} to={`/post/${post.slug}`} className="breaking-item">
                  {post.title}
                </Link>
              ))}
            </div>
          </section>

          <section className="home-content-shell">
            <section className="home-main-layout">
              <article className="main-headline-card">
                {topStory ? (
                  <>
                    <Link to={`/post/${topStory.slug}`} className="main-headline-image">
                      <img src={topStory.image} alt="" aria-hidden="true" className="main-headline-image-backdrop" loading="lazy" />
                      <img src={topStory.image} alt={topStory.title} className="main-headline-image-main" loading="lazy" />
                    </Link>
                    <div className="main-headline-body">
                      <span className="news-card-category">{topStory.category?.name || 'Top Story'}</span>
                      <h1>
                        <Link to={`/post/${topStory.slug}`}>{topStory.title}</Link>
                      </h1>
                      <p>{topStory.excerpt || stripHtml(topStory.content).slice(0, 150) + '...'}</p>
                      <div className="main-headline-meta">
                        <span className="meta-text">By {topStory.sourceName || 'BBOreporters Desk'}</span>
                        <span className="meta-text">{new Date(topStory.publishAt || topStory.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="main-headline-actions">
                        <Link to={`/post/${topStory.slug}`} className="button button-primary main-headline-button">
                          Read More
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">No headline story available.</div>
                )}
              </article>
            </section>

            <Sidebar
              trending={trending}
              sponsored={siteContent.sponsored}
              advertisement={siteContent.advertisement}
            />
          </section>

          <div className="home-below-fold">
            <section className="front-section front-section-tight">
              <div className="section-heading">
                <h2>Latest News</h2>
                <p>Latest reports from all desks.</p>
              </div>
              <div className="latest-news-grid">
                {latest.map((post) => (
                  <NewsCard key={post._id} post={post} />
                ))}
              </div>
            </section>

            <section className="front-section dailytrust-plus-section">
              <div className="section-heading">
                <h2>More News</h2>
                <p>Broader coverage from across all desks.</p>
              </div>
              <div className="dailytrust-plus-grid">
                {additionalFeed.map((post) => (
                  <NewsCard key={post._id} post={post} className="dailytrust-plus-card" />
                ))}
              </div>
              {page < pages ? (
                <div className="dailytrust-loadmore">
                  <button type="button" className="button button-primary" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Load More News'}
                  </button>
                </div>
              ) : null}
            </section>

            {categorySections.map(({ category, items }, index) =>
              items.length ? (
                <section key={category?.slug || preferredCategories[index]} className="front-section">
                  <div className="section-heading">
                    <h2>{category?.name || slugToTitle(preferredCategories[index])}</h2>
                  </div>
                  <div className="latest-news-grid">
                    {items.map((post) => (
                      <NewsCard key={post._id} post={post} />
                    ))}
                  </div>
                </section>
              ) : null
            )}
          </div>
        </>
      )}
    </section>
  );
};

const slugToTitle = (slug) => {
  if (!slug) return 'News';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default HomePage;
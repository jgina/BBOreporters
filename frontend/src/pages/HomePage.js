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

  return (
    <section className="page-content container-lg">
      <Helmet>
        <title>BBOreporters | Breaking News & Local Coverage</title>
        <meta name="description" content="Stay updated with breaking news, politics, business, sports, entertainment, health, and education coverage." />
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

          <section className="home-main-layout">
            <article className="main-headline-card">
              {topStory ? (
                <>
                  <Link to={`/post/${topStory.slug}`} className="main-headline-image">
                    <img src={topStory.image} alt={topStory.title} loading="lazy" />
                  </Link>
                  <div className="main-headline-body">
                    <span className="news-card-category">{topStory.category?.name || 'Top Story'}</span>
                    <h1>
                      <Link to={`/post/${topStory.slug}`}>{topStory.title}</Link>
                    </h1>
                    <p>{topStory.excerpt || stripHtml(topStory.content).slice(0, 180) + '...'}</p>
                    <span className="meta-text">{new Date(topStory.createdAt).toLocaleDateString()}</span>
                  </div>
                </>
              ) : (
                <div className="empty-state">No headline story available.</div>
              )}
            </article>

            <Sidebar
              trending={trending}
              sponsored={siteContent.sponsored}
              advertisement={siteContent.advertisement}
            />
          </section>

          <section className="front-section">
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
        </>
      )}
    </section>
  );
};

const stripHtml = (content = '') => content.replace(/<[^>]+>/g, '');

const getStoryWindow = (posts, start, count) => {
  if (!posts.length || count <= 0) return [];

  return Array.from({ length: Math.min(count, posts.length) }, (_, index) => {
    const normalizedIndex = (start + index) % posts.length;
    return posts[normalizedIndex];
  });
};

const slugToTitle = (slug) => {
  if (!slug) return 'News';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default HomePage;

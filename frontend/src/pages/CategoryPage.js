import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPosts } from '../services/postService';
import NewsCard from '../components/NewsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const slugToTitle = (slug) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPosts({ category: slug, page, limit: 10, status: 'published' })
      .then((res) => {
        setPosts(res.data.posts);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .catch(() => setError('Could not load stories. Please try again.'))
      .finally(() => setLoading(false));
  }, [slug, page]);

  const changePage = (nextPage) => {
    searchParams.set('page', nextPage);
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

  return (
    <section className="page-content container-lg category-page">
      <Helmet>
        <title>{slugToTitle(slug)} News | BBOreporters</title>
        <meta name="description" content={`Browse the latest ${slugToTitle(slug)} headlines.`} />
      </Helmet>
      <div className="section-heading">
        <h1>{slugToTitle(slug).toUpperCase()}</h1>
        <p>Latest coverage and live updates from the {slugToTitle(slug)} desk.</p>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">No stories published in this category yet.</div>
      ) : (
        <div className="category-grid-large">
          {posts.map((post) => (
            <NewsCard key={post._id} post={post} />
          ))}
        </div>
      )}
      {meta.pages > 1 && (
        <div className="pagination-controls">
          <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.pages}
          </span>
          <button disabled={page >= meta.pages} onClick={() => changePage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default CategoryPage;

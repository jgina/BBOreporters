import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPosts } from '../services/postService';
import NewsCard from '../components/NewsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPosts({ category: slug, page, limit: 10, status: 'published' })
      .then((res) => {
        setPosts(res.data.posts);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, page]);

  const changePage = (nextPage) => {
    searchParams.set('page', nextPage);
    setSearchParams(searchParams);
  };

  return (
    <section className="page-content container-lg category-page">
      <Helmet>
        <title>{slug.replace(/-/g, ' ')} News | BBOreporters</title>
        <meta name="description" content={`Browse the latest ${slug.replace(/-/g, ' ')} headlines.`} />
      </Helmet>
      <div className="section-heading">
        <h1>{slug.replace(/-/g, ' ').toUpperCase()}</h1>
        <p>Latest coverage and live updates from the {slug.replace(/-/g, ' ')} desk.</p>
      </div>
      {loading ? <LoadingSkeleton /> : <div className="category-grid-large">{posts.map((post) => <NewsCard key={post._id} post={post} />)}</div>}
      <div className="pagination-controls">
        <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
          Previous
        </button>
        <span>Page {meta.page || 1} of {meta.pages || 1}</span>
        <button disabled={page >= (meta.pages || 1)} onClick={() => changePage(page + 1)}>
          Next
        </button>
      </div>
    </section>
  );
};

export default CategoryPage;

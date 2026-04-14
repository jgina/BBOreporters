import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPosts } from '../services/postService';
import NewsCard from '../components/NewsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const query = useQuery().get('q') || '';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPosts({ search: query, limit: 20, status: 'published' })
      .then((res) => setPosts(res.data.posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <section className="page-content container-lg search-page">
      <Helmet>
        <title>Search: {query} | BBOreporters</title>
        <meta name="description" content={`Search results for ${query} on BBOreporters.`} />
      </Helmet>
      <div className="section-heading">
        <h1>Search results</h1>
        <p>Showing stories for «{query}»</p>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : posts.length ? (
        <div className="search-grid">{posts.map((post) => <NewsCard key={post._id} post={post} />)}</div>
      ) : (
        <div className="empty-state">No results found.</div>
      )}
    </section>
  );
};

export default SearchPage;

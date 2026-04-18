import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPostBySlug, fetchPosts } from '../services/postService';
import NewsCard from '../components/NewsCard';

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchPostBySlug(slug);
        const postData = response.data;
        setPost(postData);
        if (postData?.category?.slug) {
          const relatedRes = await fetchPosts({
            category: postData.category.slug,
            limit: 4,
            status: 'published',
          });
          setRelated(
            relatedRes.data.posts.filter((item) => item.slug !== slug).slice(0, 3)
          );
        }
      } catch (err) {
        setError('Story not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return <div className="loading-state container-lg">Loading story…</div>;
  }

  if (error || !post) {
    return <div className="empty-state container-lg">{error || 'Story not found.'}</div>;
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <section className="page-content container-lg post-page">
      <Helmet>
        <title>{post.title} | BBOreporters</title>
        <meta name="description" content={post.excerpt || 'Read the full story on BBOreporters.'} />
      </Helmet>
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
            <span>By {post.author?.username || 'BBOreporters'}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <img className="post-featured" src={post.image} alt={post.title} loading="lazy" />
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="post-share">
          <span>Share this story:</span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
          >
            Twitter
          </a>
        </div>
      </article>
      {related.length > 0 && (
        <section className="related-section">
          <h2>Related Stories</h2>
          <div className="related-grid">
            {related.map((item) => (
              <NewsCard key={item._id} post={item} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default PostPage;

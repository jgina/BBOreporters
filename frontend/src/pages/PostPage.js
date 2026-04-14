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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchPostBySlug(slug);
        setPost(response.data);
        if (response.data?.category?.slug) {
          const relatedRes = await fetchPosts({ category: response.data.category.slug, limit: 4, status: 'published' });
          setRelated(relatedRes.data.posts.filter((item) => item.slug !== slug).slice(0, 3));
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    load();
  }, [slug]);

  if (loading) {
    return <div className="loading-state">Loading story…</div>;
  }

  if (!post) {
    return <div className="empty-state">Story not found.</div>;
  }

  return (
    <section className="page-content container-lg post-page">
      <Helmet>
        <title>{post.title} | BBOreporters</title>
        <meta name="description" content={post.excerpt || 'Read the full story on BBOreporters.'} />
      </Helmet>
      <article className="post-detail">
        <div className="post-meta">
          <Link to={`/category/${post.category.slug}`} className="post-category">
            {post.category.name}
          </Link>
          <h1>{post.title}</h1>
          <div className="post-byline">
            <span>By {post.author.username}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <img className="post-featured" src={post.image} alt={post.title} loading="lazy" />
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="post-share">
          <span>Share this story:</span>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noreferrer">Facebook</a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${window.location.href}`} target="_blank" rel="noreferrer">Twitter</a>
        </div>
      </article>
      <section className="related-section">
        <h2>Related Stories</h2>
        <div className="related-grid">
          {related.map((item) => (
            <NewsCard key={item._id} post={item} />
          ))}
        </div>
      </section>
    </section>
  );
};

export default PostPage;

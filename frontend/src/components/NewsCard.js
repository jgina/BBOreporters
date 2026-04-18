import { Link } from 'react-router-dom';

const NewsCard = ({ post }) => {
  if (!post) return null;

  const categorySlug = post.category?.slug;
  const categoryName = post.category?.name || 'News';
  const excerpt = post.excerpt || (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 120) + '...' : '');

  return (
    <article className="news-card">
      <Link to={`/post/${post.slug}`} className="news-card-image">
        <img src={post.image} alt={post.title} loading="lazy" />
      </Link>
      <div className="news-card-body">
        {categorySlug ? (
          <Link to={`/category/${categorySlug}`} className="news-card-category">
            {categoryName}
          </Link>
        ) : (
          <span className="news-card-category">{categoryName}</span>
        )}
        <h3>
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{excerpt}</p>
        <span className="meta-text">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
    </article>
  );
};

export default NewsCard;

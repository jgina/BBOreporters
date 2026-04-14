import { Link } from 'react-router-dom';

const NewsCard = ({ post }) => (
  <article className="news-card">
    <Link to={`/post/${post.slug}`} className="news-card-image">
      <img src={post.image} alt={post.title} loading="lazy" />
    </Link>
    <div className="news-card-body">
      <Link to={`/category/${post.category.slug}`} className="news-card-category">
        {post.category.name}
      </Link>
      <h3>
        <Link to={`/post/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 120) + '...'}</p>
      <span className="meta-text">{new Date(post.createdAt).toLocaleDateString()}</span>
    </div>
  </article>
);

export default NewsCard;

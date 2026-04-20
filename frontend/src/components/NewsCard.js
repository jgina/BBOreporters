import { Link } from 'react-router-dom';

const toExcerpt = (description = '', fallback = '') => {
  if (description) return description;
  if (!fallback) return '';
  const plainText = fallback.replace(/<[^>]+>/g, '');
  return `${plainText.slice(0, 120)}...`;
};

const NewsCard = ({ post, title, image, category, date, description, slug, className = '' }) => {
  const resolvedTitle = title || post?.title;
  const resolvedImage = image || post?.image;
  const resolvedCategory = category || post?.category?.name || 'News';
  const resolvedCategorySlug = post?.category?.slug;
  const resolvedDate = date || post?.createdAt;
  const resolvedDescription = toExcerpt(description || post?.excerpt, post?.content);
  const resolvedSlug = slug || post?.slug;

  if (!resolvedTitle || !resolvedSlug) return null;

  return (
    <article className={`news-card ${className}`.trim()}>
      <Link to={`/post/${resolvedSlug}`} className="news-card-image">
        <img src={resolvedImage} alt={resolvedTitle} loading="lazy" />
      </Link>
      <div className="news-card-body">
        <div className="news-card-meta">
          {resolvedCategorySlug ? (
            <Link to={`/category/${resolvedCategorySlug}`} className="news-card-category">
              {resolvedCategory}
            </Link>
          ) : (
            <span className="news-card-category">{resolvedCategory}</span>
          )}
          {resolvedDate ? (
            <span className="meta-text">{new Date(resolvedDate).toLocaleDateString()}</span>
          ) : null}
        </div>
        <h3>
          <Link to={`/post/${resolvedSlug}`}>{resolvedTitle}</Link>
        </h3>
        <p>{resolvedDescription}</p>
      </div>
    </article>
  );
};

export default NewsCard;

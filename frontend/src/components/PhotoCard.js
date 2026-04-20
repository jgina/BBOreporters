import { Link } from 'react-router-dom';

const toExcerpt = (description = '', fallback = '') => {
  if (description) return description;
  if (!fallback) return '';
  const plainText = fallback.replace(/<[^>]+>/g, '');
  return `${plainText.slice(0, 120)}...`;
};

const PhotoCard = ({ post, title, image, category, date, description, slug, className = '' }) => {
  const resolvedTitle = title || post?.title;
  const resolvedImage = image || post?.image;
  const resolvedCategory = category || post?.category?.name || 'Photo Story';
  const resolvedDate = date || post?.createdAt;
  const resolvedDescription = toExcerpt(description || post?.excerpt, post?.content);
  const resolvedSlug = slug || post?.slug;

  if (!resolvedTitle || !resolvedSlug) return null;

  return (
    <article className={`photo-card ${className}`.trim()}>
      <Link to={`/post/${resolvedSlug}`} className="photo-card-image">
        <img src={resolvedImage} alt={resolvedTitle} loading="lazy" />
      </Link>
      <div className="photo-card-body">
        <span className="photo-card-label">{resolvedCategory}</span>
        <h3>
          <Link to={`/post/${resolvedSlug}`}>{resolvedTitle}</Link>
        </h3>
        <p>{resolvedDescription}</p>
        {resolvedDate ? (
          <span className="meta-text">{new Date(resolvedDate).toLocaleDateString()}</span>
        ) : null}
      </div>
    </article>
  );
};

export default PhotoCard;

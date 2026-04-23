import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { fetchAuthorBySlug } from '../services/authorService';
import NewsCard from '../components/NewsCard';

const AuthorProfilePage = () => {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    fetchAuthorBySlug(slug)
      .then((res) => setAuthor(res.data))
      .catch(() => setError('Could not load this author profile.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="loading-state container-lg">Loading author profile...</div>;
  }

  if (error || !author) {
    return <div className="empty-state container-lg">{error || 'Author not found.'}</div>;
  }

  return (
    <section className="page-content container-lg author-profile-page">
      <Helmet>
        <title>{author.name} | TheBBOreporters Authors</title>
        <meta name="description" content={author.summary || `${author.name} is part of the TheBBOreporters editorial team.`} />
      </Helmet>

      <div className="author-profile-shell">
        <aside className="author-profile-aside">
          <img src={author.image} alt={author.name} className="author-profile-image" />
          <span className="admin-sidebar-kicker">Author Profile</span>
          <h1>{author.name}</h1>
          <p className="author-profile-role">{author.title}</p>
          <p className="author-profile-summary">{author.summary}</p>
          <Link to="/authors" className="author-card-link">
            Back to authors
          </Link>
        </aside>

        <div className="author-profile-main">
          <section className="author-bio-card">
            <h2>Biography</h2>
            <div dangerouslySetInnerHTML={{ __html: author.bio || '<p>No biography has been added yet.</p>' }} />
          </section>

          <section className="author-posts-section">
            <div className="section-heading">
              <h2>Latest Stories</h2>
              <p>Recent stories credited to {author.name}.</p>
            </div>
            {author.recentPosts?.length ? (
              <div className="latest-news-grid">
                {author.recentPosts.map((post) => (
                  <NewsCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="empty-state">No published stories are linked to this author yet.</div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
};

export default AuthorProfilePage;

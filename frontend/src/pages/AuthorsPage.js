import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchAuthors } from '../services/authorService';

const AuthorsPage = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuthors()
      .then((res) => setAuthors(res.data || []))
      .catch(() => setError('Could not load authors right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-content container-lg authors-page">
      <Helmet>
        <title>Authors | TheBBOreporters</title>
        <meta name="description" content="Meet the editorial board, correspondents, and reporters behind TheBBOreporters." />
      </Helmet>

      <section className="authors-hero">
        <span className="admin-sidebar-kicker">Editorial Team</span>
        <h1>Authors</h1>
        <p>Meet the editors, correspondents, and reporters shaping the stories published on TheBBOreporters.</p>
      </section>

      {loading ? <div className="loading-state">Loading authors...</div> : null}
      {error ? <div className="empty-state">{error}</div> : null}

      {!loading && !error ? (
        <div className="authors-grid">
          {authors.map((author) => (
            <article key={author._id} className="author-card">
              <img src={author.image} alt={author.name} className="author-card-image" />
              <div className="author-card-body">
                <h2>{author.name}</h2>
                <p className="author-card-role">{author.title}</p>
                <p className="author-card-summary">{author.summary || 'Read more about this member of our editorial team.'}</p>
                <Link to={`/authors/${author.slug}`} className="author-card-link">
                  View profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default AuthorsPage;

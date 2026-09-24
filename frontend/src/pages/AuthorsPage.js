import { useEffect, useState } from 'react';
import Seo, { SITE_NAME, SITE_URL, breadcrumbSchema } from '../components/Seo';
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
      <Seo
        title={`Our Authors | ${SITE_NAME}`}
        description={`Meet the editors, correspondents and reporters behind ${SITE_NAME}.`}
        path="/authors"
        jsonLd={[
          breadcrumbSchema([
            { name: 'Home', url: `${SITE_URL}/` },
            { name: 'Authors', url: `${SITE_URL}/authors` },
          ]),
        ]}
      />

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

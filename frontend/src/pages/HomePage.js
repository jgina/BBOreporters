import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../services/categoryService';
import { fetchPosts } from '../services/postService';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import LoadingSkeleton from '../components/LoadingSkeleton';

const preferredCategories = ['politics', 'business', 'sports', 'entertainment', 'health', 'education'];

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchPosts({ limit: 18, status: 'published' })])
      .then(([categoriesRes, postsRes]) => {
        setCategories(categoriesRes.data);
        setPosts(postsRes.data.posts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const topStory = posts[0];
  const latest = posts.slice(1, 7);
  const trending = posts.slice(1, 5);
  const topStories = posts.slice(1, 4);
  const visualLead = posts[4];
  const visualGallery = posts.slice(5, 9);
  const editorsPicks = posts.slice(9, 13);
  const spotlightStories = posts.slice(13, 17);
  const featureStack = posts.slice(17, 21);
  const opinionLead = posts[21];
  const opinionStories = posts.slice(22, 26);
  const mostReadStories = [...posts].slice(0, 5);
  const photoDeskStories = posts.slice(26, 30);
  const categorySections = preferredCategories.map((slug) => {
    const category = categories.find((cat) => cat.slug === slug);
    const items = posts.filter((post) => post.category?.slug === slug).slice(0, 3);
    return { category, items };
  });

  return (
    <section className="page-content container-lg">
      <Helmet>
        <title>BBOreporters | Breaking News & Local Coverage</title>
        <meta name="description" content="Stay updated with breaking news, politics, business, sports, entertainment, health, and education coverage." />
      </Helmet>
      <div className="hero-grid">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <article className="hero-card featured-card">
              {topStory ? (
                <>
                  <img src={topStory.image} alt={topStory.title} loading="lazy" />
                  <div className="hero-copy">
                    <span className="eyebrow">Breaking News</span>
                    <h1>{topStory.title}</h1>
                    <p>{topStory.excerpt}</p>
                  </div>
                </>
              ) : (
                <div className="hero-copy">
                  <h1>Real-time headlines from across the region.</h1>
                  <p>Explore the latest stories in politics, business, sports, entertainment, health, and education.</p>
                </div>
              )}
            </article>
            <section className="latest-updates">
              <div className="section-heading">
                <h2>Latest News</h2>
                <p>Fresh updates published in real time.</p>
              </div>
              <div className="latest-grid">
                {latest.map((post) => (
                  <NewsCard key={post._id} post={post} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {!loading && (
        <>
          <section className="front-section top-stories-section">
            <div className="section-heading">
              <h2>Top Stories</h2>
              <p>The stories setting the tone across politics, culture, money, and public life.</p>
            </div>
            <div className="top-stories-grid">
              {topStories.map((post, index) => (
                <article key={post._id} className={`top-story-card top-story-${index + 1}`}>
                  <Link to={`/post/${post.slug}`} className="top-story-image">
                    <img src={post.image} alt={post.title} loading="lazy" />
                  </Link>
                  <div className="top-story-content">
                    <span className="story-kicker">Headline Focus</span>
                    <h3>
                      <Link to={`/post/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt || stripHtml(post.content).slice(0, 125) + '...'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="front-section visual-showcase">
            <div className="visual-lead-card">
              {visualLead ? (
                <>
                  <Link to={`/post/${visualLead.slug}`} className="visual-lead-image">
                    <img src={visualLead.image} alt={visualLead.title} loading="lazy" />
                  </Link>
                  <div className="visual-lead-copy">
                    <span className="visual-label">Photo Story</span>
                    <h2>
                      <Link to={`/post/${visualLead.slug}`}>{visualLead.title}</Link>
                    </h2>
                    <p>{visualLead.excerpt || stripHtml(visualLead.content).slice(0, 180) + '...'}</p>
                  </div>
                </>
              ) : (
                <div className="visual-lead-copy">
                  <span className="visual-label">Photo Story</span>
                  <h2>Powerful visuals and big stories from every beat.</h2>
                  <p>Follow the images behind politics, sport, entertainment, health, and the economy.</p>
                </div>
              )}
            </div>
            <div className="visual-gallery-grid">
              {visualGallery.map((post) => (
                <Link key={post._id} to={`/post/${post.slug}`} className="visual-gallery-card">
                  <img src={post.image} alt={post.title} loading="lazy" />
                  <div className="visual-gallery-copy">
                    <span>{post.category?.name || 'Feature'}</span>
                    <h3>{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="content-grid">
        <div className="news-columns">
          {categorySections.map(({ category, items }, index) => (
            <section key={category?.slug || preferredCategories[index]} className="category-block">
              <div className="section-heading">
                <h3>{category?.name || slugToTitle(category?.slug)}</h3>
                <p>Top stories in {category?.name || 'this beat'}.</p>
              </div>
              <div className="category-grid">
                {items.map((post) => (
                  <NewsCard key={post._id} post={post} />
                ))}
                {!items.length && <p className="empty-state">No published articles yet.</p>}
              </div>
            </section>
          ))}
        </div>
        <Sidebar
          trending={trending}
          sponsored={[
            { label: 'TechSmart', description: 'AI-driven insights for modern readers.' },
            { label: 'Travel Plus', description: 'Curated journeys and lifestyle guides.' },
          ]}
        />
      </div>

      {!loading && (
        <>
          <section className="front-section editors-section">
            <div className="section-heading">
              <h2>Editors' Picks</h2>
              <p>A curated mix of analysis, deep reporting, and stories worth staying with.</p>
            </div>
            <div className="editors-grid">
              {editorsPicks.map((post) => (
                <article key={post._id} className="editor-pick-card">
                  <Link to={`/post/${post.slug}`} className="editor-pick-image">
                    <img src={post.image} alt={post.title} loading="lazy" />
                  </Link>
                  <div className="editor-pick-body">
                    <span className="news-card-category">{post.category?.name || 'Editors'}</span>
                    <h3>
                      <Link to={`/post/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt || stripHtml(post.content).slice(0, 140) + '...'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="front-section spotlight-section">
            <div className="spotlight-header">
              <div className="section-heading">
                <h2>Newsroom Spotlight</h2>
                <p>Fast-moving developments, visual reporting, and live-interest coverage in one flow.</p>
              </div>
              <span className="spotlight-tag">Live Desk</span>
            </div>
            <div className="spotlight-grid">
              <div className="spotlight-stack">
                {spotlightStories.map((post) => (
                  <article key={post._id} className="spotlight-story">
                    <div>
                      <span className="story-kicker">Developing</span>
                      <h3>
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p>{post.excerpt || stripHtml(post.content).slice(0, 110) + '...'}</p>
                    </div>
                    <Link to={`/post/${post.slug}`} className="spotlight-thumb">
                      <img src={post.image} alt={post.title} loading="lazy" />
                    </Link>
                  </article>
                ))}
              </div>
              <div className="feature-stack-grid">
                {featureStack.map((post, index) => (
                  <Link key={post._id} to={`/post/${post.slug}`} className={`feature-stack-card feature-stack-${index + 1}`}>
                    <img src={post.image} alt={post.title} loading="lazy" />
                    <div className="feature-stack-copy">
                      <span>{post.category?.name || 'Feature'}</span>
                      <h3>{post.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="front-section editorial-grid-section">
            <div className="opinion-panel">
              <div className="section-heading">
                <h2>Opinion</h2>
                <p>Analysis, perspective, and strong editorial angles on the stories shaping the day.</p>
              </div>
              {opinionLead ? (
                <article className="opinion-lead-card">
                  <Link to={`/post/${opinionLead.slug}`} className="opinion-lead-image">
                    <img src={opinionLead.image} alt={opinionLead.title} loading="lazy" />
                  </Link>
                  <div className="opinion-lead-body">
                    <span className="story-kicker">Editorial View</span>
                    <h3>
                      <Link to={`/post/${opinionLead.slug}`}>{opinionLead.title}</Link>
                    </h3>
                    <p>{opinionLead.excerpt || stripHtml(opinionLead.content).slice(0, 150) + '...'}</p>
                  </div>
                </article>
              ) : null}
              <div className="opinion-list">
                {opinionStories.map((post) => (
                  <article key={post._id} className="opinion-list-item">
                    <Link to={`/post/${post.slug}`} className="opinion-list-image">
                      <img src={post.image} alt={post.title} loading="lazy" />
                    </Link>
                    <div className="opinion-list-body">
                      <span className="news-card-category">{post.category?.name || 'Opinion'}</span>
                      <h3>
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p>{post.excerpt || stripHtml(post.content).slice(0, 95) + '...'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="most-read-panel">
              <div className="section-heading">
                <h2>Most Read</h2>
                <p>The stories readers are following most closely right now.</p>
              </div>
              <div className="most-read-list">
                {mostReadStories.map((post, index) => (
                  <article key={post._id} className="most-read-item">
                    <span className="most-read-rank">{String(index + 1).padStart(2, '0')}</span>
                    <Link to={`/post/${post.slug}`} className="most-read-image">
                      <img src={post.image} alt={post.title} loading="lazy" />
                    </Link>
                    <div className="most-read-body">
                      <span className="story-kicker">Readers' Choice</span>
                      <h3>
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p>{post.excerpt || stripHtml(post.content).slice(0, 88) + '...'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="front-section photo-desk-section">
            <div className="section-heading">
              <h2>Photo Desk</h2>
              <p>Big visuals, strong moments, and stories told through atmosphere, place, and movement.</p>
            </div>
            <div className="photo-desk-grid">
              {photoDeskStories.map((post, index) => (
                <Link key={post._id} to={`/post/${post.slug}`} className={`photo-desk-card photo-desk-${index + 1}`}>
                  <img src={post.image} alt={post.title} loading="lazy" />
                  <div className="photo-desk-copy">
                    <span>{post.category?.name || 'Photo Desk'}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt || stripHtml(post.content).slice(0, 110) + '...'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
};

const stripHtml = (content = '') => content.replace(/<[^>]+>/g, '');

const slugToTitle = (slug) => {
  if (!slug) return 'News';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default HomePage;

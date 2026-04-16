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
    Promise.all([fetchCategories(), fetchPosts({ limit: 54, status: 'published' })])
      .then(([categoriesRes, postsRes]) => {
        setCategories(categoriesRes.data);
        setPosts(postsRes.data.posts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const topStory = posts[0];
  const latest = getStoryWindow(posts, 1, 6);
  const trending = getStoryWindow(posts, 1, 4);
  const topStories = getStoryWindow(posts, 1, 3);
  const visualLead = getStoryWindow(posts, 4, 1)[0];
  const visualGallery = getStoryWindow(posts, 5, 4);
  const editorsPicks = getStoryWindow(posts, 9, 4);
  const spotlightStories = getStoryWindow(posts, 13, 4);
  const featureStack = getStoryWindow(posts, 17, 4);
  const opinionLead = getStoryWindow(posts, 21, 1)[0];
  const opinionStories = getStoryWindow(posts, 22, 4);
  const mostReadStories = getStoryWindow(posts, 0, 5);
  const photoDeskStories = getStoryWindow(posts, 26, 4);
  const newspaperSections = [
    { title: 'National', description: 'Major developments, politics, and public interest stories from across the country.', posts: getStoryWindow(posts, 30, 6) },
    { title: 'Around The City', description: 'Street-level reports, metro stories, investigations, and the pulse of everyday life.', posts: getStoryWindow(posts, 36, 6) },
    { title: 'Business', description: 'Markets, regulation, enterprise, banking, and the economic stories shaping decisions.', posts: getStoryWindow(posts, 42, 6) },
  ];
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
              {items.length ? (
                <div className="category-feature-layout">
                  <article className="category-lead-card">
                    <Link to={`/post/${items[0].slug}`} className="category-lead-image">
                      <img src={items[0].image} alt={items[0].title} loading="lazy" />
                    </Link>
                    <div className="category-lead-body">
                      <span className="news-card-category">{items[0].category?.name || category?.name || 'News'}</span>
                      <h3>
                        <Link to={`/post/${items[0].slug}`}>{items[0].title}</Link>
                      </h3>
                      <p>{items[0].excerpt || stripHtml(items[0].content).slice(0, 160) + '...'}</p>
                    </div>
                  </article>

                  <div className="category-side-stack">
                    {items.slice(1).map((post) => (
                      <article key={post._id} className="category-side-card">
                        <Link to={`/post/${post.slug}`} className="category-side-image">
                          <img src={post.image} alt={post.title} loading="lazy" />
                        </Link>
                        <div className="category-side-body">
                          <span className="story-kicker">Desk Update</span>
                          <h4>
                            <Link to={`/post/${post.slug}`}>{post.title}</Link>
                          </h4>
                          <p>{post.excerpt || stripHtml(post.content).slice(0, 88) + '...'}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="empty-state">No published articles yet.</p>
              )}
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

          {newspaperSections.map((section) =>
            section.posts.length ? (
              <section key={section.title} className="front-section newspaper-section">
                <div className="newspaper-heading">
                  <span className="newspaper-heading-mark" />
                  <h2>{section.title}</h2>
                  <div className="newspaper-heading-line" />
                </div>
                <p className="newspaper-subtitle">{section.description}</p>
                <div className="newspaper-layout">
                  <article className="newspaper-lead-card">
                    <Link to={`/post/${section.posts[0].slug}`} className="newspaper-lead-image">
                      <img src={section.posts[0].image} alt={section.posts[0].title} loading="lazy" />
                    </Link>
                    <div className="newspaper-lead-body">
                      <span className="news-card-category">{section.posts[0].category?.name || section.title}</span>
                      <h3>
                        <Link to={`/post/${section.posts[0].slug}`}>{section.posts[0].title}</Link>
                      </h3>
                      <p>{section.posts[0].excerpt || stripHtml(section.posts[0].content).slice(0, 150) + '...'}</p>
                      <span className="meta-text">{new Date(section.posts[0].createdAt).toLocaleDateString()}</span>
                    </div>
                  </article>

                  <div className="newspaper-card-grid">
                    {section.posts.slice(1).map((post, index) => (
                      <article key={post._id} className={`newspaper-mini-card newspaper-mini-${index + 1}`}>
                        <Link to={`/post/${post.slug}`} className="newspaper-mini-image">
                          <img src={post.image} alt={post.title} loading="lazy" />
                        </Link>
                        <div className="newspaper-mini-body">
                          <h3>
                            <Link to={`/post/${post.slug}`}>{post.title}</Link>
                          </h3>
                          <span className="meta-text">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ) : null
          )}
        </>
      )}
    </section>
  );
};

const stripHtml = (content = '') => content.replace(/<[^>]+>/g, '');

const getStoryWindow = (posts, start, count) => {
  if (!posts.length || count <= 0) return [];

  return Array.from({ length: Math.min(count, posts.length) }, (_, index) => {
    const normalizedIndex = (start + index) % posts.length;
    return posts[normalizedIndex];
  });
};

const slugToTitle = (slug) => {
  if (!slug) return 'News';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default HomePage;

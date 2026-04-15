import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
    </section>
  );
};

const slugToTitle = (slug) => {
  if (!slug) return 'News';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default HomePage;

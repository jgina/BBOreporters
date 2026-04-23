import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../services/adminService';
import { fetchPosts, deletePost } from '../services/postService';
import { getSiteContent, saveSiteContent } from '../services/siteContentService';

const AdminDashboardPage = () => {
  const initialSiteContent = getSiteContent();
  const [stats, setStats] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [sponsored, setSponsored] = useState(initialSiteContent.sponsored);
  const [advertisement, setAdvertisement] = useState(initialSiteContent.advertisement);

  const loadData = useCallback(() => {
    setError('');
    Promise.all([
      fetchAdminStats(),
      fetchPosts({ limit: 10, status: 'all' }),
    ])
      .then(([statsRes, postsRes]) => {
        setStats(statsRes.data);
        setLatestPosts(postsRes.data.posts);
      })
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await deletePost(post._id);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete post.');
    }
  };

  const handleSponsoredChange = (index, field, value) => {
    setSponsored((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
    setSavedMessage('');
  };

  const handleSaveSiteContent = (event) => {
    event.preventDefault();
    saveSiteContent({ sponsored, advertisement });
    setSavedMessage('Sponsored and advertisement content updated.');
  };

  return (
    <section className="admin-dashboard container-lg">
      <div className="admin-hero">
        <div>
          <h1>Editorial Dashboard</h1>
          <p>Manage stories, categories, and publishing flow in one newsroom.</p>
        </div>
        <Link to="/admin/posts/new" className="button button-primary">
          Create New Post
        </Link>
      </div>
      {error && <p className="form-error">{error}</p>}
      {stats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalPosts}</h3>
            <p>Total posts</p>
          </div>
          <div className="stat-card">
            <h3>{stats.publishedPosts}</h3>
            <p>Published</p>
          </div>
          <div className="stat-card">
            <h3>{stats.draftPosts}</h3>
            <p>Drafts</p>
          </div>
          <div className="stat-card">
            <h3>{stats.scheduledPosts}</h3>
            <p>Scheduled</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalCategories}</h3>
            <p>Categories</p>
          </div>
        </div>
      ) : (
        !error && <p>Loading dashboard metrics…</p>
      )}
      <section className="admin-panel">
        <div className="panel-card">
          <h2>Latest stories</h2>
          <div className="admin-list">
            {latestPosts.length === 0 && !error && (
              <p className="empty-state">No posts yet. Create your first story.</p>
            )}
            {latestPosts.map((post) => (
              <div key={post._id} className="admin-list-item">
                <div>
                  <h3>{post.title}</h3>
                  <p>
                    {post.category?.name || 'Uncategorised'} &mdash;{' '}
                    <span style={{ textTransform: 'capitalize' }}>{post.status}</span> &mdash;{' '}
                    {(post.publishAt || post.createdAt) ? new Date(post.publishAt || post.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/admin/posts/${post._id}/edit`} className="button button-secondary">
                    Edit
                  </Link>
                  <button className="button button-ghost" onClick={() => handleDelete(post)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel-card quick-links">
          <h2>Editorial tools</h2>
          <Link to="/admin/categories" className="button button-secondary">
            Manage Categories
          </Link>
        </div>
        <div className="panel-card admin-sidebar-studio">
          <div className="admin-sidebar-studio-head">
            <div>
              <span className="admin-sidebar-kicker">Sidebar Studio</span>
              <h2>Sponsored & Advertisement</h2>
              <p>Edit what appears in the homepage sidebar with a cleaner, more branded presentation.</p>
            </div>
            <div className="admin-sidebar-preview-note">
              <strong>Live feel</strong>
              <span>Shape the blocks readers see beside your top stories.</span>
            </div>
          </div>
          <form className="admin-site-content-form" onSubmit={handleSaveSiteContent}>
            <div className="admin-settings-grid">
              {sponsored.map((item, index) => (
                <div key={index} className="admin-settings-card sponsor-studio-card">
                  <div className="sponsor-studio-top">
                    <span className="sponsor-studio-index">Sponsor {index + 1}</span>
                    <span className="sponsor-studio-badge">Featured</span>
                  </div>
                  <h3>Sponsored Item {index + 1}</h3>
                  <label>
                    Label
                    <input
                      type="text"
                      value={item.label}
                      onChange={(event) => handleSponsoredChange(index, 'label', event.target.value)}
                      placeholder="Sponsor name"
                    />
                  </label>
                  <label>
                    Description
                    <input
                      type="text"
                      value={item.description}
                      onChange={(event) => handleSponsoredChange(index, 'description', event.target.value)}
                      placeholder="Short sponsor description"
                    />
                  </label>
                  <div className="sponsor-studio-preview">
                    <span className="sponsor-preview-label">{item.label || 'Sponsor name'}</span>
                    <p>{item.description || 'Short sponsor description will appear here.'}</p>
                  </div>
                </div>
              ))}
              <div className="admin-settings-card ad-studio-card">
                <div className="sponsor-studio-top">
                  <span className="sponsor-studio-index">Advertisement</span>
                  <span className="sponsor-studio-badge">Promo</span>
                </div>
                <h3>Advertisement</h3>
                <label>
                  Title
                  <input
                    type="text"
                    value={advertisement.title}
                    onChange={(event) =>
                      setAdvertisement((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Advertisement title"
                  />
                </label>
                <label>
                  Description
                  <input
                    type="text"
                    value={advertisement.description}
                    onChange={(event) =>
                      setAdvertisement((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Advertisement text"
                  />
                </label>
                <div className="ad-studio-preview">
                  <span className="ad-studio-tag">{advertisement.title || 'Advertisement'}</span>
                  <p>{advertisement.description || 'Advertisement copy preview appears here.'}</p>
                </div>
              </div>
            </div>
            <div className="form-actions admin-sidebar-actions">
              <button type="submit" className="button button-primary">
                Save Sidebar Content
              </button>
              {savedMessage ? <span className="form-success">{savedMessage}</span> : null}
            </div>
          </form>
        </div>
      </section>
    </section>
  );
};

export default AdminDashboardPage;

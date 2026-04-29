import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../services/adminService';
import { fetchPosts, deletePost } from '../services/postService';
import { getSiteContent, saveSiteContent } from '../services/siteContentService';

const AdminDashboardPage = () => {
  const POSTS_PER_PAGE = 10;
  const initialSiteContent = getSiteContent();
  const [stats, setStats] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [postPages, setPostPages] = useState(1);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [sponsored, setSponsored] = useState(initialSiteContent.sponsored);
  const [advertisement, setAdvertisement] = useState(initialSiteContent.advertisement);
  const [socialLinks, setSocialLinks] = useState(initialSiteContent.socialLinks);

  const loadData = useCallback(() => {
    setError('');
    Promise.all([
      fetchAdminStats(),
      fetchPosts({ limit: POSTS_PER_PAGE, page: 1, status: 'all' }),
    ])
      .then(([statsRes, postsRes]) => {
        setStats(statsRes.data);
        setLatestPosts(postsRes.data.posts);
        setPostPage(postsRes.data?.page || 1);
        setPostPages(postsRes.data?.pages || 1);
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
    saveSiteContent({ sponsored, advertisement, socialLinks });
    setSavedMessage('Sidebar and social media content updated.');
  };

  const handleSocialLinkChange = (index, field, value) => {
    setSocialLinks((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
    setSavedMessage('');
  };

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: '', url: '' }]);
    setSavedMessage('');
  };

  const handleRemoveSocialLink = (index) => {
    setSocialLinks((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
      setSavedMessage('');
    };

  const handleLoadMorePosts = async () => {
    if (loadingMorePosts || postPage >= postPages) return;

    const nextPage = postPage + 1;
    setLoadingMorePosts(true);
    setError('');

    try {
      const response = await fetchPosts({ limit: POSTS_PER_PAGE, page: nextPage, status: 'all' });
      const incomingPosts = response.data?.posts || [];

      setLatestPosts((prev) => {
        const knownIds = new Set(prev.map((item) => item._id));
        return [...prev, ...incomingPosts.filter((item) => !knownIds.has(item._id))];
      });
      setPostPage(response.data?.page || nextPage);
      setPostPages(response.data?.pages || postPages);
    } catch {
      setError('Could not load more posts.');
    } finally {
      setLoadingMorePosts(false);
    }
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
          <div className="admin-posts-head">
            <div>
              <h2>Latest stories</h2>
              <p>Expand the list anytime to manage older posts too.</p>
            </div>
            {postPages > 1 ? (
              <span className="admin-post-count">
                Showing {latestPosts.length} of {stats?.totalPosts || latestPosts.length}
              </span>
            ) : null}
          </div>
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
          {postPage < postPages ? (
            <div className="admin-loadmore-wrap">
              <button
                type="button"
                className="button button-primary admin-loadmore-button"
                onClick={handleLoadMorePosts}
                disabled={loadingMorePosts}
              >
                {loadingMorePosts ? 'Loading more posts...' : 'Show More Posts'}
              </button>
            </div>
          ) : null}
        </div>
        <div className="panel-card quick-links">
          <h2>Editorial tools</h2>
          <Link to="/admin/categories" className="button button-secondary">
            Manage Categories
          </Link>
          <Link to="/admin/authors" className="button button-secondary">
            Manage Authors
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
        <div className="panel-card admin-social-studio">
          <div className="admin-sidebar-studio-head">
            <div>
              <span className="admin-sidebar-kicker">Social Studio</span>
              <h2>Social Media Handles</h2>
              <p>Control the live social buttons readers can click from your public pages.</p>
            </div>
            <div className="admin-sidebar-preview-note">
              <strong>Editable links</strong>
              <span>Add, update, or delete any platform directly from this dashboard.</span>
            </div>
          </div>
          <form className="admin-site-content-form" onSubmit={handleSaveSiteContent}>
            <div className="social-links-admin-grid">
              {socialLinks.map((item, index) => (
                <div key={`${item.platform}-${index}`} className="admin-settings-card social-link-card">
                  <div className="sponsor-studio-top">
                    <span className="sponsor-studio-index">Social Link {index + 1}</span>
                    <button
                      type="button"
                      className="button button-ghost social-delete-button"
                      onClick={() => handleRemoveSocialLink(index)}
                    >
                      Delete
                    </button>
                  </div>
                  <label>
                    Platform
                    <input
                      type="text"
                      value={item.platform}
                      onChange={(event) => handleSocialLinkChange(index, 'platform', event.target.value)}
                      placeholder="Facebook"
                    />
                  </label>
                  <label>
                    URL
                    <input
                      type="url"
                      value={item.url}
                      onChange={(event) => handleSocialLinkChange(index, 'url', event.target.value)}
                      placeholder="https://example.com/profile"
                    />
                  </label>
                  <div className="social-link-preview">
                    <span className="sponsor-preview-label">{item.platform || 'Platform name'}</span>
                    <p>{item.url || 'Social link preview will appear here.'}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="form-actions admin-sidebar-actions">
              <button type="button" className="button button-secondary" onClick={handleAddSocialLink}>
                Add Social Link
              </button>
              <button type="submit" className="button button-primary">
                Save Social Links
              </button>
            </div>
          </form>
        </div>
      </section>
    </section>
  );
};

export default AdminDashboardPage;

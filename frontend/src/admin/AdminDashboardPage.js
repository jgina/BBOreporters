import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../services/adminService';
import { fetchPosts, deletePost } from '../services/postService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    setError('');
    Promise.all([
      fetchAdminStats(),
      fetchPosts({ limit: 10 }),
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
                    {new Date(post.createdAt).toLocaleDateString()}
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
      </section>
    </section>
  );
};

export default AdminDashboardPage;

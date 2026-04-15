import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../services/adminService';
import { fetchPosts } from '../services/postService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);

  useEffect(() => {
    fetchAdminStats().then((res) => setStats(res.data)).catch(console.error);
    fetchPosts({ limit: 5 }).then((res) => setLatestPosts(res.data.posts)).catch(console.error);
  }, []);

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
        <p>Loading dashboard metrics…</p>
      )}
      <section className="admin-panel">
        <div className="panel-card">
          <h2>Latest stories</h2>
          <div className="admin-list">
            {latestPosts.map((post) => (
              <div key={post._id} className="admin-list-item">
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.category?.name} • {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
                <Link to={`/admin/posts/${post._id}/edit`} className="button button-secondary">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="panel-card quick-links">
          <h2>Editorial tools</h2>
          <Link to="/admin/categories" className="button button-secondary">Manage Categories</Link>
        </div>
      </section>
    </section>
  );
};

export default AdminDashboardPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(username, password);
      navigate('/admin');
    } catch ({ response }) {
      setError(response?.data?.message || 'Could not sign in');
    }
  };

  return (
    <section className="admin-login container-lg">
      <div className="auth-card">
        <h2>Admin Sign In</h2>
        <p>Access the editorial CMS, publish stories, and manage categories.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="button button-primary">Sign In</button>
        </form>
      </div>
    </section>
  );
};

export default AdminLoginPage;

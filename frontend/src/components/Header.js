import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { fetchCategories } from '../services/categoryService';
import { isAuthenticated, logout } from '../services/authService';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="site-header sticky">
      <div className="nav-top container-lg">
        <Link to="/" className="brand">
          <span className="brand-mark">BBO</span>
          <span>Reporters</span>
        </Link>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            aria-label="Search news"
            placeholder="Search headlines, stories, categories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div className="top-actions">
          <NavLink to="/admin/login" className="button button-secondary">
            Admin
          </NavLink>
          {authenticated && (
            <button className="button button-ghost" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
      <nav className="site-nav container-lg">
        {categories.map((category) => (
          <NavLink key={category._id} to={`/category/${category.slug}`}>
            {category.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;

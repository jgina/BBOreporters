import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCategories } from '../context/CategoriesContext';
import { isAuthenticated, logout } from '../services/authService';

const Header = () => {
  const { categories } = useCategories();
  const [query, setQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setMobileNavOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileNavOpen(false);
    navigate('/admin/login');
  };

  return (
    <header className="site-header sticky">
      <div className="nav-top container-lg">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="BBOReporters" className="brand-logo" />
          <span className="brand-name">BBOreporters</span>
        </Link>
        <nav id="site-nav" className={`site-nav${mobileNavOpen ? ' is-open' : ''}`}>
          {categories.map((category) => (
            <NavLink
              key={category._id}
              to={`/category/${category.slug}`}
              onClick={() => setMobileNavOpen(false)}
            >
              {category.name}
            </NavLink>
          ))}
        </nav>
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
        <button
          type="button"
          className={`mobile-menu-toggle${mobileNavOpen ? ' is-open' : ''}`}
          aria-expanded={mobileNavOpen}
          aria-controls="site-nav"
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Header;

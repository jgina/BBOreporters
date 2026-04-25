import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCategories } from '../context/CategoriesContext';
import { isAuthenticated, logout } from '../services/authService';

const Header = () => {
  const { categories } = useCategories();
  const [query, setQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

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
      <div className="header-utility">
        <div className="nav-top container-lg">
          <div className="header-date">
            <span className="header-date-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M8 3v4M16 3v4M3 9h18" />
                <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
              </svg>
            </span>
            <span>{todayLabel}</span>
          </div>

          <Link to="/" className="brand brand-sun">
            <img src="/logo.png" alt="BBOReporters" className="brand-logo" />
            <span className="brand-lockup">
              <span className="brand-name">BBOreporters</span>
              <span className="brand-tag">Voice for News</span>
            </span>
          </Link>

          <div className="header-utility-right">
            <form className="header-search-link" onSubmit={handleSearch}>
              <button type="submit" aria-label="Search news">
                <span className="header-search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-4.2-4.2" />
                  </svg>
                </span>
                <span>Search</span>
              </button>
              <input
                aria-label="Search news"
                placeholder="Search headlines, stories, categories"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
            <div className="top-actions top-actions-inline">
              {authenticated && isAdminRoute && (
                <NavLink to="/admin" className="header-top-link">
                  Admin
                </NavLink>
              )}
              {authenticated && isAdminRoute && (
                <button className="header-top-link header-top-button" onClick={handleLogout}>
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="header-nav-band">
        <div className="header-nav-inner container-lg">
          <button
            type="button"
            className={`mobile-menu-toggle header-menu-toggle${mobileNavOpen ? ' is-open' : ''}`}
            aria-expanded={mobileNavOpen}
            aria-controls="site-nav"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav id="site-nav" className={`site-nav${mobileNavOpen ? ' is-open' : ''}`}>
            <NavLink to="/" onClick={() => setMobileNavOpen(false)}>
              Home
            </NavLink>
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
        </div>
      </div>
    </header>
  );
};

export default Header;

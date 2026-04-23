import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';
import { isAuthenticated } from '../services/authService';

const Footer = () => {
  const authenticated = isAuthenticated();

  return (
    <footer className="site-footer">
      <div className="container-lg footer-grid">
        <section>
          <h3>About TheBBOreporters</h3>
          <p>
            A responsive news platform built for fast editorial publishing and immersive storytelling.
          </p>
        </section>
        <section>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search?q=politics">Search</Link></li>
            <li><Link to="/authors">Authors</Link></li>
            {authenticated ? <li><Link to="/admin">Admin</Link></li> : null}
          </ul>
        </section>
        <section>
          <h3>Contact</h3>
          <p>52 Circulat Road, Elekahia Housing Estate, Port Harcourt</p>
          <p>news@Thebboreporters.com</p>
          <p>+234 802 114 4607</p>
        </section>
        <section>
          <h3>Newsletter</h3>
          <NewsletterForm />
        </section>
      </div>
      <div className="footer-bottom container-lg">
        <span>&copy; 2026 TheBBOreporters. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer">
    <div className="container-lg footer-grid">
      <section>
        <h3>About BBOreporters</h3>
        <p>
          A responsive news platform built for fast editorial publishing and immersive storytelling.
        </p>
      </section>
      <section>
        <h3>Quick Links</h3>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/search?q=politics">Search</Link></li>
          <li><Link to="/admin/login">Admin</Link></li>
        </ul>
      </section>
      <section>
        <h3>Contact</h3>
        <p>news@bboreporters.com</p>
        <p>+234 800 000 0000</p>
      </section>
      <section>
        <h3>Newsletter</h3>
        <form className="newsletter-form">
          <input type="email" placeholder="Email address" aria-label="Newsletter email" />
          <button type="submit">Subscribe</button>
        </form>
      </section>
    </div>
    <div className="footer-bottom container-lg">
      <span>© 2026 BBOreporters. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;

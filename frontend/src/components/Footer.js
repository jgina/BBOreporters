import { Link } from 'react-router-dom';
import { FaFacebookF, FaYoutube, FaXTwitter, FaInstagram, FaTelegram } from 'react-icons/fa6';
import NewsletterForm from './NewsletterForm';
import { isAuthenticated } from '../services/authService';
import { getSiteContent } from '../services/siteContentService';
import { COOKIE_SETTINGS_EVENT } from '../services/cookieConsentService';

const socialIconMap = {
  facebook: FaFacebookF,
  youtube: FaYoutube,
  x: FaXTwitter,
  twitter: FaXTwitter,
  telegram: FaTelegram,
  instagram: FaInstagram,
};

const Footer = () => {
  const authenticated = isAuthenticated();
  const siteContent = getSiteContent();
  const socialLinks = (siteContent.socialLinks || []).filter((item) => item?.platform && item?.url);

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
            <li>
              <button
                type="button"
                className="footer-inline-button"
                onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
              >
                Cookie Settings
              </button>
            </li>
          </ul>
        </section>
        <section>
          <h3>Contact</h3>
          <p>52 Circulat Road, Elekahia Housing Estate, Port Harcourt</p>
          <p>news@Thebboreporters.com</p>
          <p>+2348103250734</p>
        </section>
        <section>
          <h3>Newsletter</h3>
          <NewsletterForm />
        </section>
        <section>
          <h3>Follow Us</h3>
          <div className="footer-socials">
            {socialLinks.map((item) => {
              const Icon = socialIconMap[item.platform.toLowerCase()] || FaInstagram;

              return (
                <a
                  key={`${item.platform}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link"
                  aria-label={item.platform}
                >
                  <span className="footer-social-icon"><Icon /></span>
                  <span>{item.platform}</span>
                </a>
              );
            })}
          </div>
        </section>
      </div>
      <div className="footer-bottom container-lg">
        <span>&copy; 2026 TheBBOreporters. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;

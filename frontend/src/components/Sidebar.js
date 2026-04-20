import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';

const Sidebar = ({ trending = [], sponsored = [] }) => (
  <aside className="sidebar-block">
    <div className="widget widget-card">
      <h4>Trending Now</h4>
      <ul>
        {trending.map((post) => (
          <li key={post._id}>
            <Link to={`/post/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
    <div className="widget widget-card">
      <h4>Sponsored</h4>
      {sponsored.map((item, index) => (
        <div key={index} className="sponsored-item">
          <span>{item.label}</span>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
    <div className="widget widget-card newsletter-card">
      <h4>Newsletter</h4>
      <p>Get the latest headlines delivered every morning.</p>
      <NewsletterForm compact />
    </div>
    <div className="widget widget-card ad-card">
      <h4>Advertisement</h4>
      <div className="ad-placeholder">Ad space available</div>
    </div>
  </aside>
);

export default Sidebar;

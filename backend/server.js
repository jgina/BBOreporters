require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authorRoutes = require('./routes/authorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const { getPostSharePage } = require('./controllers/postController');
const seo = require('./controllers/seoController');
const errorHandler = require('./middleware/errorMiddleware');

connectDB();

const app = express();
app.use(compression());
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? true
    : (process.env.CLIENT_URL || 'http://localhost:5000'),
  credentials: true,
}));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/robots.txt', seo.robotsTxt);
app.get('/sitemap.xml', seo.sitemapXml);
app.get('/news-sitemap.xml', seo.newsSitemapXml);
app.get('/rss.xml', seo.rssXml);
app.get('/share/:slug', getPostSharePage);

// API responses must stay crawlable (Googlebot fetches them to render the app) but should never be indexed.
app.use('/api', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex');
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  // index: false so "/" reaches the server-rendered home route instead of the empty index.html.
  app.use(express.static(buildPath, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.includes(`${path.sep}static${path.sep}`)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  app.get('/', seo.renderHome);
  app.get('/post/:slug', seo.renderPost);
  app.get('/category/:slug', seo.renderCategory);
  app.get('/authors', seo.renderAuthors);
  app.get('/authors/:slug', seo.renderAuthorProfile);
  app.get('/privacy-policy', seo.renderPrivacyPolicy);
  app.get(['/search', '/admin', '/admin/*'], seo.renderNoIndex);
  app.get('*', seo.renderNotFound);
}

app.use(errorHandler);

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on 0.0.0.0:${PORT}`);
});

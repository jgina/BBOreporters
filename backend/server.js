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
const uploadRoutes = require('./routes/uploadRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
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

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on 0.0.0.0:${PORT}`);
});

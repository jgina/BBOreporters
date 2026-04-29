const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinaryConfig');

const buildVisiblePostsFilter = () => ({
  $or: [
    { status: 'published' },
    { status: 'scheduled', publishAt: { $lte: new Date() } },
  ],
});

const normalisePublishState = (requestedStatus, publishAtInput) => {
  if (requestedStatus === 'scheduled') {
    const publishAt = publishAtInput ? new Date(publishAtInput) : null;
    if (!publishAt || Number.isNaN(publishAt.getTime())) {
      throw new Error('A valid publish date and time is required for scheduled posts');
    }
    return { status: 'scheduled', publishAt };
  }

  return {
    status: requestedStatus === 'published' ? 'published' : 'draft',
    publishAt: null,
  };
};

const parseArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'news-platform' },
      (error, result) => {
        if (error) {
          reject(new Error('Cloudinary upload failed'));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });

const uploadFilesToCloudinary = async (files = []) =>
  Promise.all(files.map((file) => uploadToCloudinary(file)));

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// ================= GET POSTS =================
exports.getPosts = async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const search = req.query.search || '';
  const categorySlug = req.query.category || '';
  const statusFilter = req.query.status || 'published';
  const sortOrder = req.query.sort === 'oldest' ? 'createdAt' : '-createdAt';

  const filters =
    statusFilter === 'all'
      ? {}
      : statusFilter === 'published'
      ? buildVisiblePostsFilter()
      : { status: statusFilter };

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug });
    if (category) {
      filters.category = category._id;
    }
  }

  if (search) {
    filters.$text = { $search: search };
  }

  const [total, posts] = await Promise.all([
    Post.countDocuments(filters),
    Post.find(filters)
      .select('-content')
      .populate('category', 'name slug')
      .populate('author', 'username')
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    page,
    total,
    pages: Math.ceil(total / limit),
    posts,
  });
};

// ================= GET SINGLE POST =================
exports.getPostById = async (req, res, next) => {
  const identifier = req.params.id;

  const identifierFilter = mongoose.Types.ObjectId.isValid(identifier)
    ? { $or: [{ _id: identifier }, { slug: identifier }] }
    : { slug: identifier };

  const filters = {
    $and: [buildVisiblePostsFilter(), identifierFilter],
  };

  const post = await Post.findOne(filters)
    .populate('category', 'name slug')
    .populate('author', 'username');

  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  res.json(post);
};

// ================= ADMIN GET =================
exports.getPostForAdmin = async (req, res, next) => {
  const identifier = req.params.id;

  const filters = mongoose.Types.ObjectId.isValid(identifier)
    ? { $or: [{ _id: identifier }, { slug: identifier }] }
    : { slug: identifier };

  const post = await Post.findOne(filters)
    .populate('category', 'name slug')
    .populate('author', 'username');

  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  res.json(post);
};

// ================= CREATE =================
exports.createPost = async (req, res, next) => {
  const { title, content, category, status, publishAt, sourceName } = req.body;
  const tags = parseArrayField(req.body.tags);
  const existingImages = parseArrayField(req.body.existingImages);
  const uploadedImages = await uploadFilesToCloudinary(req.files || []);
  const images = [...existingImages, ...uploadedImages].filter(Boolean);
  const image = images[0] || '';

  if (!title || !content || !image || !category) {
    res.status(400);
    return next(new Error('Title, content, image, and category are required'));
  }

  const categoryDoc =
    (await Category.findOne({ slug: category })) ||
    (await Category.findById(category).catch(() => null));

  if (!categoryDoc) {
    res.status(400);
    return next(new Error('Valid category is required'));
  }

  let publishState;
  try {
    publishState = normalisePublishState(status, publishAt);
  } catch (error) {
    res.status(400);
    return next(error);
  }

  const post = await Post.create({
    title,
    content,
    image,
    images,
    category: categoryDoc._id,
    tags,
    author: req.user._id,
    sourceName: sourceName || '',
    ...publishState,
  });

  res.status(201).json(post);
};

// ================= UPDATE =================
exports.updatePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  const { title, content, category, status, publishAt, sourceName } = req.body;
  const tags = parseArrayField(req.body.tags);
  const existingImages = parseArrayField(req.body.existingImages);
  const uploadedImages = await uploadFilesToCloudinary(req.files || []);
  const images = [...existingImages, ...uploadedImages].filter(Boolean);
  const image = images[0] || '';

  if (title) post.title = title;
  if (content) post.content = content;
  if (image) {
    post.image = image;
    post.images = images;
  }

  if (category) {
    const categoryDoc =
      (await Category.findOne({ slug: category })) ||
      (await Category.findById(category).catch(() => null));
    if (categoryDoc) post.category = categoryDoc._id;
  }

  post.tags = tags;
  if (typeof sourceName === 'string') post.sourceName = sourceName;

  if (status) {
    let publishState;
    try {
      publishState = normalisePublishState(status, publishAt);
    } catch (error) {
      res.status(400);
      return next(error);
    }
    post.status = publishState.status;
    post.publishAt = publishState.publishAt;
  }

  const updated = await post.save();
  res.json(updated);
};

// ================= DELETE =================
exports.deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  await post.deleteOne();
  res.json({ message: 'Post deleted successfully' });
};

// ================= 🔥 SHARE (SOCIAL META) =================
exports.getPostSharePage = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      $and: [buildVisiblePostsFilter(), { slug }],
    }).lean();

    if (!post) {
      return res.status(404).send('Post not found');
    }

    const siteUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
    const canonicalUrl = `${siteUrl}/post/${slug}`;
    const previewUrl = `${siteUrl}/share/${slug}`;

    const image = post.image?.startsWith('http')
      ? post.image
      : `${siteUrl}${post.image}`;

    const description =
      post.excerpt ||
      (post.content
        ? post.content.replace(/<[^>]+>/g, '').slice(0, 155)
        : '');

    const safeTitle = escapeHtml(post.title);
    const safeDescription = escapeHtml(description);
    const safeImage = escapeHtml(image);
    const safeCanonicalUrl = escapeHtml(canonicalUrl);
    const safePreviewUrl = escapeHtml(previewUrl);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${safeTitle}</title>

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="TheBBOreporters" />
        <meta property="og:url" content="${safePreviewUrl}" />
        <meta property="og:title" content="${safeTitle}" />
        <meta property="og:description" content="${safeDescription}" />
        <meta property="og:image" content="${safeImage}" />
        <meta property="og:image:secure_url" content="${safeImage}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="${safeTitle}" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${safeTitle}" />
        <meta name="twitter:description" content="${safeDescription}" />
        <meta name="twitter:image" content="${safeImage}" />
        <meta name="twitter:image:alt" content="${safeTitle}" />

        <link rel="canonical" href="${safeCanonicalUrl}" />

        <script>
          window.location.replace("${safeCanonicalUrl}");
        </script>
      </head>
      <body></body>
      </html>
    `);
  } catch (error) {
    console.error('Share meta error:', error);
    res.status(500).send('Server error');
  }
};

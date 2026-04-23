const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');

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

exports.createPost = async (req, res, next) => {
  const { title, content, image, category, tags, status, publishAt, sourceName } = req.body;
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
    category: categoryDoc._id,
    tags: tags || [],
    author: req.user._id,
    sourceName: sourceName || '',
    ...publishState,
  });

  res.status(201).json(post);
};

exports.updatePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  const { title, content, image, category, tags, status, publishAt, sourceName } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (image) post.image = image;
  if (category) {
    const categoryDoc =
      (await Category.findOne({ slug: category })) ||
      (await Category.findById(category).catch(() => null));
    if (categoryDoc) {
      post.category = categoryDoc._id;
    }
  }
  if (tags) post.tags = tags;
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

exports.deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  await post.deleteOne();
  res.json({ message: 'Post deleted successfully' });
};

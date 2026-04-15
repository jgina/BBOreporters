const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');

exports.getPosts = async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const search = req.query.search || '';
  const categorySlug = req.query.category || '';
  const statusFilter = req.query.status || 'published';
  const sortOrder = req.query.sort === 'oldest' ? 'createdAt' : '-createdAt';

  const filters = { status: statusFilter };
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug });
    if (category) {
      filters.category = category._id;
    }
  }

  if (search) {
    filters.$text = { $search: search };
  }

  const total = await Post.countDocuments(filters);
  const posts = await Post.find(filters)
    .populate('category')
    .populate('author', 'username')
    .sort(sortOrder)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    page,
    total,
    pages: Math.ceil(total / limit),
    posts,
  });
};

exports.getPostById = async (req, res, next) => {
  const identifier = req.params.id;
  const filters = mongoose.Types.ObjectId.isValid(identifier)
    ? { $or: [{ _id: identifier }, { slug: identifier }] }
    : { slug: identifier };

  const post = await Post.findOne(filters)
    .populate('category')
    .populate('author', 'username');

  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  res.json(post);
};

exports.createPost = async (req, res, next) => {
  const { title, content, image, category, tags, status } = req.body;
  if (!title || !content || !image || !category) {
    res.status(400);
    return next(new Error('Title, content, image, and category are required'));
  }

  const categoryDoc = await Category.findOne({ slug: category }) || await Category.findById(category);
  if (!categoryDoc) {
    res.status(400);
    return next(new Error('Valid category is required'));
  }

  const post = await Post.create({
    title,
    content,
    image,
    category: categoryDoc._id,
    tags: tags || [],
    author: req.user._id,
    status: status || 'draft',
  });

  res.status(201).json(post);
};

exports.updatePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  const { title, content, image, category, tags, status } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (image) post.image = image;
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category }) || await Category.findById(category);
    if (categoryDoc) {
      post.category = categoryDoc._id;
    }
  }
  if (tags) post.tags = tags;
  if (status) post.status = status;

  const updated = await post.save();
  res.json(updated);
};

exports.deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    return next(new Error('Post not found'));
  }

  await post.remove();
  res.json({ message: 'Post deleted successfully' });
};

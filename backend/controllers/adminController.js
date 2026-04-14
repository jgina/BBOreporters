const Post = require('../models/Post');
const Category = require('../models/Category');

exports.getAdminStats = async (req, res, next) => {
  const totalPosts = await Post.countDocuments();
  const publishedPosts = await Post.countDocuments({ status: 'published' });
  const draftPosts = await Post.countDocuments({ status: 'draft' });
  const totalCategories = await Category.countDocuments();

  res.json({
    totalPosts,
    publishedPosts,
    draftPosts,
    totalCategories,
  });
};

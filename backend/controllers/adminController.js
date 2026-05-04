const Post = require('../models/Post');
const Category = require('../models/Category');

exports.getAdminStats = async (req, res, next) => {
  try {
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const scheduledPosts = await Post.countDocuments({ status: 'scheduled' });
    const totalCategories = await Category.countDocuments();

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalCategories,
    });
  } catch (error) {
    next(error);
  }
};

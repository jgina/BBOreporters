const express = require('express');
const {
  getPosts,
  getPostById,
  getPostForAdmin,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getPosts);
router.get('/manage/:id', protect, adminOnly, getPostForAdmin);
router.get('/:id', getPostById);
router.post('/', protect, adminOnly, createPost);
router.put('/:id', protect, adminOnly, updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;

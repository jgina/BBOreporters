const express = require('express');
const {
  getPosts,
  getPostById,
  getPostForAdmin,
  getPostSharePage,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.get('/share/:slug', getPostSharePage);
router.get('/manage/:id', protect, adminOnly, getPostForAdmin);
router.get('/:id', getPostById);

router.post('/', protect, adminOnly, upload.array('images', 10), createPost);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;

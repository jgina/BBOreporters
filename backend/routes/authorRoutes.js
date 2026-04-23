const express = require('express');
const {
  getAuthors,
  getAuthorBySlug,
  getAuthorsForAdmin,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/authorController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAuthors);
router.get('/manage/all', protect, adminOnly, getAuthorsForAdmin);
router.get('/:slug', getAuthorBySlug);
router.post('/', protect, adminOnly, createAuthor);
router.put('/:id', protect, adminOnly, updateAuthor);
router.delete('/:id', protect, adminOnly, deleteAuthor);

module.exports = router;

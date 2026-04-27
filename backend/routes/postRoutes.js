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

// ================= POSTS =================
router.get('/', getPosts);

// 🔥 SHARE ROUTE (SOCIAL MEDIA PREVIEW)
router.get('/share/:slug', async (req, res) => {
  try {
    const Post = require('../models/Post'); // ✅ FIXED HERE (correct model import)

    const { slug } = req.params;

    const post = await Post.findOne({ slug });

    if (!post) {
      return res.status(404).send('Post not found');
    }

    const siteUrl = "https://thebboreporters.com";

    const image = post.image?.startsWith('http')
      ? post.image
      : `${siteUrl}${post.image}`;

    const description =
      post.excerpt ||
      (post.content
        ? post.content.replace(/<[^>]+>/g, '').slice(0, 150)
        : '');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>${post.title}</title>

        <meta property="og:type" content="article" />
        <meta property="og:url" content="${siteUrl}/post/${slug}" />
        <meta property="og:title" content="${post.title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:image:secure_url" content="${image}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${post.title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />

        <script>
          window.location.href = "${siteUrl}/post/${slug}";
        </script>
      </head>
      <body></body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ================= ADMIN =================
router.get('/manage/:id', protect, adminOnly, getPostForAdmin);

// IMPORTANT: keep this LAST
router.get('/:id', getPostById);

router.post('/', protect, adminOnly, createPost);
router.put('/:id', protect, adminOnly, updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;
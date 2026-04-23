const Author = require('../models/Author');
const Post = require('../models/Post');

const visiblePostsFilter = (authorName) => ({
  sourceName: authorName,
  $or: [
    { status: 'published' },
    { status: 'scheduled', publishAt: { $lte: new Date() } },
  ],
});

exports.getAuthors = async (req, res) => {
  const authors = await Author.find({ active: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.json(authors);
};

exports.getAuthorBySlug = async (req, res, next) => {
  const author = await Author.findOne({ slug: req.params.slug, active: true }).lean();

  if (!author) {
    res.status(404);
    return next(new Error('Author not found'));
  }

  const recentPosts = await Post.find(visiblePostsFilter(author.name))
    .select('-content')
    .populate('category', 'name slug')
    .sort({ publishAt: -1, createdAt: -1 })
    .limit(6)
    .lean();

  res.json({ ...author, recentPosts });
};

exports.getAuthorsForAdmin = async (req, res) => {
  const authors = await Author.find()
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.json(authors);
};

exports.createAuthor = async (req, res, next) => {
  const { name, title, summary, bio, image, displayOrder, active } = req.body;

  if (!name || !title || !image) {
    res.status(400);
    return next(new Error('Name, title, and image are required'));
  }

  const author = await Author.create({
    name,
    title,
    summary: summary || '',
    bio: bio || '',
    image,
    displayOrder: Number(displayOrder) || 0,
    active: active !== false,
  });

  res.status(201).json(author);
};

exports.updateAuthor = async (req, res, next) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    res.status(404);
    return next(new Error('Author not found'));
  }

  const { name, title, summary, bio, image, displayOrder, active } = req.body;

  if (typeof name === 'string') author.name = name;
  if (typeof title === 'string') author.title = title;
  if (typeof summary === 'string') author.summary = summary;
  if (typeof bio === 'string') author.bio = bio;
  if (typeof image === 'string' && image) author.image = image;
  if (typeof displayOrder !== 'undefined') author.displayOrder = Number(displayOrder) || 0;
  if (typeof active === 'boolean') author.active = active;

  const updated = await author.save();
  res.json(updated);
};

exports.deleteAuthor = async (req, res, next) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    res.status(404);
    return next(new Error('Author not found'));
  }

  await author.deleteOne();
  res.json({ message: 'Author deleted successfully' });
};

const Category = require('../models/Category');

exports.getCategories = async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

exports.createCategory = async (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    return next(new Error('Category name is required'));
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    res.status(400);
    return next(new Error('Category already exists'));
  }

  const category = await Category.create({ name: name.trim() });
  res.status(201).json(category);
};

exports.updateCategory = async (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    return next(new Error('Category name is required'));
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    return next(new Error('Category not found'));
  }

  category.name = name.trim();
  const updated = await category.save();
  res.json(updated);
};

exports.deleteCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    return next(new Error('Category not found'));
  }

  await category.deleteOne();
  res.json({ message: 'Category deleted successfully' });
};

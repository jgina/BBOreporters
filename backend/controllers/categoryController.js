const Category = require('../models/Category');

exports.getCategories = async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

exports.createCategory = async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    return next(new Error('Category name is required'));
  }

  const existing = await Category.findOne({ name });
  if (existing) {
    res.status(400);
    return next(new Error('Category already exists'));
  }

  const category = await Category.create({ name });
  res.status(201).json(category);
};

exports.updateCategory = async (req, res, next) => {
  const { name } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    return next(new Error('Category not found'));
  }
  if (!name) {
    res.status(400);
    return next(new Error('Category name is required'));
  }

  category.name = name;
  const updated = await category.save();
  res.json(updated);
};

exports.deleteCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    return next(new Error('Category not found'));
  }

  await category.remove();
  res.json({ message: 'Category deleted successfully' });
};

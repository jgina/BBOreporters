import { useEffect, useState } from 'react';
import { createCategory, fetchCategories, updateCategory, deleteCategory } from '../services/categoryService';
import { useCategories } from '../context/CategoriesContext';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCategories: setGlobalCategories } = useCategories();

  const loadCategories = () => {
    fetchCategories()
      .then((res) => {
        setCategories(res.data);
        setGlobalCategories(res.data);
      })
      .catch(() => setError('Failed to load categories'));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setError('');
    setLoading(true);
    try {
      await createCategory(newCategory.trim());
      setNewCategory('');
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (category) => {
    const name = prompt('Rename category', category.name);
    if (!name || !name.trim()) return;
    setError('');
    try {
      await updateCategory(category._id, name.trim());
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to rename category');
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteCategory(category._id);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete category');
    }
  };

  return (
    <section className="admin-categories container-lg">
      <div className="admin-hero">
        <div>
          <h1>Manage Categories</h1>
          <p>Create and maintain editorial beats for the newsroom.</p>
        </div>
      </div>
      <div className="category-panel">
        <form onSubmit={handleCreate} className="category-form">
          <label>
            New Category
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Politics, Business, Sports"
            />
          </label>
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add category'}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
        <div className="category-list">
          {categories.map((category) => (
            <div key={category._id} className="category-item">
              <span>{category.name}</span>
              <div className="category-actions">
                <button className="button button-secondary" onClick={() => handleUpdate(category)}>
                  Rename
                </button>
                <button className="button button-ghost" onClick={() => handleDelete(category)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminCategoryPage;

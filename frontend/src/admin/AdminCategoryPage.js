import { useEffect, useState } from 'react';
import { createCategory, fetchCategories, updateCategory, deleteCategory } from '../services/categoryService';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const loadCategories = () => {
    fetchCategories().then((res) => setCategories(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await createCategory(newCategory.trim());
      setNewCategory('');
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create category');
    }
  };

  const handleUpdate = async (category) => {
    const name = prompt('Rename category', category.name);
    if (!name) return;
    await updateCategory(category._id, name.trim());
    loadCategories();
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    await deleteCategory(category._id);
    loadCategories();
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
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Politics, Business, Sports" />
          </label>
          <button type="submit" className="button button-primary">Add category</button>
        </form>
        {error && <p className="form-error">{error}</p>}
        <div className="category-list">
          {categories.map((category) => (
            <div key={category._id} className="category-item">
              <span>{category.name}</span>
              <div className="category-actions">
                <button className="button button-secondary" onClick={() => handleUpdate(category)}>Rename</button>
                <button className="button button-ghost" onClick={() => handleDelete(category)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminCategoryPage;

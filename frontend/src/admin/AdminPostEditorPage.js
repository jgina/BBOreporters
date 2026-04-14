import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPost, updatePost, uploadImage, fetchPostBySlug } from '../services/postService';
import { fetchCategories } from '../services/categoryService';

const AdminPostEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: '', tags: '', image: '', status: 'draft' });
  const [preview, setPreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data)).catch(console.error);
    if (id) {
      setLoading(true);
      fetchPostBySlug(id)
        .then((response) => {
          const post = response.data;
          setForm({
            title: post.title,
            content: post.content,
            category: post.category.slug,
            tags: (post.tags || []).join(', '),
            image: post.image,
            status: post.status,
          });
          setPreview(post.image);
        })
        .catch((err) => setError(err?.response?.data?.message || err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleInput = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const response = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: response.data.url }));
      setPreview(response.data.url);
    } catch (err) {
      setError('Image upload failed');
    }
    setLoading(false);
  };

  const submitPost = async (publishStatus) => {
    if (!form.title || !form.content || !form.image || !form.category) {
      setError('Title, content, category and image are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        image: form.image,
        category: form.category,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        status: publishStatus,
      };
      if (id) {
        await updatePost(id, payload);
      } else {
        await createPost(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  return (
    <section className="admin-editor container-lg">
      <div className="admin-hero">
        <div>
          <h1>{id ? 'Edit Post' : 'Create Post'}</h1>
          <p>Write breaking headlines, upload images, and publish instantly.</p>
        </div>
      </div>
      <div className="editor-grid">
        <div className="editor-panel">
          <label>
            Title
            <input value={form.title} onChange={handleInput('title')} placeholder="Post headline" />
          </label>
          <label>
            Category
            <select value={form.category} onChange={handleInput('category')}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </label>
          <label>
            Tags
            <input value={form.tags} onChange={handleInput('tags')} placeholder="politics, economy, analysis" />
          </label>
          <label>
            Featured Image
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
          {preview && <img className="editor-preview" src={preview} alt="Preview" />}
          <label>
            Story content
            <ReactQuill value={form.content} onChange={(value) => setForm((prev) => ({ ...prev, content: value }))} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="button button-secondary" disabled={loading} onClick={() => submitPost('draft')}>
              Save Draft
            </button>
            <button className="button button-primary" disabled={loading} onClick={() => submitPost('published')}>
              Publish
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPostEditorPage;

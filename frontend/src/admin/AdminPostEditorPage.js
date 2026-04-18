import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPost, updatePost, uploadImage, fetchPostBySlug } from '../services/postService';
import { fetchCategories } from '../services/categoryService';

const AdminPostEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    image: '',
    status: 'draft',
  });
  const [preview, setPreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setError('Could not load categories'));

    if (id) {
      setLoading(true);
      fetchPostBySlug(id)
        .then((response) => {
          const post = response.data;
          setForm({
            title: post.title || '',
            content: post.content || '',
            category: post.category?.slug || '',
            tags: (post.tags || []).join(', '),
            image: post.image || '',
            status: post.status || 'draft',
          });
          setPreview(post.image || '');
        })
        .catch((err) => setError(err?.response?.data?.message || 'Could not load post'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleInput = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const response = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: response.data.url }));
      setPreview(response.data.url);
    } catch (err) {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const submitPost = async (publishStatus) => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.content.trim() || form.content === '<p><br></p>') { setError('Content is required'); return; }
    if (!form.image) { setError('Featured image is required'); return; }
    if (!form.category) { setError('Category is required'); return; }

    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content,
        image: form.image,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: publishStatus,
      };
      if (id) {
        await updatePost(id, payload);
      } else {
        await createPost(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <input
              value={form.title}
              onChange={handleInput('title')}
              placeholder="Post headline"
              disabled={loading}
            />
          </label>
          <label>
            Category
            <select value={form.category} onChange={handleInput('category')} disabled={loading}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tags <span style={{ fontWeight: 400, fontSize: '0.85em' }}>(comma-separated)</span>
            <input
              value={form.tags}
              onChange={handleInput('tags')}
              placeholder="politics, economy, analysis"
              disabled={loading}
            />
          </label>
          <label>
            Featured Image
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading || loading} />
          </label>
          {uploading && <p style={{ fontSize: '0.9em' }}>Uploading image…</p>}
          {preview && <img className="editor-preview" src={preview} alt="Preview" />}
          <label>
            Story content
            <ReactQuill
              value={form.content}
              onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
              readOnly={loading}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button
              className="button button-secondary"
              disabled={loading || uploading}
              onClick={() => submitPost('draft')}
            >
              {loading ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              className="button button-primary"
              disabled={loading || uploading}
              onClick={() => submitPost('published')}
            >
              {loading ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPostEditorPage;

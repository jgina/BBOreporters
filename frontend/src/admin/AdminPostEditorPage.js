import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPost, updatePost, uploadImage, fetchPostForEdit } from '../services/postService';
import { fetchCategories } from '../services/categoryService';

const emptyForm = {
  title: '',
  sourceName: '',
  content: '',
  category: '',
  tags: '',
  image: '',
  status: 'draft',
  publishAt: '',
};

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (input) => String(input).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AdminPostEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
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
      fetchPostForEdit(id)
        .then((response) => {
          const post = response.data;
          setForm({
            title: post.title || '',
            sourceName: post.sourceName || '',
            content: post.content || '',
            category: post.category?.slug || '',
            tags: (post.tags || []).join(', '),
            image: post.image || '',
            status: post.status || 'draft',
            publishAt: toDateTimeLocal(post.publishAt),
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
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const submitPost = async (publishStatus) => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.sourceName.trim()) {
      setError('Originating author or newsroom source is required');
      return;
    }
    if (!form.content.trim() || form.content === '<p><br></p>') {
      setError('Content is required');
      return;
    }
    if (!form.image) {
      setError('Featured image is required');
      return;
    }
    if (!form.category) {
      setError('Category is required');
      return;
    }
    if (publishStatus === 'scheduled' && !form.publishAt) {
      setError('Choose the date and time you want this post to go live');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        sourceName: form.sourceName.trim(),
        content: form.content,
        image: form.image,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: publishStatus,
        publishAt: publishStatus === 'scheduled' ? new Date(form.publishAt).toISOString() : null,
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
          <p>Write breaking headlines, credit the story originator, and publish or schedule confidently.</p>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-panel">
          <div className="editor-form-grid">
            <label className="editor-field editor-field-full">
              Title
              <input
                value={form.title}
                onChange={handleInput('title')}
                placeholder="Post headline"
                disabled={loading}
              />
            </label>

            <label className="editor-field">
              News Originator / Author
              <input
                value={form.sourceName}
                onChange={handleInput('sourceName')}
                placeholder="e.g. John Okafor, Reuters, Editorial Desk"
                disabled={loading}
              />
            </label>

            <label className="editor-field">
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

            <label className="editor-field editor-field-full">
              Tags <span className="editor-field-hint">(comma-separated)</span>
              <input
                value={form.tags}
                onChange={handleInput('tags')}
                placeholder="politics, economy, analysis"
                disabled={loading}
              />
            </label>

            <label className="editor-field">
              Schedule Publish Time
              <input
                type="datetime-local"
                value={form.publishAt}
                onChange={handleInput('publishAt')}
                disabled={loading}
              />
            </label>

            <div className="editor-schedule-note">
              <strong>Scheduling tip</strong>
              <span>Use the schedule button below to publish this story automatically at the chosen time.</span>
            </div>

            <label className="editor-field editor-field-full">
              Featured Image
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading || loading} />
            </label>
          </div>

          {uploading ? <p className="editor-uploading">Uploading image...</p> : null}
          {preview ? <img className="editor-preview" src={preview} alt="Preview" /> : null}

          <label className="editor-field editor-field-full">
            Story Content
            <ReactQuill
              value={form.content}
              onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
              readOnly={loading}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="form-actions editor-actions">
            <button
              className="button button-secondary"
              disabled={loading || uploading}
              onClick={() => submitPost('draft')}
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="button button-secondary editor-schedule-button"
              disabled={loading || uploading}
              onClick={() => submitPost('scheduled')}
            >
              {loading ? 'Scheduling...' : 'Schedule Post'}
            </button>
            <button
              className="button button-primary"
              disabled={loading || uploading}
              onClick={() => submitPost('published')}
            >
              {loading ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPostEditorPage;

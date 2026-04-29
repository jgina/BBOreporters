import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPost, updatePost, fetchPostForEdit } from '../services/postService';
import { fetchCategories } from '../services/categoryService';

const emptyForm = {
  title: '',
  sourceName: '',
  content: '',
  category: '',
  tags: '',
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
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            status: post.status || 'draft',
            publishAt: toDateTimeLocal(post.publishAt),
          });
          const currentImages = post.images?.length ? post.images : post.image ? [post.image] : [];
          setExistingImages(currentImages);
        })
        .catch((err) => setError(err?.response?.data?.message || 'Could not load post'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    const nextPreviews = selectedImages.map((file) => ({
      key: `${file.name}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setImagePreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedImages]);

  const handleInput = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setError('');
    setSelectedImages((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeSelectedImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
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
    if (existingImages.length + selectedImages.length === 0) {
      setError('At least one image is required');
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
      const payload = new FormData();
      payload.append('title', form.title.trim());
      payload.append('sourceName', form.sourceName.trim());
      payload.append('content', form.content);
      payload.append('category', form.category);
      payload.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
      payload.append('status', publishStatus);
      payload.append('publishAt', publishStatus === 'scheduled' ? new Date(form.publishAt).toISOString() : '');
      payload.append('existingImages', JSON.stringify(existingImages));
      selectedImages.forEach((file) => payload.append('images', file));

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
          </div>

          <label className="editor-field editor-field-full">
            Story Content
            <ReactQuill
              value={form.content}
              onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
              readOnly={loading}
            />
          </label>

          <label className="editor-field editor-field-full">
            Article Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
              disabled={loading}
            />
            <span className="editor-field-hint">The first image will be used as the featured image.</span>
          </label>

          {(existingImages.length > 0 || imagePreviews.length > 0) ? (
            <div className="post-image-preview-stack">
              {existingImages.length > 0 ? (
                <div className="post-image-preview-group">
                  <div className="post-image-preview-heading">Current Images</div>
                  <div className="post-image-preview-grid">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} className="post-image-preview-card">
                        {index === 0 ? <span className="featured-image-badge">Featured</span> : null}
                        <img className="editor-preview gallery-preview" src={imageUrl} alt={`Existing ${index + 1}`} />
                        <button
                          type="button"
                          className="button button-ghost preview-remove-button"
                          onClick={() => removeExistingImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {imagePreviews.length > 0 ? (
                <div className="post-image-preview-group">
                  <div className="post-image-preview-heading">Selected Images</div>
                  <div className="post-image-preview-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview.key} className="post-image-preview-card">
                        {existingImages.length === 0 && index === 0 ? <span className="featured-image-badge">Featured</span> : null}
                        <img className="editor-preview gallery-preview" src={preview.url} alt={preview.name} />
                        <button
                          type="button"
                          className="button button-ghost preview-remove-button"
                          onClick={() => removeSelectedImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <div className="form-actions editor-actions">
            <button
              className="button button-secondary"
              disabled={loading}
              onClick={() => submitPost('draft')}
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="button button-secondary editor-schedule-button"
              disabled={loading}
              onClick={() => submitPost('scheduled')}
            >
              {loading ? 'Scheduling...' : 'Schedule Post'}
            </button>
            <button
              className="button button-primary"
              disabled={loading}
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

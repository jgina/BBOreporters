import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  fetchAuthorsForAdmin,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../services/authorService';
import { uploadImage } from '../services/postService';

const emptyForm = {
  name: '',
  title: '',
  summary: '',
  bio: '',
  image: '',
  displayOrder: 0,
  active: true,
};

const AdminAuthorsPage = () => {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadAuthors = useCallback(() => {
    setError('');
    fetchAuthorsForAdmin()
      .then((res) => setAuthors(res.data || []))
      .catch(() => setError('Could not load authors.'));
  }, []);

  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  const sortedAuthors = useMemo(
    () => [...authors].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name)),
    [authors]
  );

  const handleInput = (field) => (event) => {
    const value = field === 'active' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setSavedMessage('');
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

  const resetEditor = () => {
    setEditingId('');
    setForm(emptyForm);
    setPreview('');
    setSavedMessage('');
  };

  const beginEdit = (author) => {
    setEditingId(author._id);
    setForm({
      name: author.name || '',
      title: author.title || '',
      summary: author.summary || '',
      bio: author.bio || '',
      image: author.image || '',
      displayOrder: author.displayOrder || 0,
      active: author.active !== false,
    });
    setPreview(author.image || '');
    setError('');
    setSavedMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.title.trim() || !form.image) {
      setError('Name, title, and image are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        bio: form.bio,
        image: form.image,
        displayOrder: Number(form.displayOrder) || 0,
        active: Boolean(form.active),
      };

      if (editingId) {
        await updateAuthor(editingId, payload);
        setSavedMessage('Author updated successfully.');
      } else {
        await createAuthor(payload);
        setSavedMessage('Author created successfully.');
      }

      resetEditor();
      loadAuthors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save author.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (author) => {
    if (!window.confirm(`Delete "${author.name}" from the authors page?`)) return;

    try {
      await deleteAuthor(author._id);
      if (editingId === author._id) resetEditor();
      loadAuthors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete author.');
    }
  };

  return (
    <section className="admin-dashboard admin-authors-page container-lg">
      <div className="admin-hero">
        <div>
          <h1>Authors Directory</h1>
          <p>Build and maintain a newsroom directory where every profile photo and biography comes from admin only.</p>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="admin-panel authors-admin-layout">
        <div className="panel-card authors-editor-card">
          <div className="authors-editor-head">
            <div>
              <span className="admin-sidebar-kicker">Author Studio</span>
              <h2>{editingId ? 'Edit Author' : 'Create Author'}</h2>
              <p>Design author cards and profile pages from one admin-controlled editor.</p>
            </div>
          </div>

          <form className="authors-form-grid" onSubmit={handleSubmit}>
            <label className="editor-field">
              Full Name
              <input value={form.name} onChange={handleInput('name')} placeholder="Reporter name" disabled={loading} />
            </label>

            <label className="editor-field">
              Role / Title
              <input value={form.title} onChange={handleInput('title')} placeholder="Politics Editor" disabled={loading} />
            </label>

            <label className="editor-field editor-field-full">
              Short Summary
              <textarea
                value={form.summary}
                onChange={handleInput('summary')}
                placeholder="Short author intro for the authors grid"
                rows={3}
                disabled={loading}
              />
            </label>

            <label className="editor-field">
              Display Order
              <input
                type="number"
                value={form.displayOrder}
                onChange={handleInput('displayOrder')}
                placeholder="0"
                disabled={loading}
              />
            </label>

            <label className="authors-toggle-card">
              <span>Show publicly</span>
              <input type="checkbox" checked={form.active} onChange={handleInput('active')} disabled={loading} />
            </label>

            <label className="editor-field editor-field-full">
              Profile Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading || uploading} />
            </label>

            {uploading ? <p className="editor-uploading">Uploading image...</p> : null}
            {preview ? <img className="authors-preview-image" src={preview} alt="Author preview" /> : null}

            <label className="editor-field editor-field-full">
              Full Biography
              <ReactQuill value={form.bio} onChange={(value) => setForm((prev) => ({ ...prev, bio: value }))} readOnly={loading} />
            </label>

            <div className="form-actions editor-actions authors-editor-actions">
              <button type="submit" className="button button-primary" disabled={loading || uploading}>
                {loading ? 'Saving...' : editingId ? 'Update Author' : 'Create Author'}
              </button>
              <button type="button" className="button button-secondary" onClick={resetEditor} disabled={loading}>
                Clear Form
              </button>
              {savedMessage ? <span className="form-success">{savedMessage}</span> : null}
            </div>
          </form>
        </div>

        <div className="panel-card authors-list-card">
          <div className="authors-list-head">
            <span className="admin-sidebar-kicker">Directory List</span>
            <h2>Managed Authors</h2>
          </div>

          <div className="authors-admin-list">
            {sortedAuthors.length === 0 ? (
              <p className="empty-state">No authors yet. Create your first author profile.</p>
            ) : (
              sortedAuthors.map((author) => (
                <article key={author._id} className="author-admin-card">
                  <img src={author.image} alt={author.name} className="author-admin-avatar" />
                  <div className="author-admin-copy">
                    <div className="author-admin-topline">
                      <h3>{author.name}</h3>
                      <span className={`author-status-pill${author.active ? ' is-active' : ''}`}>
                        {author.active ? 'Public' : 'Hidden'}
                      </span>
                    </div>
                    <p className="author-admin-role">{author.title}</p>
                    <p className="author-admin-summary">{author.summary || 'No short summary yet.'}</p>
                    <p className="author-admin-order">Display order: {author.displayOrder || 0}</p>
                  </div>
                  <div className="author-admin-actions">
                    <button type="button" className="button button-secondary" onClick={() => beginEdit(author)}>
                      Edit
                    </button>
                    <button type="button" className="button button-ghost" onClick={() => handleDelete(author)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default AdminAuthorsPage;

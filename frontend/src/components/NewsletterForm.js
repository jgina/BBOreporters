import { useState } from 'react';
import { subscribeToNewsletter } from '../services/newsletterService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewsletterForm = ({ compact = false }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status.loading) return;

    const normalizedEmail = email.trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setStatus({ loading: false, error: 'Please enter a valid email address.', success: '' });
      return;
    }

    setStatus({ loading: true, error: '', success: '' });

    try {
      await subscribeToNewsletter(normalizedEmail);
      setStatus({ loading: false, error: '', success: 'Subscription successful. Check your inbox.' });
      setEmail('');
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.response?.data?.message || 'Subscription failed. Please try again.',
        success: '',
      });
    }
  };

  return (
    <form className={`newsletter-form ${compact ? 'newsletter-form-compact' : ''}`.trim()} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email address"
        aria-label="Newsletter email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (status.error || status.success) {
            setStatus((prev) => ({ ...prev, error: '', success: '' }));
          }
        }}
      />
      <button type="submit" disabled={status.loading}>
        {status.loading ? 'Submitting...' : 'Subscribe'}
      </button>
      {status.error ? <span className="form-error">{status.error}</span> : null}
      {status.success ? <span className="form-success">{status.success}</span> : null}
    </form>
  );
};

export default NewsletterForm;

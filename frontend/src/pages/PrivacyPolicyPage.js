import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage = () => {
  const effectiveDate = 'April 24, 2026';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'TheBBOreporters';
  const contactEmail = 'news@Thebboreporters.com';

  return (
    <section className="page-content container-lg legal-page">
      <Helmet>
        <title>Privacy Policy | TheBBOreporters</title>
        <meta
          name="description"
          content="Read the TheBBOreporters Privacy Policy to understand how personal information, cookies, analytics, and user rights are handled on this news platform."
        />
      </Helmet>

      <div className="legal-hero">
        <span className="admin-sidebar-kicker">Legal</span>
        <h1>Privacy Policy</h1>
        <p>
          Effective Date: <strong>{effectiveDate}</strong>
        </p>
        <p>
          Website: <strong>{siteUrl}</strong>
        </p>
      </div>

      <article className="legal-shell">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to our news platform. We are committed to protecting your privacy and ensuring that your personal
            information is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use,
            and protect your information when you visit our website.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <h3>a. Personal Information</h3>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Contact details, when you subscribe or contact us</li>
          </ul>
          <h3>b. Non-Personal Information</h3>
          <ul>
            <li>Browser type</li>
            <li>Device information</li>
            <li>IP address</li>
            <li>Pages visited and time spent on the site</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve our news content and services</li>
            <li>Respond to inquiries or messages</li>
            <li>Send newsletters or updates, only if you subscribe</li>
            <li>Analyze website performance and user behavior</li>
            <li>Ensure website security and prevent fraud</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Cookies and Tracking Technologies</h2>
          <p>We use cookies to enhance your browsing experience. Cookies help us:</p>
          <ul>
            <li>Understand user preferences</li>
            <li>Improve site performance</li>
            <li>Deliver relevant content</li>
          </ul>
          <p>You can disable cookies through your browser settings if you prefer.</p>
        </section>

        <section className="legal-section">
          <h2>5. Third-Party Services</h2>
          <p>We may use third-party services such as:</p>
          <ul>
            <li>Analytics tools, including traffic analysis services</li>
            <li>Advertising partners</li>
            <li>Hosting providers</li>
          </ul>
          <p>These third parties may collect information in accordance with their own privacy policies.</p>
        </section>

        <section className="legal-section">
          <h2>6. Data Protection</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of
            transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction or deletion</li>
            <li>Withdraw consent for data usage</li>
          </ul>
          <p>
            To exercise these rights, contact us at <strong>{contactEmail}</strong>.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Children&apos;s Privacy</h2>
          <p>
            Our website is not intended for children under the age of 13. We do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
            updated effective date.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <p>📧 Email: {contactEmail}</p>
          <p>🌐 Website: {siteUrl}</p>
        </section>
      </article>
    </section>
  );
};

export default PrivacyPolicyPage;

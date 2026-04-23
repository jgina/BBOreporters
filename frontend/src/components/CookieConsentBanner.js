import { useEffect, useState } from 'react';
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_SETTINGS_EVENT,
  getCookieConsent,
  saveCookieConsent,
} from '../services/cookieConsentService';

const CookieConsentBanner = () => {
  const [consent, setConsent] = useState(() => getCookieConsent());

  useEffect(() => {
    const syncConsent = (event) => {
      setConsent(event.detail ?? getCookieConsent());
    };

    const openSettings = () => {
      setConsent(null);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent);
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  if (consent) return null;

  return (
    <aside className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie preferences">
      <div className="cookie-banner-copy">
        <span className="cookie-banner-kicker">Cookies</span>
        <h3>We use cookies to improve your experience</h3>
        <p>
          Essential cookies keep the site working. Analytics cookies help us understand visits and improve the newsroom.
        </p>
      </div>
      <div className="cookie-banner-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => saveCookieConsent({ necessary: true, analytics: false })}
        >
          Necessary Only
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={() => saveCookieConsent({ necessary: true, analytics: true })}
        >
          Accept All
        </button>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  hasAnalyticsConsent,
} from '../services/cookieConsentService';

const GA_ID = process.env.REACT_APP_GA_ID;

const AnalyticsTracker = () => {
  const location = useLocation();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => hasAnalyticsConsent());

  useEffect(() => {
    const syncConsent = (event) => {
      const consent = event.detail ?? getCookieConsent();
      setAnalyticsEnabled(Boolean(consent?.analytics));
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!GA_ID) return;

    window[`ga-disable-${GA_ID}`] = !analyticsEnabled;

    if (!analyticsEnabled) return;
    if (window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.dataset.ga = 'bboreporters';
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [analyticsEnabled]);

  useEffect(() => {
    if (!GA_ID || !analyticsEnabled || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [analyticsEnabled, location]);

  return null;
};

export default AnalyticsTracker;

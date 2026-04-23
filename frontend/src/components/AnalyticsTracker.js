import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = process.env.REACT_APP_GA_ID;

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID || window.gtag) return;

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
  }, []);

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
};

export default AnalyticsTracker;

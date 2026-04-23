const COOKIE_NAME = 'bboreporters_cookie_consent';
const COOKIE_MAX_AGE_DAYS = 180;
export const COOKIE_CONSENT_EVENT = 'bboreporters-cookie-consent-change';
export const COOKIE_SETTINGS_EVENT = 'bboreporters-cookie-settings-open';

const parseCookieValue = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
};

export const getCookieConsent = () => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  return parseCookieValue(cookie.split('=').slice(1).join('='));
};

export const saveCookieConsent = (consent) => {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_MAX_AGE_DAYS);

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
};

export const clearCookieConsent = () => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: null }));
};

export const hasAnalyticsConsent = () => Boolean(getCookieConsent()?.analytics);

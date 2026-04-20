const STORAGE_KEY = 'bboreporters_site_content_v1';

const DEFAULT_CONTENT = {
  sponsored: [
    { label: 'TechSmart', description: 'AI-driven insights for modern readers.' },
    { label: 'Travel Plus', description: 'Curated journeys and lifestyle guides.' },
  ],
  advertisement: {
    title: 'Advertisement',
    description: 'Ad space available',
  },
};

export const getSiteContent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;

    const parsed = JSON.parse(raw);
    return {
      sponsored: Array.isArray(parsed?.sponsored) && parsed.sponsored.length
        ? parsed.sponsored
        : DEFAULT_CONTENT.sponsored,
      advertisement: parsed?.advertisement
        ? {
            title: parsed.advertisement.title || DEFAULT_CONTENT.advertisement.title,
            description: parsed.advertisement.description || DEFAULT_CONTENT.advertisement.description,
          }
        : DEFAULT_CONTENT.advertisement,
    };
  } catch {
    return DEFAULT_CONTENT;
  }
};

export const saveSiteContent = (content) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
};

export const getDefaultSiteContent = () => DEFAULT_CONTENT;

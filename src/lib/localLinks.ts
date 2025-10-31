const STORAGE_KEY = "local-payment-links-v1";

const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export interface StoredLink {
  id: string;
  type: string;
  country_code: string;
  provider_id: string | null;
  payload: any;
  microsite_url: string;
  payment_url: string;
  signature: string;
  status: string;
  created_at: string;
}

export const getStoredLinks = (): StoredLink[] => {
  if (!isBrowser) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored links", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

const persistLinks = (links: StoredLink[]) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (error) {
    console.error("Failed to persist links", error);
  }
};

export const saveLink = (link: StoredLink) => {
  const links = getStoredLinks();
  const existingIndex = links.findIndex((item) => item.id === link.id);
  if (existingIndex >= 0) {
    links[existingIndex] = link;
  } else {
    links.push(link);
  }
  persistLinks(links);
  return link;
};

export const findLinkById = (id: string): StoredLink | undefined => {
  return getStoredLinks().find((link) => link.id === id);
};

export const clearLinks = () => {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

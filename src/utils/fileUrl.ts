import { env } from './env';

const DEFAULT_DOCUMENT_BASE_URL = env.baseUrl ?? 'https://visa-phase2.itfuturz.in';

const stripTrailingSlash = (url?: string) => {
  if (!url) return '';
  return url.replace(/\/+$/, '');
};

const ensureLeadingSlash = (path: string) => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

const looksLikeHostOnlyPath = (value: string) => {
  return /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value);
};

const extractDomain = (url: string) => {
  try {
    const match = url.match(/https?:\/\/([^\/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

export const resolveFileUrl = (filePath?: string, baseUrl = DEFAULT_DOCUMENT_BASE_URL) => {
  if (!filePath || typeof filePath !== 'string') return null;
  const trimmed = filePath.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`;
  }

  // Check if the trimmed path already contains the live domain
  const sanitizedBase = stripTrailingSlash(baseUrl) || DEFAULT_DOCUMENT_BASE_URL;
  const baseDomain = extractDomain(sanitizedBase);
  
  if (baseDomain && trimmed.includes(baseDomain)) {
    // Path already contains the domain, return it with https prefix if needed
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    // Add https if missing
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }
    return `https://${trimmed}`;
  }

  if (looksLikeHostOnlyPath(trimmed)) {
    const normalizedHostPath = trimmed.replace(/^\/+/, '');
    return `https://${normalizedHostPath}`;
  }

  const normalizedPath = ensureLeadingSlash(trimmed.replace(/^\/+/, ''));
  return `${sanitizedBase}${normalizedPath}`;
};



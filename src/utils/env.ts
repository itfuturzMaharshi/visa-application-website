/// <reference types="vite/client" />

type Env = {
  baseUrl: string;
};

const normalizeBaseUrl = (url?: string) => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

export const env: Env = {
  baseUrl: normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL) || 'https://visa-phase2.itfuturz.in',
};


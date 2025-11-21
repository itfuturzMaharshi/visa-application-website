/// <reference types="vite/client" />

type Env = {
  baseUrl: string | undefined;
};

export const env: Env = {
  baseUrl: import.meta.env?.VITE_API_BASE_URL || undefined,
};


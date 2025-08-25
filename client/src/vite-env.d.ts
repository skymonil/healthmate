/// <reference types="vite/client" />
// src/env.d.ts
export {};

declare global {
  interface Window {
    _env_: {
      BACKEND_URL: string;
      // Add other env variables here if needed
    };
  }
}
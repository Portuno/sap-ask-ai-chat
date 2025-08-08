/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MABOT_API_URL?: string;
  readonly VITE_MABOT_USERNAME?: string;
  readonly VITE_MABOT_PASSWORD?: string;
  readonly VITE_MABOT_BOT_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

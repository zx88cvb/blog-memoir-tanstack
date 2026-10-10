export const AUTH_SECRET_PLACEHOLDER =
  'shipany-dev-secret-change-in-production';

// Isomorphic env access:
// - Public (client-visible) vars are VITE_-prefixed and read from
//   import.meta.env (statically injected into the client bundle by Vite).
// - Server-only vars (secrets) are read from process.env and resolve to ''
//   in the browser — they never reach the client bundle.
const metaEnv: Record<string, string | undefined> =
  (import.meta as any).env ?? {};
const procEnv: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

const publicEnv = (key: string) => metaEnv[key] ?? procEnv[key];

export const envConfigs: Record<string, string> = {
  // App (public)
  app_url: publicEnv('VITE_APP_URL') ?? 'http://localhost:3000',
  app_name: publicEnv('VITE_APP_NAME') ?? 'AddressGen',
  app_description: publicEnv('VITE_APP_DESCRIPTION') ?? 'AddressGen',
  app_logo: publicEnv('VITE_APP_LOGO') ?? '/logo.svg',
  // 默认主题可由公开环境变量覆盖；已保存的用户选择优先。
  default_theme: publicEnv('VITE_DEFAULT_THEME') ?? 'dark',

  // Analytics (public)
  google_analytics_id: procEnv.GOOGLE_ANALYTICS_ID ?? 'G-231WJ9Z737',

  // Synthetic address generation (server-only)
  faker_provider: procEnv.FAKER_PROVIDER ?? 'json',

  // Email - Resend
  resend_api_key: procEnv.RESEND_API_KEY ?? '',
  resend_sender_email:
    procEnv.RESEND_SENDER_EMAIL ?? procEnv.RESEND_EMAIL_FROM ?? '',

  // Storage - S3/R2
  storage_endpoint: procEnv.STORAGE_ENDPOINT ?? '',
  storage_region: procEnv.STORAGE_REGION ?? 'auto',
  storage_access_key: procEnv.STORAGE_ACCESS_KEY ?? '',
  storage_secret_key: procEnv.STORAGE_SECRET_KEY ?? '',
  storage_bucket: procEnv.STORAGE_BUCKET ?? '',
  storage_public_domain: procEnv.STORAGE_PUBLIC_DOMAIN ?? '',
  inline_image_max_kb: procEnv.INLINE_IMAGE_MAX_KB ?? '2048',

  // AI
  // OpenAI / Anthropic are admin-panel-only (like Gemini/Fal). No env fallback:
  // OPENAI_API_KEY / ANTHROPIC_API_KEY are common ambient vars, and falling back
  // to them would let the admin "Test" silently pass on the machine's own key.
  replicate_api_token: procEnv.REPLICATE_API_TOKEN ?? '',

  // Locale (public)
  locale: publicEnv('VITE_DEFAULT_LOCALE') ?? 'en',

  // redis
  redis_host: procEnv.REDIS_HOST ?? '',
  redis_port: procEnv.REDIS_PORT ?? '',
  redis_password: procEnv.REDIS_PASSWORD ?? '',
  redis_db: procEnv.REDIS_DB ?? '',
};

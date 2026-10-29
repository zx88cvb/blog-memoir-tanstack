// Isomorphic env access:
// - Public (client-visible) vars are VITE_-prefixed and read from
//   import.meta.env (statically injected into the client bundle by Vite).
// - Server-only vars (secrets) are read from process.env and resolve to ''
//   in the browser — they never reach the client bundle.
const metaEnv: Record<string, string | undefined> = import.meta.env ?? {};
const procEnv: Record<string, string | undefined> =
	typeof process !== "undefined" && process.env ? process.env : {};

const publicEnv = (key: string) => metaEnv[key] ?? procEnv[key];

export const envConfigs: Record<string, string> = {
	// App (public)
	app_url: publicEnv("VITE_APP_URL") ?? "https://haydenbi.com",
	app_name: publicEnv("VITE_APP_NAME") ?? "Hayden Bi Blog",
	app_description:
		publicEnv("VITE_APP_DESCRIPTION") ??
		"Hayden Bi 的长篇笔记、部署记录和实验合集，探索独立开发与出海产品经验。",
	app_logo: publicEnv("VITE_APP_LOGO") ?? "/logo.png",
	// 默认主题可由公开环境变量覆盖；已保存的用户选择优先。
	default_theme: publicEnv("VITE_DEFAULT_THEME") ?? "light",

	waline_server_url: publicEnv("VITE_WALINE_SERVER_URL") ?? "",
	twitter_site: publicEnv("VITE_TWITTER_SITE") ?? "@HaydenBi",
	store_public_url: publicEnv("VITE_STORE_PUBLIC_URL") ?? "",

	// Analytics (public)
	google_analytics_id: procEnv.GOOGLE_ANALYTICS_ID ?? "",

	// Email - Resend
	resend_api_key: procEnv.RESEND_API_KEY ?? "",
	resend_sender_email:
		procEnv.RESEND_SENDER_EMAIL ?? procEnv.RESEND_EMAIL_FROM ?? "",

	// Storage - S3/R2
	storage_endpoint: procEnv.STORAGE_ENDPOINT ?? "",
	storage_region: procEnv.STORAGE_REGION ?? "auto",
	storage_access_key: procEnv.STORAGE_ACCESS_KEY ?? "",
	storage_secret_key: procEnv.STORAGE_SECRET_KEY ?? "",
	storage_bucket: procEnv.STORAGE_BUCKET ?? "",
	storage_public_domain: procEnv.STORAGE_PUBLIC_DOMAIN ?? "",
	inline_image_max_kb: procEnv.INLINE_IMAGE_MAX_KB ?? "2048",

	// redis
	redis_host: procEnv.REDIS_HOST ?? "",
	redis_port: procEnv.REDIS_PORT ?? "",
	redis_password: procEnv.REDIS_PASSWORD ?? "",
	redis_db: procEnv.REDIS_DB ?? "",
};

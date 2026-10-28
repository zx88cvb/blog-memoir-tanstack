import { createServerFn } from "@tanstack/react-start";
import { envConfigs } from "@/config";

export const getAnalytics = createServerFn().handler(() => ({
	gaId: envConfigs.google_analytics_id.trim(),
}));

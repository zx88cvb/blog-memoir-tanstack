import { createFileRoute } from "@tanstack/react-router";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/manifest.webmanifest")({
	server: {
		handlers: {
			GET: () => {
				return Response.json(
					{
						id: "/",
						name: m["manifest.name"](),
						short_name: m["manifest.name"](),
						description: m["manifest.description"](),
						lang: "zh-CN",
						start_url: "/",
						scope: "/",
						display: "standalone",
						background_color: "#f4f2f0",
						theme_color: "#f4f2f0",
						icons: [
							{
								src: "/android-chrome-192x192.png",
								sizes: "192x192",
								type: "image/png",
								purpose: "maskable",
							},
							{
								src: "/android-chrome-512x512.png",
								sizes: "512x512",
								type: "image/png",
								purpose: "maskable",
							},
						],
					},
					{
						headers: {
							"Content-Type": "application/manifest+json; charset=utf-8",
						},
					},
				);
			},
		},
	},
});

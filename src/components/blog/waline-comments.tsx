import { useEffect, useRef, useState } from "react";
import { envConfigs } from "@/config";

export function WalineComments({ path }: { path: string }) {
	const container = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		if (!container.current || !envConfigs.waline_server_url) return;
		let disposed = false;
		let destroy: (() => void) | undefined;
		setFailed(false);
		void import("@waline/client")
			.then(({ init }) => {
				if (disposed || !container.current) return;
				const instance = init({
					el: container.current,
					serverURL: envConfigs.waline_server_url,
					path,
					lang: "zh-CN",
					dark: "html.dark",
					login: "disable",
					imageUploader: false,
				});
				destroy = () => instance?.destroy();
			})
			.catch(() => {
				if (!disposed) setFailed(true);
			});
		return () => {
			disposed = true;
			destroy?.();
		};
	}, [path]);
	if (!envConfigs.waline_server_url) return null;
	return (
		<section className="waline mt-12">
			<h2 className="font-serif text-lg">Comments</h2>
			{failed && (
				<output className="mt-4 block text-sm text-muted-foreground">
					评论暂时无法加载，请稍后刷新重试。
				</output>
			)}
			<div ref={container} className="mt-6" />
		</section>
	);
}

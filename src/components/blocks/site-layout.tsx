import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LocaleSelector } from "@/components/locale-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { envConfigs } from "@/config";
import { m } from "@/paraglide/messages.js";

export function SiteLayout({ children }: { children: ReactNode }) {
	return (
		<div className="isolate flex min-h-svh flex-col">
			<a
				className="fixed top-4 left-4 z-100 -translate-y-[200%] rounded-lg bg-surface p-3 focus:translate-y-0"
				href="#main-content"
			>
				{m["common.skip_content"]()}
			</a>
			<Header
				name={envConfigs.app_name}
				navigationLabel={m["common.nav.label"]()}
				menuLabel={m["common.nav.open_menu"]()}
				closeMenuLabel={m["common.nav.close_menu"]()}
				navigation={[{ label: m["common.nav.home"](), href: "/" }]}
				actions={
					<>
						<LocaleSelector />
						{/* <ThemeToggle label={m["common.theme.toggle"]()} /> */}
					</>
				}
			/>
			<div className="flex-1">{children}</div>
			<Footer
				name={envConfigs.app_name}
				year={new Date().getFullYear()}
				copyright={m["common.copyright"]()}
				actions={
					<>
						<ThemeToggle label={m["common.theme.toggle"]()} />
					</>
				}
				groups={[
					{
						title: m["common.footer.legal"](),
						items: [
							{ label: m["common.footer.privacy"](), href: "/privacy" },
							{ label: m["common.footer.terms"](), href: "/terms" },
							{ label: m["common.footer.about"](), href: "/about" },
						],
					},
				]}
			/>
		</div>
	);
}

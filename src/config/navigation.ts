export const primaryNavigation = [
	{ name: "Home", to: "/", icon: "home", footer: true },
	{ name: "About", to: "/about", icon: "user", footer: true },
	{ name: "Product", to: "/product", icon: "lightbulb", footer: false },
	{ name: "Friendly Links", to: "/friends", icon: "handshake", footer: true },
] as const;

export const footerNavigation = primaryNavigation.filter((item) => item.footer);

export const socialNavigation = [
	{ label: "X (Twitter)", href: "https://x.com/HaydenBi", icon: "x" },
	{ label: "Email", href: "mailto:zx88cvb@gmail.com", icon: "mail" },
	{ label: "RSS", href: "/feed.xml", icon: "rss" },
] as const;

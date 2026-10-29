import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const devAllowedHost = process.env.VITE_DEV_ALLOWED_HOST;
const marketKey = (process.env.VITE_APP_MARKET || "portugal").toLowerCase();
const indexMarkets = {
	portugal: {
		lang: "pt-PT",
		title: "Bot Telegram Volkswagen",
	},
	france: {
		lang: "fr-FR",
		title: "Bot Telegram Renault",
	},
};
const selectedIndexMarket = indexMarkets[marketKey] || indexMarkets.portugal;
const indexTitle = process.env.VITE_APP_TITLE || selectedIndexMarket.title;

const marketIndexHtml = () => ({
	name: "market-index-html",
	transformIndexHtml(html) {
		return html
			.replace(
				/<html lang="[^"]*">/,
				`<html lang="${selectedIndexMarket.lang}">`,
			)
			.replace(/<title>.*<\/title>/, `<title>${indexTitle}</title>`);
	},
});

export default defineConfig({
	build: {
		outDir: process.env.BUILD_OUTPUT_DIR || "dist",
		emptyOutDir: true,
	},
	plugins: [marketIndexHtml(), react()],
	server: devAllowedHost
		? {
				allowedHosts: [devAllowedHost],
			}
		: undefined,
});

import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

export default defineManifest({
  name: "GitHub Timestamp Revealer",
  version: packageJson.version,
  description: "Shows absolute timestamps next to GitHub relative time labels.",
  manifest_version: 3,
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  permissions: ["storage"],
  options_ui: {
    page: "src/options.html",
    open_in_tab: false,
  },
  content_scripts: [
    {
      matches: ["https://github.com/*"],
      exclude_matches: ["https://github.com/settings/*"],
      run_at: "document_idle",
      js: ["src/content.ts"],
      css: ["src/content.css"],
    },
  ],
});

import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

export default defineManifest({
  name: "GitHub Timestamp Revealer",
  version: packageJson.version,
  description: "Shows absolute timestamps next to GitHub relative time labels.",
  manifest_version: 3,
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

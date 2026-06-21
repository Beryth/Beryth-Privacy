import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Beryth Privacy",
  version: "0.1.0",
  description: "Anti-fingerprinting privacy extension.",
  permissions: ["declarativeNetRequest", "storage", "scripting"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/page-context/index.ts"],
      run_at: "document_start",
      world: "MAIN",
      all_frames: true
    }
  ],
  action: {
    default_popup: "src/ui/popup/index.html"
  },
  options_page: "src/ui/options/index.html",
  declarative_net_request: {
    rule_resources: [
      {
        id: "beryth_rules",
        enabled: true,
        path: "rules/rules.json"
      }
    ]
  }
});

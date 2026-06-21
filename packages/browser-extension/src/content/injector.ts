import { DEFAULT_CONFIG, type SiteConfig } from "../shared/config";


async function loadConfigForOrigin(): Promise<SiteConfig> {
  try {
    const stored = await chrome.storage.local.get("config");
    return { ...DEFAULT_CONFIG, ...(stored.config ?? {}) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function inject(cfg: SiteConfig): void {
  if (!cfg.enabled) return;

  const payload = {
    profile: cfg.hardwareProfiles, 
    modes: Object.fromEntries(
      Object.entries(cfg.guards).map(([key, val]) => [key, val.mode])
    ),
    enabled: cfg.enabled
  };

  const script = document.createElement("script");
  script.textContent = `
    (function() {
      // Injection de la string JSON (parfait pour ton JSON.parse de l'index.ts)
      window.__GK_CONFIG__ = ${JSON.stringify(JSON.stringify(payload))};
    })();
  `;

  const target = document.head || document.documentElement;
  if (target) {
    target.prepend(script);
    script.remove(); 
  }
}

loadConfigForOrigin().then(inject);

import { DEFAULT_PROFILE, type Profile } from "../shared/profiles";

interface SiteOverride {
  trusted?: boolean;
  modes?: Record<string, string>;
  profileId?: string;
}

interface GlobalConfig {
  enabled: boolean;
  salt: string;
  activeProfileId: string;
  modes: Record<string, string>;
  overrides: Record<string, SiteOverride>;
}

let cached: GlobalConfig | null = null;
let current: Profile = DEFAULT_PROFILE;

export function activeProfile(): Profile {
  return current;
}

async function loadConfig(): Promise<GlobalConfig> {
  if (cached) return cached;
  const stored = await chrome.storage.local.get("config");
  cached = (stored.config as GlobalConfig) ?? {
    enabled: true,
    salt: crypto.randomUUID(),
    activeProfileId: "win-chrome-cohort",
    modes: {
      navigator: "uniform",
      screen: "uniform",
      timezone: "uniform",
      clienthints: "uniform",
      plugins: "uniform",
      fonts: "uniform",
      canvas: "uniform",
      webgl: "uniform",
      audio: "uniform",
      webrtc: "block",
      storage: "off",
    },
    overrides: {},
  };
  return cached;
}

export async function resolveConfigForOrigin(origin: string) {
  const cfg = await loadConfig();
  const override = cfg.overrides[origin];

  if (override?.trusted) {
    return { enabled: false, salt: cfg.salt };
  }

  const modes = { ...cfg.modes, ...(override?.modes ?? {}) };
  current = DEFAULT_PROFILE;

  return {
    enabled: cfg.enabled,
    salt: cfg.salt,
    profile: current,
    modes,
  };
}

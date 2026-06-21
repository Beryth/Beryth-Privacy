export type GuardMode = "off" | "uniform" | "block";

export interface VectorConfig {
  mode: GuardMode;
}

export interface SiteConfig {
  enabled: boolean;
  profile: string;          
  guards: {
    navigator: VectorConfig;
    screen: VectorConfig;
    timezone: VectorConfig;
    canvas: VectorConfig;
    webgl: VectorConfig;
    audio: VectorConfig;
    fonts: VectorConfig;
    plugins: VectorConfig;
    storage: VectorConfig;
  };
}

export const DEFAULT_CONFIG: SiteConfig = {
  enabled: true,
  profile: "win-chrome-common",
  guards: {
    navigator: { mode: "uniform" },
    screen: { mode: "uniform" },
    timezone: { mode: "uniform" },
    canvas: { mode: "uniform" },
    webgl: { mode: "uniform" },
    audio: { mode: "uniform" },
    fonts: { mode: "block" },     
    plugins: { mode: "uniform" },
    storage: { mode: "off" },     
  },
};

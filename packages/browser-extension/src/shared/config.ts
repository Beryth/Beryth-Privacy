export type GuardMode = "off" | "uniform" | "block";
export type WebrtcMode = "off" | "relay" | "block";

export interface NavigatorProfile {
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  languages: string[];
  uaClientHints?: {
    brands: Array<{ brand: string; version: string }>;
    platform: string;
    platformVersion: string;
    fullVersion: string;
  };
}

export interface ScreenProfile {
  width: number;
  height: number;
  colorDepth: number;
  devicePixelRatio?: number;
}

export interface WebglProfile {
  vendor: string;
  renderer: string;
}

export interface VectorConfig {
  mode: GuardMode | WebrtcMode;
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
    webrtc: { mode: WebrtcMode }; 
    fonts: VectorConfig;
    plugins: VectorConfig;
    storage: VectorConfig;
  };
  
  hardwareProfiles?: {
    navigator: NavigatorProfile;
    screen: ScreenProfile;
    webgl: WebglProfile;
    timezone: { ianaName: string; offsetMinutes: number };
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
    webrtc: { mode: "relay" }, 
    fonts: { mode: "block" },     
    plugins: { mode: "uniform" },
    storage: { mode: "off" },     
  },
};

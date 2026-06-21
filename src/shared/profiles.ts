export interface Profile {
  id: string;
  userAgent: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  language: string;
  languages: string[];
  timezone: string;            
  timezoneOffset: number;      
  screen: { width: number; height: number; colorDepth: number };
  webgl: { vendor: string; renderer: string };
  fonts: string[];
}

export const PROFILES: Record<string, Profile> = {
  "win-chrome-common": {
    id: "win-chrome-common",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    platform: "Win32",
    hardwareConcurrency: 8,
    deviceMemory: 8,
    language: "en-US",
    languages: ["en-US", "en"],
    timezone: "America/New_York",
    timezoneOffset: 300,
    screen: { width: 1920, height: 1080, colorDepth: 24 },
    webgl: {
      vendor: "Google Inc. (Intel)",
      renderer:
        "ANGLE (Intel, Intel(R) UHD Graphics (0x00009BC4) Direct3D11 " +
        "vs_5_0 ps_5_0, D3D11)",
    },
    fonts: [
      "Arial", "Calibri", "Cambria", "Consolas", "Courier New",
      "Georgia", "Segoe UI", "Tahoma", "Times New Roman", "Verdana",
    ],
  },
};

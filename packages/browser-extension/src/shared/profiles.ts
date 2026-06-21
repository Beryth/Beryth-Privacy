export interface Profile {
  id: string;
  userAgent: string;
  acceptLanguage: string;
  secChUa: string;
  secChUaPlatform: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  timezone: string;
  timezoneOffset: number;
  languages: string[];
  language: string;
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    devicePixelRatio: number;
  };
  webgl: { vendor: string; renderer: string };
  fonts: string[];
  uaClientHints: {
    brands: { brand: string; version: string }[];
    platform: string;
    platformVersion: string;
    fullVersion: string;
  };
}

export const PROFILES: Record<string, Profile> = {
  "win-chrome-common": {
    id: "win-chrome-common",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    acceptLanguage: "en-US,en;q=0.9",
    secChUa: '"Chromium";v="149", "Not.A/Brand";v="24", "Google Chrome";v="149"',
    secChUaPlatform: '"Windows"',
    platform: "Win32",
    hardwareConcurrency: 8,
    deviceMemory: 8,
    timezone: "America/New_York",
    timezoneOffset: 300,
    languages: ["en-US", "en"],
    language: "en-US",
    screen: {
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040, 
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 1,
    },
    webgl: {
      vendor: "Google Inc. (Intel)",
      renderer:
        "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)",
    },
    fonts: [
      "Arial", "Calibri", "Cambria", "Courier New", "Georgia",
      "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana",
    ],
    uaClientHints: {
      brands: [
        { brand: "Chromium", version: "149" },
        { brand: "Not.A/Brand", version: "24" },
        { brand: "Google Chrome", version: "149" },
      ],
      platform: "Windows",
      platformVersion: "10.0.0",
      fullVersion: "149.0.0.0",
    },
  },
};

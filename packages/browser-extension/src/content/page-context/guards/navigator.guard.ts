import type { Profile } from "../../../shared/profiles";
import { patchProperty, defineNative } from "../utils/stealth";

export function applyNavigatorGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const nav = navigator as any;

  if (profile.uaClientHints && nav.userAgentData) {
    const origGetHighEntropyValues = nav.userAgentData.getHighEntropyValues;
    if (typeof origGetHighEntropyValues === "function") {
      nav.userAgentData.getHighEntropyValues = defineNative(async function (
        this: any,
        hints: string[]
      ) {
        const realValues = await origGetHighEntropyValues.call(this, hints);
        
        return {
          ...realValues,
          brands: profile.uaClientHints.brands,
          mobile: false,
          platform: profile.uaClientHints.platform,
          platformVersion: profile.uaClientHints.platformVersion,
          uaFullVersion: profile.uaClientHints.fullVersion
        };
      }, "getHighEntropyValues");
    }

    try {
      Object.defineProperty(nav.userAgentData, "brands", {
        get: defineNative(() => Object.freeze([...profile.uaClientHints.brands]), "get brands"),
        configurable: true
      });
      Object.defineProperty(nav.userAgentData, "platform", {
        get: defineNative(() => profile.uaClientHints.platform, "get platform"),
        configurable: true
      });
      Object.defineProperty(nav.userAgentData, "mobile", {
        get: defineNative(() => false, "get mobile"),
        configurable: true
      });
    } catch {}
  }

  if (mode === "block") {
    patchProperty(nav, "userAgent", () => profile.userAgent);
    patchProperty(nav, "appVersion", () => profile.userAgent.replace("Mozilla/", ""));
    patchProperty(nav, "platform", () => "Win32");
    patchProperty(nav, "language", () => "en-US");
    patchProperty(nav, "languages", () => Object.freeze(["en-US"]));
    patchProperty(nav, "hardwareConcurrency", () => 4);
    patchProperty(nav, "deviceMemory", () => 8);
    patchProperty(nav, "webdriver", () => false);
    patchProperty(nav, "maxTouchPoints", () => 0);
    patchProperty(nav, "plugins", () => Object.freeze([]));
    patchProperty(nav, "mimeTypes", () => Object.freeze([]));
    patchProperty(nav, "doNotTrack", () => null);
    return;
  }

  patchProperty(nav, "userAgent", () => profile.userAgent);
  patchProperty(nav, "appVersion", () => profile.userAgent.replace("Mozilla/", ""));
  patchProperty(nav, "platform", () => profile.platform);
  patchProperty(nav, "language", () => profile.language);
  patchProperty(nav, "languages", () => Object.freeze([...profile.languages]));
  patchProperty(nav, "hardwareConcurrency", () => profile.hardwareConcurrency);
  patchProperty(nav, "deviceMemory", () => profile.deviceMemory);
  patchProperty(nav, "webdriver", () => false);
  patchProperty(nav, "maxTouchPoints", () => 0);
  patchProperty(nav, "doNotTrack", () => null); 

  patchProperty(nav, "plugins", () => Object.freeze([]));
  patchProperty(nav, "mimeTypes", () => Object.freeze([]));

  if ("oscpu" in nav) {
    patchProperty(nav, "oscpu", () => "Windows NT 10.0; Win64; x64");
  }
}

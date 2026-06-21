import type { Profile } from "../../../shared/profiles";
import { patchProperty } from "../utils/stealth";

export function applyClientHintsGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;
  if (!("userAgentData" in navigator)) return;

  const fakeUAData = {
    brands: profile.uaClientHints.brands,
    mobile: false,
    platform: profile.uaClientHints.platform,
    getHighEntropyValues(hints: string[]) {
      const full: Record<string, unknown> = {
        architecture: "x86",
        bitness: "64",
        model: "",
        platform: profile.uaClientHints.platform,
        platformVersion: profile.uaClientHints.platformVersion,
        uaFullVersion: profile.uaClientHints.fullVersion,
        fullVersionList: profile.uaClientHints.brands,
        wow64: false,
        mobile: false,
        brands: profile.uaClientHints.brands,
      };
      const result: Record<string, unknown> = {};
      for (const h of hints) result[h] = full[h];
      return Promise.resolve(result);
    },
    toJSON() {
      return {
        brands: profile.uaClientHints.brands,
        mobile: false,
        platform: profile.uaClientHints.platform,
      };
    },
  };

  patchProperty(navigator, "userAgentData", () => fakeUAData);
}

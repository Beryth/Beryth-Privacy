import type { Profile } from "../../../shared/profiles";
import { patchProperty } from "../utils/stealth";

export function applyNavigatorGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const nav = navigator;

  if (mode === "block") {
    patchProperty(nav, "userAgent", () => profile.userAgent);
    patchProperty(nav, "platform", () => "Win32");
    patchProperty(nav, "language", () => "en-US");
    patchProperty(nav, "languages", () => Object.freeze(["en-US"]));
    patchProperty(nav, "hardwareConcurrency", () => 4);
    patchProperty(nav, "deviceMemory", () => 8);
    patchProperty(nav, "webdriver", () => false);
    patchProperty(nav, "maxTouchPoints", () => 0);
    return;
  }

  patchProperty(nav, "userAgent", () => profile.userAgent);
  patchProperty(nav, "appVersion", () =>
    profile.userAgent.replace("Mozilla/", "")
  );
  patchProperty(nav, "platform", () => profile.platform);
  patchProperty(nav, "language", () => profile.language);
  patchProperty(nav, "languages", () =>
    Object.freeze([...profile.languages])
  );
  patchProperty(nav, "hardwareConcurrency", () => profile.hardwareConcurrency);
  patchProperty(nav, "deviceMemory", () => profile.deviceMemory);
  patchProperty(nav, "webdriver", () => false);
  patchProperty(nav, "maxTouchPoints", () => 0);

  if ("oscpu" in nav) {
    patchProperty(nav, "oscpu", () => "Windows NT 10.0; Win64; x64");
  }
}

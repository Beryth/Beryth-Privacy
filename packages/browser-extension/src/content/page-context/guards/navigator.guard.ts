import type { Profile } from "../../../shared/profiles";
import { patchProperty, defineNative } from "../utils/stealth";

function makeInertPluginArray(): any {
  const out: any = [];
  Object.defineProperty(out, "item", {
    value: defineNative(function () { return null; }, "item"),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(out, "namedItem", {
    value: defineNative(function () { return null; }, "namedItem"),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(out, "refresh", {
    value: defineNative(function () { return undefined; }, "refresh"),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return Object.freeze(out);
}

function makeInertMimeTypeArray(): any {
  const out: any = [];
  Object.defineProperty(out, "item", {
    value: defineNative(function () { return null; }, "item"),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(out, "namedItem", {
    value: defineNative(function () { return null; }, "namedItem"),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return Object.freeze(out);
}

export function applyNavigatorGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const nav = navigator as any;
  const isBlock = mode === "block";

  const blockUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

  const ua = isBlock ? blockUA : profile.userAgent;
  const appVersion = ua.replace("Mozilla/", "");
  const platform = isBlock ? "Win32" : (profile.platform || "Win32");
  const language = isBlock ? "en-US" : (profile.language || "en-US");

  const languages = isBlock
    ? Object.freeze(["en-US"])
    : Object.freeze(
        Array.isArray(profile.languages) && profile.languages.length
          ? [...profile.languages]
          : [language]
      );

  const hardwareConcurrency = isBlock
    ? 4
    : (typeof profile.hardwareConcurrency === "number" && profile.hardwareConcurrency > 0
        ? profile.hardwareConcurrency
        : 4);

  const deviceMemory = isBlock
    ? 8
    : (typeof profile.deviceMemory === "number" && profile.deviceMemory > 0
        ? profile.deviceMemory
        : 8);

  const maxTouchPoints = isBlock
    ? 0
    : (typeof (profile as any).maxTouchPoints === "number" ? (profile as any).maxTouchPoints : 0);

  const pluginsArray = makeInertPluginArray();
  const mimeTypesArray = makeInertMimeTypeArray();


  patchProperty(nav, "userAgent", () => ua);
  patchProperty(nav, "appVersion", () => appVersion);
  patchProperty(nav, "platform", () => platform);
  patchProperty(nav, "language", () => language);
  patchProperty(nav, "languages", () => languages);
  patchProperty(nav, "hardwareConcurrency", () => hardwareConcurrency);
  patchProperty(nav, "deviceMemory", () => deviceMemory);
  patchProperty(nav, "webdriver", () => false);
  patchProperty(nav, "maxTouchPoints", () => maxTouchPoints);
  patchProperty(nav, "doNotTrack", () => null);
  patchProperty(nav, "plugins", () => pluginsArray);
  patchProperty(nav, "mimeTypes", () => mimeTypesArray);

  if ("oscpu" in nav) {
    patchProperty(nav, "oscpu", () => "Windows NT 10.0; Win64; x64");
  }

  if (nav.userAgentData) {
    const uad = nav.userAgentData;
    const ch = (profile as any).uaClientHints || {};

    const brands = Object.freeze(
      (Array.isArray(ch.brands) && ch.brands.length
        ? ch.brands
        : [
            { brand: "Chromium", version: "123" },
            { brand: "Not.A/Brand", version: "99" },
          ]
      ).map((b: any) => Object.freeze({ brand: b.brand, version: b.version }))
    );

    const platformCH = isBlock
      ? "Windows"
      : (ch.platform || (profile.secChUaPlatform
          ? profile.secChUaPlatform.replace(/"/g, "")
          : "Windows"));

    const mobile = isBlock ? false : (ch.mobile === true ? true : false);

    const platformVersion = isBlock ? "10.0.0" : (ch.platformVersion || "10.0.0");
    const uaFullVersion = isBlock ? "123.0.0.0" : (ch.fullVersion || "123.0.0.0");

    const fullVersionList = Object.freeze(
      brands.map((b: any) =>
        Object.freeze({
          brand: b.brand,
          version: b.brand === "Chromium" ? uaFullVersion : `${b.version}.0.0.0`,
        })
      )
    );

    try {
      Object.defineProperty(uad, "brands", {
        get: defineNative(() => brands, "get brands"),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(uad, "platform", {
        get: defineNative(() => platformCH, "get platform"),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(uad, "mobile", {
        get: defineNative(() => mobile, "get mobile"),
        enumerable: true,
        configurable: true,
      });
    } catch {}

    if (typeof uad.getHighEntropyValues === "function") {
      uad.getHighEntropyValues = defineNative(async function (
        this: any,
        hints: string[]
      ) {
        const result: Record<string, any> = {
          brands,
          mobile,
          platform: platformCH,
        };

        const want = (k: string) => Array.isArray(hints) && hints.includes(k);

        if (want("platformVersion")) result.platformVersion = platformVersion;
        if (want("uaFullVersion")) result.uaFullVersion = uaFullVersion;
        if (want("fullVersionList")) result.fullVersionList = fullVersionList;

        if (want("architecture")) result.architecture = "x86";
        if (want("bitness")) result.bitness = "64";
        if (want("model")) result.model = ""; 
        if (want("wow64")) result.wow64 = false;

        return Object.freeze(result);
      }, "getHighEntropyValues");
    }
  }
}

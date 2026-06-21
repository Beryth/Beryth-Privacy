import type { Profile } from "../../../shared/profiles";
import { defineNative } from "../utils/stealth";

export function applyFontsGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const allowed = new Set(profile.fonts.map((f) => f.toLowerCase()));

  if (typeof document.fonts?.check === "function") {
    const origCheck = document.fonts.check.bind(document.fonts);
    document.fonts.check = defineNative(function (
      font: string,
      text?: string
    ) {
      const family = extractFamily(font);
      if (family && !allowed.has(family.toLowerCase())) return false;
      return origCheck(font, text);
    },
    "check") as typeof document.fonts.check;
  }


  const ctxProto = CanvasRenderingContext2D.prototype;
  const fontDesc = Object.getOwnPropertyDescriptor(ctxProto, "font");

  if (fontDesc?.set && fontDesc.get) {
    const origSet = fontDesc.set;
    const origGet = fontDesc.get;
    Object.defineProperty(ctxProto, "font", {
      get: defineNative(function (this: CanvasRenderingContext2D) {
        return origGet.call(this);
      }, "get font"),
      set: defineNative(function (
        this: CanvasRenderingContext2D,
        value: string
      ) {
        const family = extractFamily(value);
        if (family && !allowed.has(family.toLowerCase())) {
          const fallback = value.replace(
            /[^,]+$/,
            profile.fonts[0] || "sans-serif"
          );
          origSet.call(this, fallback);
        } else {
          origSet.call(this, value);
        }
      }, "set font"),
      configurable: true,
      enumerable: true,
    });
  }
}

function extractFamily(font: string): string | null {
  const parts = font.split(/\s+/);
  const family = parts[parts.length - 1];
  return family ? family.replace(/['"]/g, "") : null;
}

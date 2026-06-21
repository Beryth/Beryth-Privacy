import type { Profile } from "../../../shared/profiles";
import { defineNative } from "../utils/stealth";

const UNMASKED_VENDOR = 0x9245;
const UNMASKED_RENDERER = 0x9246;

export function applyWebglGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const protos = [
    typeof WebGLRenderingContext !== "undefined"
      ? WebGLRenderingContext.prototype
      : null,
    typeof WebGL2RenderingContext !== "undefined"
      ? WebGL2RenderingContext.prototype
      : null,
  ].filter(Boolean) as WebGLRenderingContext[];

  for (const proto of protos) {
    const origGetParameter = proto.getParameter;
    proto.getParameter = defineNative(function (
      this: WebGLRenderingContext,
      pname: number
    ) {
      if (pname === UNMASKED_VENDOR) return profile.webgl.vendor;
      if (pname === UNMASKED_RENDERER) return profile.webgl.renderer;
      if (pname === this.VENDOR) return "WebKit";
      if (pname === this.RENDERER) return "WebKit WebGL";
      return origGetParameter.call(this, pname);
    },
    "getParameter") as typeof proto.getParameter;

    if (mode === "block") {
      const origGetExtension = proto.getExtension;
      proto.getExtension = defineNative(function (
        this: WebGLRenderingContext,
        name: string
      ) {
        if (name === "WEBGL_debug_renderer_info") return null;
        return origGetExtension.call(this, name);
      },
      "getExtension") as typeof proto.getExtension;
    }
  }
}

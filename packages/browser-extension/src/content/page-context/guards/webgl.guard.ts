import type { Profile } from "../../../shared/profiles";
import { seededRandom, ORIGIN_SEED } from "../utils/prng";
import { defineNative } from "../utils/stealth";

const UNMASKED_VENDOR = 0x9245;
const UNMASKED_RENDERER = 0x9246;

export function applyWebglGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const block = mode === "block";
  const rand = seededRandom(ORIGIN_SEED + 9999);

  const spoofVendor = profile.webgl?.vendor ?? "Google Inc. (Intel)";
  const spoofRenderer = profile.webgl?.renderer ?? "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)";

  const protos = [
    typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null,
    typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null,
  ].filter(Boolean) as (WebGLRenderingContext | WebGL2RenderingContext)[];

  for (const proto of protos) {
    
    const origGetParameter = proto.getParameter;
    proto.getParameter = defineNative(function (
      this: WebGLRenderingContext,
      pname: number
    ) {
      if (block) {
        if (pname === UNMASKED_VENDOR || pname === UNMASKED_RENDERER) return "";
      } else {
        if (pname === UNMASKED_VENDOR) return spoofVendor;
        if (pname === UNMASKED_RENDERER) return spoofRenderer;
        if (pname === 0x1f00) return "WebKit"; 
        if (pname === 0x1f01) return "WebKit WebGL"; 
      }
      return origGetParameter.call(this, pname);
    }, "getParameter") as typeof proto.getParameter;

    const origReadPixels = proto.readPixels;
    proto.readPixels = defineNative(function (
      this: WebGLRenderingContext,
      x: number,
      y: number,
      width: number,
      height: number,
      format: number,
      type: number,
      pixels: ArrayBufferView
    ) {
      origReadPixels.call(this, x, y, width, height, format, type, pixels);
      
      if (!block && pixels && (pixels as any).length) {
        const view = pixels as any;
        for (let i = 0; i < view.length; i += 4) {
          if (rand() < 0.02) {
            const delta = rand() < 0.5 ? -1 : 1;
            view[i] = Math.max(0, Math.min(255, view[i] + delta));
          }
        }
      }
    }, "readPixels") as typeof proto.readPixels;

    const origGetSupportedExtensions = proto.getSupportedExtensions;
    proto.getSupportedExtensions = defineNative(function (
      this: WebGLRenderingContext
    ) {
      const exts: string[] | null = origGetSupportedExtensions.call(this);
      if (block) return [];
      if (!exts) return exts;

      const commonExtensions = new Set([
        "ANGLE_instanced_arrays",
        "EXT_blend_minmax",
        "EXT_color_buffer_half_float",
        "EXT_float_blend",
        "EXT_texture_filter_anisotropic",
        "OES_element_index_uint",
        "OES_standard_derivatives",
        "OES_texture_float",
        "OES_texture_float_linear",
        "OES_texture_half_float",
        "OES_texture_half_float_linear",
        "OES_vertex_array_object",
        "WEBGL_color_buffer_float",
        "WEBGL_debug_renderer_info",
        "WEBGL_lose_context",
      ]);

      return exts.filter((e) => commonExtensions.has(e)).sort();
    }, "getSupportedExtensions") as typeof proto.getSupportedExtensions;

    if (block) {
      const origGetExtension = proto.getExtension;
      proto.getExtension = defineNative(function (
        this: WebGLRenderingContext,
        name: string
      ) {
        if (name === "WEBGL_debug_renderer_info") return null;
        return origGetExtension.call(this, name);
      }, "getExtension") as typeof proto.getExtension;
    }
  }
}

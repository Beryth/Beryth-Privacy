import { seededRandom, ORIGIN_SEED } from "../utils/prng";
import { defineNative } from "../utils/stealth";

export function applyCanvasGuard(mode: string): void {
  if (mode === "off") return;

  const rand = seededRandom(ORIGIN_SEED);

  function perturb(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      if (rand() < 0.02) {
        const delta = rand() < 0.5 ? -1 : 1;
        data[i] = clamp(data[i] + delta);
        data[i + 1] = clamp(data[i + 1] + delta);
        data[i + 2] = clamp(data[i + 2] + delta);
      }
    }
  }

  function clamp(v: number): number {
    return v < 0 ? 0 : v > 255 ? 255 : v;
  }

  const proto = CanvasRenderingContext2D.prototype;

  const origGetImageData = proto.getImageData;
  proto.getImageData = defineNative(function (
    this: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    ...rest: unknown[]
  ) {
    const img = origGetImageData.apply(this, [sx, sy, sw, sh, ...rest] as never);
    if (mode === "block") {
      img.data.fill(128);
    } else {
      perturb(img.data);
    }
    return img;
  },
  "getImageData") as typeof proto.getImageData;

  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = defineNative(function (
    this: HTMLCanvasElement,
    ...args: unknown[]
  ) {
    const ctx = this.getContext("2d");
    if (ctx) {
      try {
        const img = ctx.getImageData(0, 0, this.width, this.height);
        ctx.putImageData(img, 0, 0);
      } catch {
      }
    }
    return origToDataURL.apply(this, args as never);
  },
  "toDataURL") as typeof HTMLCanvasElement.prototype.toDataURL;

  const origToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = defineNative(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
    ...args: unknown[]
  ) {
    const ctx = this.getContext("2d");
    if (ctx) {
      try {
        const img = ctx.getImageData(0, 0, this.width, this.height);
        ctx.putImageData(img, 0, 0);
      } catch {
      }
    }
    return origToBlob.apply(this, [callback, ...args] as never);
  },
  "toBlob") as typeof HTMLCanvasElement.prototype.toBlob;
}

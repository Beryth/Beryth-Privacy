import { seededRandom, ORIGIN_SEED } from "../utils/prng";
import { defineNative } from "../utils/stealth";

export function applyCanvasGuard(mode: string): void {
  if (mode === "off") return;

  const block = mode === "block";
  const rand = seededRandom(ORIGIN_SEED + 1337); 

  const perturb = (data: Uint8ClampedArray) => {
    for (let i = 0; i < data.length; i += 4) {
      if (rand() < 0.02) {
        const delta = rand() < 0.5 ? -1 : 1;
        data[i] = Math.max(0, Math.min(255, data[i] + delta));
      }
    }
  };

  const proto = CanvasRenderingContext2D.prototype;

  const origGetImageData = proto.getImageData;
  proto.getImageData = defineNative(function (
    this: CanvasRenderingContext2D,
    ...args: any[]
  ) {
    const img = origGetImageData.apply(this, args as any);
    if (block) {
      img.data.fill(0); 
    } else {
      perturb(img.data);
    }
    return img;
  }, "getImageData");

  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = defineNative(function (
    this: HTMLCanvasElement,
    ...args: any[]
  ) {
    if (block) {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mП=";
    }
    try {
      const ctx = this.getContext("2d");
      if (ctx && this.width && this.height) {
        const img = origGetImageData.apply(ctx, [0, 0, this.width, this.height]);
        perturb(img.data);
        ctx.putImageData(img, 0, 0);
      }
    } catch {}
    return origToDataURL.apply(this, args as any);
  }, "toDataURL");

  const origToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = defineNative(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
    ...args: any[]
  ) {
    try {
      const ctx = this.getContext("2d");
      if (ctx && !block && this.width && this.height) {
        const img = origGetImageData.apply(ctx, [0, 0, this.width, this.height]);
        perturb(img.data);
        ctx.putImageData(img, 0, 0);
      }
    } catch {}
    return origToBlob.apply(this, [callback, ...args] as any);
  }, "toBlob");
}

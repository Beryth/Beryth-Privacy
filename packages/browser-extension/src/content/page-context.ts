(() => {
  const self = document.currentScript as HTMLScriptElement | null;
  if (!self?.dataset.ghostkit) return;

  const { profile, modules } = JSON.parse(self.dataset.ghostkit) as {
    profile: any;
    modules: Record<string, string>;
  };

  const isOn = (key: string) =>
    modules[key] && modules[key] !== "off";

  const nativeToString = Function.prototype.toString;
  const fakeFns = new WeakSet<Function>();

  const patchedToString = function (this: Function) {
    if (fakeFns.has(this)) return `function () { [native code] }`;
    return nativeToString.call(this);
  };
  fakeFns.add(patchedToString);
  Function.prototype.toString = patchedToString;

  function defineGetter(
    obj: any,
    prop: string,
    getter: () => unknown
  ): void {
    const original = Object.getOwnPropertyDescriptor(obj, prop);
    fakeFns.add(getter);
    try {
      Object.defineProperty(obj, prop, {
        get: getter,
        configurable: original?.configurable ?? true,
        enumerable: original?.enumerable ?? true,
      });
    } catch {
    }
  }

  if (isOn("navigator")) {
    defineGetter(Navigator.prototype, "platform", () => profile.platform);
    defineGetter(
      Navigator.prototype,
      "hardwareConcurrency",
      () => profile.hardwareConcurrency
    );
    defineGetter(
      Navigator.prototype,
      "deviceMemory",
      () => profile.deviceMemory
    );
    defineGetter(Navigator.prototype, "userAgent", () => profile.userAgent);
    defineGetter(Navigator.prototype, "language", () => profile.language);
    defineGetter(Navigator.prototype, "languages", () =>
      Object.freeze([...profile.languages])
    );
  }

  if (isOn("plugins")) {
    const emptyArr: any = { length: 0, item: () => null, namedItem: () => null };
    defineGetter(Navigator.prototype, "plugins", () => emptyArr);
    defineGetter(Navigator.prototype, "mimeTypes", () => emptyArr);
  }

  if (isOn("screen")) {
    defineGetter(Screen.prototype, "width", () => profile.screen.width);
    defineGetter(Screen.prototype, "height", () => profile.screen.height);
    defineGetter(Screen.prototype, "availWidth", () => profile.screen.availWidth);
    defineGetter(Screen.prototype, "availHeight", () => profile.screen.availHeight);
    defineGetter(Screen.prototype, "colorDepth", () => profile.screen.colorDepth);
    defineGetter(Screen.prototype, "pixelDepth", () => profile.screen.pixelDepth);
    defineGetter(window, "devicePixelRatio", () => profile.screen.devicePixelRatio);
  }

  if (isOn("timezone")) {
    const RealDTF = Intl.DateTimeFormat;
    const tz = profile.timezone;

    const origResolved = RealDTF.prototype.resolvedOptions;
    const patchedResolved = function (this: Intl.DateTimeFormat) {
      const opts = origResolved.call(this);
      opts.timeZone = tz;
      opts.locale = profile.language;
      return opts;
    };
    fakeFns.add(patchedResolved);
    RealDTF.prototype.resolvedOptions = patchedResolved;

    const patchedOffset = function () {
      return profile.timezoneOffset;
    };
    fakeFns.add(patchedOffset);
    Date.prototype.getTimezoneOffset = patchedOffset;
  }

  if (isOn("canvas") && modules.canvas !== "off") {
    const block = modules.canvas === "block";
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;

    const seed = hashString(location.origin + (profile.id ?? ""));

    const perturb = (data: Uint8ClampedArray) => {
      let s = seed;
      for (let i = 0; i < data.length; i += 4) {
        s = (s * 1664525 + 1013904223) >>> 0;
        if ((s & 7) === 0) {
          data[i] = data[i] ^ (s & 1);
          data[i + 1] = data[i + 1] ^ ((s >> 1) & 1);
          data[i + 2] = data[i + 2] ^ ((s >> 2) & 1);
        }
      }
    };

    const patchedToDataURL = function (this: HTMLCanvasElement, ...args: any[]) {
      if (block) return "data:image/png;base64,";
      const ctx = this.getContext("2d");
      if (ctx) {
        try {
          const img = origGetImageData.call(ctx, 0, 0, this.width, this.height);
          perturb(img.data);
          ctx.putImageData(img, 0, 0);
        } catch {
        }
      }
      return origToDataURL.apply(this, args as []);
    };
    fakeFns.add(patchedToDataURL);
    HTMLCanvasElement.prototype.toDataURL = patchedToDataURL;

    const patchedGetImageData = function (
      this: CanvasRenderingContext2D,
      ...args: any[]
    ) {
      const img = origGetImageData.apply(this, args as []);
      if (!block) perturb(img.data);
      return img;
    };
    fakeFns.add(patchedGetImageData);
    CanvasRenderingContext2D.prototype.getImageData = patchedGetImageData;
  }

  if (isOn("webgl")) {
    const block = modules.webgl === "block";
    const patchGL = (proto: any) => {
      if (!proto) return;
      const origGetParameter = proto.getParameter;
      const patched = function (this: any, param: number) {
        if (param === 37445) return block ? "" : profile.webgl.vendor;
        if (param === 37446) return block ? "" : profile.webgl.renderer;
        return origGetParameter.call(this, param);
      };
      fakeFns.add(patched);
      proto.getParameter = patched;
    };
    patchGL((window as any).WebGLRenderingContext?.prototype);
    patchGL((window as any).WebGL2RenderingContext?.prototype);
  }

  if (isOn("audio")) {
    const block = modules.audio === "block";
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AC) {
      const origGetChannelData = (window as any).AudioBuffer?.prototype
        ?.getChannelData;
      if (origGetChannelData) {
        const seed = hashString(location.origin + "audio");
        const patched = function (this: AudioBuffer, channel: number) {
          const data = origGetChannelData.call(this, channel);
          if (block) {
            data.fill(0);
            return data;
          }
          let s = seed;
          for (let i = 0; i < data.length; i += 100) {
            s = (s * 1664525 + 1013904223) >>> 0;
            data[i] += (s / 0xffffffff - 0.5) * 1e-7;
          }
          return data;
        };
        fakeFns.add(patched);
        (window as any).AudioBuffer.prototype.getChannelData = patched;
      }
    }
  }

  if (isOn("webrtc")) {
    const RealPC =
      (window as any).RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection;
    if (RealPC) {
      const Blocked = function () {
        throw new DOMException("WebRTC disabled by GhostKit", "NotAllowedError");
      } as any;
      Blocked.prototype = RealPC.prototype;
      fakeFns.add(Blocked);
      (window as any).RTCPeerConnection = Blocked;
      (window as any).webkitRTCPeerConnection = Blocked;
    }
  }

  function hashString(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
})();

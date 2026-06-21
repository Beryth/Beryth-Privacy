import { patchMethod } from "../utils/stealth";

export function applyWebrtcGuard(mode: string): void {
  if (mode === "off") return;

  const RTC =
    (window as any).RTCPeerConnection ||
    (window as any).webkitRTCPeerConnection;
  if (!RTC) return;

  if (mode === "block") {
    const blocked = function () {
      throw new DOMException(
        "RTCPeerConnection is not available",
        "NotSupportedError"
      );
    };
    (window as any).RTCPeerConnection = blocked;
    (window as any).webkitRTCPeerConnection = blocked;
    return;
  }

  const proto = RTC.prototype;

  const OrigRTC = RTC;
  const Wrapped = function (this: any, config?: RTCConfiguration) {
    const cfg: RTCConfiguration = { ...(config || {}) };
    cfg.iceTransportPolicy = "relay";
    return new OrigRTC(cfg);
  } as unknown as typeof RTCPeerConnection;

  Wrapped.prototype = OrigRTC.prototype;
  (window as any).RTCPeerConnection = Wrapped;
  (window as any).webkitRTCPeerConnection = Wrapped;

  const isRelay = (cand: string): boolean =>
    /(^|\s)typ relay(\s|$)/i.test(cand);

  patchMethod(proto, "addEventListener", (orig) =>
    function (this: any, type: string, listener: any, opts?: any) {
      if (type === "icecandidate" && typeof listener === "function") {
const wrapped = function (this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) {
  return listener.call(this, ev);
};
        return orig.call(this, type, wrapped, opts);
      }
      return orig.call(this, type, listener, opts);
    }
  );
}

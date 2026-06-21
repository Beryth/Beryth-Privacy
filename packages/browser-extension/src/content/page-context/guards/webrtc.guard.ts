import { defineNative } from "../utils/stealth";

export function applyWebrtcGuard(mode: string): void {
  if (mode === "off") return;
  if (typeof RTCPeerConnection === "undefined") return;

  if (mode === "block") {
    const noop = defineNative(function () {
      throw new DOMException("WebRTC disabled by Beryth Privacy", "NotAllowedError");
    }, "RTCPeerConnection");

    try {
      (window as any).RTCPeerConnection = noop;
      (window as any).webkitRTCPeerConnection = noop;
      (window as any).RTCDataChannel = noop;
    } catch {}
    return;
  }

  const OrigRTC = RTCPeerConnection;

  function filterCandidate(sdp: string): string {
    return sdp
      .split("\r\n")
      .filter((line) => {
        if (!line.startsWith("a=candidate:")) return true;
        return line.includes("typ relay");
      })
      .join("\r\n");
  }

  const Patched = defineNative(function (this: any, config?: RTCConfiguration) {
    const forcedConfig: RTCConfiguration = {
      ...(config || {}),
      iceTransportPolicy: "relay",
    };
    
    const pc = new OrigRTC(forcedConfig);
    wrapSetLocalDescription(pc);
    return pc;
  }, "RTCPeerConnection") as any;

  function wrapSetLocalDescription(pc: RTCPeerConnection): void {
    const origSet = pc.setLocalDescription.bind(pc);
    pc.setLocalDescription = defineNative(async function (
      this: RTCPeerConnection,
      desc?: RTCLocalSessionDescriptionInit
    ) {
      if (desc?.sdp) {
        desc = { ...desc, sdp: filterCandidate(desc.sdp) };
      }
      return origSet(desc as RTCLocalSessionDescriptionInit);
    }, "setLocalDescription") as typeof pc.setLocalDescription;
  }

  Patched.prototype = OrigRTC.prototype;
  
  (window as any).RTCPeerConnection = Patched;
  (window as any).webkitRTCPeerConnection = Patched;
}

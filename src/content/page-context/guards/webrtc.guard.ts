import { defineNative } from "../utils/stealth";

export function applyWebrtcGuard(mode: string): void {
  if (mode === "off") return;
  if (typeof RTCPeerConnection === "undefined") return;

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

  const Patched = function (this: unknown, config?: RTCConfiguration) {
    if (mode === "block") {
      const forced: RTCConfiguration = {
        ...(config || {}),
        iceTransportPolicy: "relay",
      };
      const pc = new OrigRTC(forced);
      wrapSetLocalDescription(pc);
      return pc;
    }
    const pc = new OrigRTC(config);
    wrapSetLocalDescription(pc);
    return pc;
  } as unknown as typeof RTCPeerConnection;

  function wrapSetLocalDescription(pc: RTCPeerConnection): void {
    const origSet = pc.setLocalDescription.bind(pc);
    pc.setLocalDescription = defineNative(async function (
      desc?: RTCLocalSessionDescriptionInit
    ) {
      if (desc?.sdp) {
        desc = { ...desc, sdp: filterCandidate(desc.sdp) };
      }
      return origSet(desc as RTCLocalSessionDescriptionInit);
    },
    "setLocalDescription") as typeof pc.setLocalDescription;
  }

  Patched.prototype = OrigRTC.prototype;
  (window as unknown as { RTCPeerConnection: unknown }).RTCPeerConnection =
    Patched;
  (window as unknown as { webkitRTCPeerConnection: unknown })
    .webkitRTCPeerConnection = Patched;
}

import { ORIGIN_SEED, seededRandom } from "../utils/prng";
import { patchMethod } from "../utils/stealth";

export function applyAudioGuard(mode: string): void {
  if (mode === "off") return;

  const rnd = seededRandom(ORIGIN_SEED ^ 0x4155_4449);

  const noise = (): number => (rnd() - 0.5) * 1e-7;

  const AnalyserProto =
    typeof AnalyserNode !== "undefined" ? AnalyserNode.prototype : null;

  if (AnalyserProto) {
    patchMethod(AnalyserProto, "getFloatFrequencyData", (orig) =>
      function (this: AnalyserNode, array: Float32Array) {
        orig.call(this, array);
        for (let i = 0; i < array.length; i++) array[i] += noise();
      }
    );

    patchMethod(AnalyserProto, "getByteFrequencyData", (orig) =>
      function (this: AnalyserNode, array: Uint8Array) {
        orig.call(this, array);
        for (let i = 0; i < array.length; i++) {
          const v = array[i] + (rnd() < 0.5 ? 0 : 1);
          array[i] = v > 255 ? 255 : v;
        }
      }
    );
  }

  if (typeof AudioBuffer !== "undefined") {
    patchMethod(AudioBuffer.prototype, "getChannelData", (orig) =>
      function (this: AudioBuffer, channel: number) {
        const data = orig.call(this, channel) as Float32Array;
        for (let i = 0; i < data.length; i += 97) data[i] += noise();
        return data;
      }
    );

    patchMethod(AudioBuffer.prototype, "copyFromChannel", (orig) =>
      function (
        this: AudioBuffer,
        dest: Float32Array,
        channel: number,
        start?: number
      ) {
        orig.call(this, dest, channel, start);
        for (let i = 0; i < dest.length; i += 97) dest[i] += noise();
      }
    );
  }
}

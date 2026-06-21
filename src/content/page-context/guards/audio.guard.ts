import { seededRandom, ORIGIN_SEED } from "../utils/prng";
import { defineNative } from "../utils/stealth";

export function applyAudioGuard(mode: string): void {
  if (mode === "off") return;
  if (typeof AnalyserNode === "undefined") return;

  const rand = seededRandom(ORIGIN_SEED ^ 0xa0d10);

  const origGetFloat = AnalyserNode.prototype.getFloatFrequencyData;
  AnalyserNode.prototype.getFloatFrequencyData = defineNative(function (
    this: AnalyserNode,
    array: Float32Array
  ) {
    origGetFloat.call(this, array);
    for (let i = 0; i < array.length; i++) {
      array[i] += (rand() - 0.5) * 0.0001;
    }
  },
  "getFloatFrequencyData") as typeof origGetFloat;

  const origGetChannel = AudioBuffer.prototype.getChannelData;
  AudioBuffer.prototype.getChannelData = defineNative(function (
    this: AudioBuffer,
    channel: number
  ) {
    const data = origGetChannel.call(this, channel);
    if (mode === "block") return data; 
    for (let i = 0; i < data.length; i += 100) {
      data[i] += (rand() - 0.5) * 1e-7;
    }
    return data;
  },
  "getChannelData") as typeof origGetChannel;
}

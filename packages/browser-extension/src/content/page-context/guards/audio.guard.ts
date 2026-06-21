import { seededRandom, ORIGIN_SEED } from "../utils/prng";
import { defineNative } from "../utils/stealth";

export function applyAudioGuard(mode: string): void {
  if (mode === "off") return;

  const block = mode === "block";
  const rand = seededRandom(ORIGIN_SEED ^ 0xa0d10);

  const noise = () => (rand() - 0.5) * 1e-7;

  if (typeof AnalyserNode !== "undefined") {
    const origGetFloat = AnalyserNode.prototype.getFloatFrequencyData;
    AnalyserNode.prototype.getFloatFrequencyData = defineNative(function (
      this: AnalyserNode,
      array: Float32Array
    ) {
      origGetFloat.call(this, array);
      if (block) {
        array.fill(-Infinity); 
        return;
      }
      for (let i = 0; i < array.length; i++) {
        array[i] += noise();
      }
    }, "getFloatFrequencyData") as typeof origGetFloat;
  }

  if (typeof AudioBuffer !== "undefined") {
    
    const origGetChannel = AudioBuffer.prototype.getChannelData;
    AudioBuffer.prototype.getChannelData = defineNative(function (
      this: AudioBuffer,
      channel: number
    ) {
      const data = origGetChannel.call(this, channel);
      if (block) return data; 
      
      for (let i = 0; i < data.length; i += 100) {
        data[i] += noise();
      }
      return data;
    }, "getChannelData") as typeof origGetChannel;

    const origCopyFromChannel = AudioBuffer.prototype.copyFromChannel;
    AudioBuffer.prototype.copyFromChannel = defineNative(function (
      this: AudioBuffer,
      destination: Float32Array,
      channelNumber: number,
      bufferOffset?: number
    ) {
      origCopyFromChannel.call(this, destination, channelNumber, bufferOffset);
      if (!block) {
        for (let i = 0; i < destination.length; i += 100) {
          destination[i] += noise();
        }
      }
    }, "copyFromChannel") as typeof origCopyFromChannel;
  }
}

import { ShakerEffect } from "./ShakerEffect";

export interface ChannelEffect extends ShakerEffect {
  // device: string;
  // effect: string;
  // tyre?: string | null;
  // devid: string;
  // channels: number;
  // pan: number;
  // volume: number;
  // modulation: string;
  // frequency?: number | null;
  // frequency_max?: number | null;
  // amplitude?: number | null;
  // amplitude_max?: number | null;
  dsp_volume?: number | null;
  dsp_lpf?: number | null;
}

export interface ShakerEffect {
  device: string;
  effect: string;
  tyre?: string | null;
  devid: string;
  channels: number;
  pan: number;
  volume: number;
  modulation: string;
  frequency?: number | null;
  frequencyMax?: number | null;
  amplitude?: number | null;
  amplitudeMax?: number | null;
}

import { DisplaySchema } from "../../lib/typical-admin";

export interface IShakerEffect {
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

const deviceOptions = [{ text: "Sound", value: "Sound" }];
const effectOptions = [{ text: "Sound", value: "Sound" }];

const item = () => ({
  device: {
    type: "select",
    label: "Device",
    defaultValue: "Sound",
    options: deviceOptions,
  },
  effect: {
    type: "select",
    label: "Effect",
    options: effectOptions,
  },
  tyre: {
    type: "text",
    label: "Tyre",
  },
  devid: {
    type: "text",
    label: "Device ID",
  },
  channels: {
    type: "number",
    label: "Channels",
  },
  pan: {
    type: "number",
    label: "Pan",
  },
  volume: {
    type: "number",
    label: "Volume",
  },
  modulation: {
    type: "text",
    label: "Modulation",
  },
  frequency: {
    type: "number",
    label: "Frequency",
    defaultNull: null,
  },
  frequencyMax: {
    type: "number",
    label: "Frequency Max",
    defaultNull: null,
  },
  amplitude: {
    type: "number",
    label: "Amplitude",
    defaultNull: null,
  },
  amplitudeMax: {
    type: "number",
    label: "Amplitude Max",
    defaultNull: null,
  },
});

const listSchema: () => DisplaySchema<IShakerEffect> = () => {
  const f = item();
  return {
    device: { label: f.device.label },
    effect: { label: f.effect.label },
    tyre: { label: f.tyre.label },
    devid: { label: f.devid.label },
    channels: { label: f.channels.label },
    pan: { label: f.pan.label },
    volume: { label: f.volume.label },
    modulation: { label: f.modulation.label },
    frequency: { label: f.frequency.label },
    frequencyMax: { label: f.frequencyMax.label },
    amplitude: { label: f.amplitude.label },
    amplitudeMax: { label: f.amplitudeMax.label },
  };
};

const showSchema = () => {
  const f = item();
  return {
    device: { label: f.device.label },
    effect: { label: f.effect.label },
    tyre: { label: f.tyre.label },
    devid: { label: f.devid.label },
    channels: { label: f.channels.label },
    pan: { label: f.pan.label },
    volume: { label: f.volume.label },
    modulation: { label: f.modulation.label },
    frequency: { label: f.frequency.label },
    frequencyMax: { label: f.frequencyMax.label },
    amplitude: { label: f.amplitude.label },
    amplitudeMax: { label: f.amplitudeMax.label },
  };
};

export default () => ({
  new: item(),
  edit: item(),
  show: showSchema(),
  list: listSchema(),
});

import { ChannelEffect } from "./ChannelEffect";

export interface ChannelConfig {
  id: string;
  name: string;
  wheels: {
    fl: boolean;
    fr: boolean;
    rl: boolean;
    rr: boolean;
  };
  effects: {
    gear: ChannelEffect | null;
    engine: ChannelEffect | null;
    tyreslip: ChannelEffect | null;
    tyrelock: ChannelEffect | null;
    abs: ChannelEffect | null;
    suspension: ChannelEffect | null;
  };
  pan: number;
  devid: string;
}

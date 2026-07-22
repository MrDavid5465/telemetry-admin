import gql from 'graphql-tag';

export interface ShakerChannel {
  id: string;
  profileId?: string | null;
  // The real output channel index on this channel's own devid, directly
  // user-editable (bounded 0..channels). Unique only within this channel's
  // own device, not globally — two channels on different devices can share
  // a pan value. MonocoqueSoundDevice/LfeChannel rows reference this channel
  // via their own `channelId`, not by pan.
  pan: number;
  devid: string;
  channels: number;
  // One of FrontLeft/FrontRight/RearLeft/RearRight/Front/Rear/Left/Right/All
  // (see shakerUtils.ts's cornersToConfig/configToCorners) — applied
  // uniformly to every tyre-capable effect on this channel at export time.
  position?: string | null;
}

const channelFields = `id profileId pan devid channels position`;

export const GET_SHAKER_CHANNELS = gql`
  query getShakerChannels {
    getShakerChannels {
      ${channelFields}
    }
  }
`;

export const ADD_SHAKER_CHANNEL = gql`
  mutation addShakerChannel($values: ShakerChannelInput!) {
    addShakerChannel(values: $values) {
      ${channelFields}
    }
  }
`;

export const UPDATE_SHAKER_CHANNEL = gql`
  mutation updateShakerChannel($id: String!, $update: ShakerChannelInput!) {
    updateShakerChannel(id: $id, update: $update) {
      ${channelFields}
    }
  }
`;

export const REMOVE_SHAKER_CHANNEL = gql`
  mutation removeShakerChannel($id: String!) {
    removeShakerChannel(id: $id) {
      id
    }
  }
`;

export const SHAKER_CHANNEL_CHANGED = gql`
  subscription shakerChannelChanged {
    shakerChannelChanged {
      operationName
      value {
        ${channelFields}
      }
    }
  }
`;

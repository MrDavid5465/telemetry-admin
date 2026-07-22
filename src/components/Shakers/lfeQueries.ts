import gql from 'graphql-tag';

export interface LfeChannel {
  id: string;
  profileId?: string | null;
  // This corner's channel — a direct reference to ShakerChannel.id, same
  // join shape as ShakerRec.channelId. LfeChannel rows are never written to
  // the exported config, so this is purely an internal join key.
  channelId: string;
  fader: number;
  muted: boolean;
}

const lfeChannelFields = `id profileId channelId fader muted`;

// Live-applies a fader/mute change to the LFE effect's already-running
// filter-chain — no process restart, no interruption. Call right after
// persisting via update/addLfeChannel, only while DSP is currently enabled.
export const APPLY_LFE_CHANNEL_LIVE = gql`
  mutation applyLfeChannelLive($channelId: String!, $fader: Int!, $muted: Boolean!) {
    applyLfeChannelLive(channelId: $channelId, fader: $fader, muted: $muted)
  }
`;

// Live-applies a global LPF Hz change (or bypass, via null) — shared by
// every corner, unlike the per-channel LPF on the other effects.
export const APPLY_LFE_LPF_LIVE = gql`
  mutation applyLfeLpfLive($lpfHz: Float) {
    applyLfeLpfLive(lpfHz: $lpfHz)
  }
`;

export const GET_LFE_CHANNELS = gql`
  query getLfeChannels {
    getLfeChannels {
      ${lfeChannelFields}
    }
  }
`;

export const ADD_LFE_CHANNEL = gql`
  mutation addLfeChannel($values: LfeChannelInput!) {
    addLfeChannel(values: $values) {
      ${lfeChannelFields}
    }
  }
`;

export const UPDATE_LFE_CHANNEL = gql`
  mutation updateLfeChannel($id: String!, $update: LfeChannelInput!) {
    updateLfeChannel(id: $id, update: $update) {
      ${lfeChannelFields}
    }
  }
`;

export const REMOVE_LFE_CHANNEL = gql`
  mutation removeLfeChannel($id: String!) {
    removeLfeChannel(id: $id) {
      id
    }
  }
`;

export const LFE_CHANNEL_CHANGED = gql`
  subscription lfeChannelChanged {
    lfeChannelChanged {
      operationName
      value {
        ${lfeChannelFields}
      }
    }
  }
`;

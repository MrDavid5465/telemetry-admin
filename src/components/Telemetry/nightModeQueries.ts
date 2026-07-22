import gql from 'graphql-tag';

export interface NightModeRecord {
  id: string;
  isNight: boolean;
}

export const GET_NIGHT_MODES = gql`
  query getNightModes {
    getNightModes {
      id
      isNight
    }
  }
`;

export const ADD_NIGHT_MODE = gql`
  mutation addNightMode($values: NightModeInput!) {
    addNightMode(values: $values) {
      id
      isNight
    }
  }
`;

export const UPDATE_NIGHT_MODE = gql`
  mutation updateNightMode($id: String!, $update: NightModeInput!) {
    updateNightMode(id: $id, update: $update) {
      id
      isNight
    }
  }
`;

export const NIGHT_MODE_CHANGED = gql`
  subscription nightModeChanged {
    nightModeChanged {
      operationName
      value {
        id
        isNight
      }
    }
  }
`;

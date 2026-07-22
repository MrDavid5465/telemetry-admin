import gql from 'graphql-tag';

export interface DeviceDefault {
  id: string;
  deviceName: string;
  dash?: string;
  group?: string;
}

const FIELDS = `id deviceName dash group`;

export const GET_DEVICE_DEFAULTS = gql`
  query getDeviceDefaults { getDeviceDefaults { ${FIELDS} } }
`;

export const ADD_DEVICE_DEFAULT = gql`
  mutation addDeviceDefault($values: DeviceDefaultInput!) {
    addDeviceDefault(values: $values) { ${FIELDS} }
  }
`;

export const UPDATE_DEVICE_DEFAULT = gql`
  mutation updateDeviceDefault($id: String!, $update: DeviceDefaultInput!) {
    updateDeviceDefault(id: $id, update: $update) { ${FIELDS} }
  }
`;

export const REMOVE_DEVICE_DEFAULT = gql`
  mutation removeDeviceDefault($id: String!) {
    removeDeviceDefault(id: $id) { id }
  }
`;

export const DEVICE_DEFAULT_CHANGED_SUB = gql`
  subscription deviceDefaultChanged {
    deviceDefaultChanged {
      operationName
      value { ${FIELDS} }
    }
  }
`;

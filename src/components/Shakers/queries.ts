import gql from "graphql-tag"

export const GET_MONOCOQUE_DEVICES = gql`
  query getMonocoqueSoundDevices {
    getMonocoqueSoundDevices {
      device
      effect
      channelId
      volume
      modulation
      frequency
      frequencyMax
      amplitude
      amplitudeMax
    }
  }
`
export const name = { singular: "MonocoqueSoundDevice", plural: "MonocoqueSoundDevices" };
// tyre/devid/channels/pan moved to ShakerChannel (joined via channelId) —
// no longer duplicated per effect row. See ShakerChannel's backend doc comment.
const fields = `device
      effect
      channelId
      volume
      modulation
      frequency
      frequencyMax
      amplitude
      amplitudeMax
      profileId
      dspSlot`;

export const CREATE_ITEM = gql`
  mutation add${name.singular}($values: ${name.singular}Input!) {
    add${name.singular}(values: $values) {
      id
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation update${name.singular}($id: String!, $update: ${name.singular}Input!) {
    update${name.singular}(id: $id, update: $update) {
      id
    }
  }
`;

export const REMOVE_ITEM = gql`
  mutation remove${name.singular}($id: String!) {
    remove${name.singular}(id: $id) {
      id
    }
  }
`;

export const GET_ITEM = gql`
  query get${name.singular}($id: String!) {
    get${name.singular}(id: $id) {
      id
      ${fields}
    }
  }
`;

export const GET_ITEMS = gql`
  query get${name.plural} {
    get${name.plural} {
      id
      ${fields}
    }
  }
`;

export const ITEM_CHANGED = gql`
  subscription ${name.singular
    .substring(0, 1)
    .toLowerCase()}${name.singular.substring(1)}Changed {
    ${name.singular.substring(0, 1).toLowerCase()}${name.singular.substring(
  1
)}Changed {
      operationName
      value { 
        id
        ${fields}
      }
    }
  }
`;

export const ONE_ITEM_CHANGED = gql`
  subscription ${name.singular
    .substring(0, 1)
    .toLowerCase()}${name.singular.substring(1)}Changed ($id: String) {
    ${name.singular.substring(0, 1).toLowerCase()}${name.singular.substring(
  1
)}Changed (id: $id) {
      operationName
      value { 
        id
        ${fields}    
      }
    }
  }
`;

export const dispatcher = {
  show: GET_ITEM,
  list: GET_ITEMS,
  new: CREATE_ITEM,
  edit: UPDATE_ITEM,
  delete: REMOVE_ITEM,
  subscribe: ITEM_CHANGED,
  subscribeToOOne: ONE_ITEM_CHANGED
};

export default dispatcher;
import gql from 'graphql-tag';

export interface LedsDeviceRec {
  id: string;
  devpath: string;
  baud: number;
  numLeds: number;
  startLed: number;
  endLed: number;
  config: string;
  profileId?: string | null;
}

const name = { singular: 'MonocoqueLedsDevice', plural: 'MonocoqueLedsDevices' };
const fields = `id devpath baud numLeds startLed endLed config profileId`;

export const GET_LEDS = gql`query get${name.plural} { get${name.plural} { ${fields} } }`;
export const CREATE_LEDS = gql`mutation add${name.singular}($values: ${name.singular}Input!) { add${name.singular}(values: $values) { id } }`;
export const UPDATE_LEDS = gql`mutation update${name.singular}($id: String!, $update: ${name.singular}Input!) { update${name.singular}(id: $id, update: $update) { id } }`;
export const REMOVE_LEDS = gql`mutation remove${name.singular}($id: String!) { remove${name.singular}(id: $id) { id } }`;
export const LEDS_CHANGED = gql`subscription monocoqueLedsDeviceChanged { monocoqueLedsDeviceChanged { operationName value { ${fields} } } }`;

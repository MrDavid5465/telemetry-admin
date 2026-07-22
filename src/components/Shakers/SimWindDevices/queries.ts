import gql from 'graphql-tag';

export interface SimWindDeviceRec {
  id: string;
  devpath: string;
  baud: number;
  fanPower: number;
  config: string;
  profileId?: string | null;
}

const name = { singular: 'MonocoqueSimWindDevice', plural: 'MonocoqueSimWindDevices' };
const fields = `id devpath baud fanPower config profileId`;

export const GET_SIM_WINDS = gql`query get${name.plural} { get${name.plural} { ${fields} } }`;
export const CREATE_SIM_WIND = gql`mutation add${name.singular}($values: ${name.singular}Input!) { add${name.singular}(values: $values) { id } }`;
export const UPDATE_SIM_WIND = gql`mutation update${name.singular}($id: String!, $update: ${name.singular}Input!) { update${name.singular}(id: $id, update: $update) { id } }`;
export const REMOVE_SIM_WIND = gql`mutation remove${name.singular}($id: String!) { remove${name.singular}(id: $id) { id } }`;
export const SIM_WIND_CHANGED = gql`subscription monocoqueSimWindDeviceChanged { monocoqueSimWindDeviceChanged { operationName value { ${fields} } } }`;

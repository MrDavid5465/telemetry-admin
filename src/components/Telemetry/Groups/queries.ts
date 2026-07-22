import gql from 'graphql-tag';

const DASH_GROUP_FIELDS = `
  id
  name
  defaultDash
  carDashMap
`;

export const GET_DASH_GROUPS = gql`
  query getDashGroups {
    getDashGroups { ${DASH_GROUP_FIELDS} }
  }
`;

export const GET_DASH_GROUP = gql`
  query getDashGroup($id: String!) {
    getDashGroup(id: $id) { ${DASH_GROUP_FIELDS} }
  }
`;

export const ADD_DASH_GROUP = gql`
  mutation addDashGroup($values: DashGroupInput!) {
    addDashGroup(values: $values) { id }
  }
`;

export const UPDATE_DASH_GROUP = gql`
  mutation updateDashGroup($id: String!, $update: DashGroupInput!) {
    updateDashGroup(id: $id, update: $update) { id }
  }
`;

export const REMOVE_DASH_GROUP = gql`
  mutation removeDashGroup($id: String!) {
    removeDashGroup(id: $id) { id }
  }
`;

export const GET_KNOWN_CARS = gql`
  query getKnownCars {
    getKnownCars { id }
  }
`;

export interface DashGroup {
  id: string;
  name: string;
  defaultDash?: string;
  carDashMap: string;
}

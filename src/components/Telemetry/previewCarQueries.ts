import gql from 'graphql-tag';

export interface PreviewCarRecord {
  id: string;
  carId: string;
}

export const GET_PREVIEW_CARS = gql`
  query getPreviewCars {
    getPreviewCars {
      id
      carId
    }
  }
`;

export const ADD_PREVIEW_CAR = gql`
  mutation addPreviewCar($values: PreviewCarInput!) {
    addPreviewCar(values: $values) {
      id
      carId
    }
  }
`;

export const UPDATE_PREVIEW_CAR = gql`
  mutation updatePreviewCar($id: String!, $update: PreviewCarInput!) {
    updatePreviewCar(id: $id, update: $update) {
      id
      carId
    }
  }
`;

export const PREVIEW_CAR_CHANGED = gql`
  subscription previewCarChanged {
    previewCarChanged {
      operationName
      value {
        id
        carId
      }
    }
  }
`;

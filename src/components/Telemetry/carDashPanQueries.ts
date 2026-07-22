import gql from 'graphql-tag';

export interface CarDashPanRecord {
  id: string;
  carId: string;
  dashName: string;
  yaw: number;
  pitch: number;
  fov: number;
  roll: number;
}

export const GET_CAR_DASH_PANS = gql`
  query getCarDashPans {
    getCarDashPans {
      id
      carId
      dashName
      yaw
      pitch
      fov
      roll
    }
  }
`;

export const ADD_CAR_DASH_PAN = gql`
  mutation addCarDashPan($values: CarDashPanInput!) {
    addCarDashPan(values: $values) {
      id
      carId
      dashName
      yaw
      pitch
      fov
      roll
    }
  }
`;

export const UPDATE_CAR_DASH_PAN = gql`
  mutation updateCarDashPan($id: String!, $update: CarDashPanInput!) {
    updateCarDashPan(id: $id, update: $update) {
      id
      carId
      dashName
      yaw
      pitch
      fov
      roll
    }
  }
`;

export const REMOVE_CAR_DASH_PAN = gql`
  mutation removeCarDashPan($id: String!) {
    removeCarDashPan(id: $id) {
      id
    }
  }
`;

export const CAR_DASH_PAN_CHANGED = gql`
  subscription carDashPanChanged {
    carDashPanChanged {
      operationName
      value {
        id
        carId
        dashName
        yaw
        pitch
        fov
        roll
      }
    }
  }
`;

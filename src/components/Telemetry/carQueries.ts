import { gql } from '@apollo/client';

export interface CarPhotoRef {
  id: string;
  filename: string;
  url: string; // server-relative, e.g. /360-photos/{id}.png — prefix with apiBase()
}

export interface CarRecord {
  id: string;
  name: string;
  carIds: string; // JSON-serialized string[]
  dayPhoto?: CarPhotoRef;
  nightPhoto?: CarPhotoRef;
  thumbnail?: string;
}

export function parseCarIds(car: { carIds?: string } | undefined | null): string[] {
  try {
    const parsed = JSON.parse(car?.carIds ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CAR_FIELDS = `id name carIds dayPhoto { id filename url } nightPhoto { id filename url } thumbnail`;

export const GET_CARS = gql`
  query getCars {
    getCars { ${CAR_FIELDS} }
  }
`;

export const ADD_CAR = gql`
  mutation addCar($values: CarInput!) {
    addCar(values: $values) { ${CAR_FIELDS} }
  }
`;

export const UPDATE_CAR = gql`
  mutation updateCar($id: String!, $update: CarInput!) {
    updateCar(id: $id, update: $update) { ${CAR_FIELDS} }
  }
`;

export const DELETE_CAR = gql`
  mutation deleteCar($id: String!) {
    deleteCar(id: $id)
  }
`;

export const SYNC_CAR_PHOTOS = gql`
  query syncCarPhotos($id: String!) {
    syncCarPhotos(id: $id) { ${CAR_FIELDS} }
  }
`;

const PHOTO_MUTATION_RESULT_FIELDS = `id dayPhoto { id filename url } nightPhoto { id filename url }`;

export const UPLOAD_CAR_PHOTO = gql`
  mutation uploadCarPhoto($id: String!, $filename: String!, $data: String!) {
    uploadCarPhoto(id: $id, filename: $filename, data: $data) { ${PHOTO_MUTATION_RESULT_FIELDS} }
  }
`;

export const UPLOAD_CAR_PHOTO_NIGHT = gql`
  mutation uploadCarPhotoNight($id: String!, $filename: String!, $data: String!) {
    uploadCarPhotoNight(id: $id, filename: $filename, data: $data) { ${PHOTO_MUTATION_RESULT_FIELDS} }
  }
`;

export const DELETE_CAR_PHOTO_NIGHT = gql`
  mutation deleteCarPhotoNight($id: String!) {
    deleteCarPhotoNight(id: $id) { ${PHOTO_MUTATION_RESULT_FIELDS} }
  }
`;

export const UPLOAD_CAR_THUMBNAIL = gql`
  mutation uploadCarThumbnail($id: String!, $data: String!) {
    uploadCarThumbnail(id: $id, data: $data) { id thumbnail }
  }
`;

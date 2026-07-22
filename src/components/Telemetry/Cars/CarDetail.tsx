import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Stack, IconButton, Form, getTheme } from '../../../lib/denim/lib';
import { GET_KNOWN_CARS } from '../Groups/queries';
import {
  GET_CARS, UPDATE_CAR, DELETE_CAR, UPLOAD_CAR_PHOTO, UPLOAD_CAR_PHOTO_NIGHT, DELETE_CAR_PHOTO_NIGHT,
  SYNC_CAR_PHOTOS, CarRecord, CarPhotoRef, parseCarIds,
} from '../carQueries';
import { useGlobalPreviewCar } from '../useGlobalPreviewCar';
import DashPanEditor from './DashPanEditor';
import { confirmAsync } from '../../../lib/denim/components/ConfirmDialog';

function apiBase() {
  return `http://${window.location.hostname}:9000`;
}

interface Props {
  carRecordId: string;
  onBack?: () => void;
}

// The one shared detail/edit UI for a Car record — mounted both from the
// existing #/telemetry/cars/:id page and from #/telemetryadmin/cars's show
// and edit slots. Does its own data-fetching (fetch-whole-list-and-find-by-id,
// same convention useDashboard.ts already uses) so both hosts can just pass
// the record id and nothing else.
const CarDetail: React.FC<Props> = ({ carRecordId, onBack }) => {
  const theme = getTheme();

  const { data: carsData, refetch } = useQuery(GET_CARS, { fetchPolicy: 'cache-and-network' });
  const { data: knownCarsData } = useQuery(GET_KNOWN_CARS, { fetchPolicy: 'cache-and-network' });
  // Recomputes content-hash ids from whatever's actually on disk right now,
  // so a photo file replaced outside the app is picked up on load instead of
  // silently staying stale.
  useQuery(SYNC_CAR_PHOTOS, { variables: { id: carRecordId }, fetchPolicy: 'network-only' });

  const [updateCar] = useMutation(UPDATE_CAR);
  const [deleteCar] = useMutation(DELETE_CAR);
  const [uploadCarPhoto] = useMutation(UPLOAD_CAR_PHOTO);
  const [uploadCarPhotoNight] = useMutation(UPLOAD_CAR_PHOTO_NIGHT);
  const [deleteCarPhotoNight] = useMutation(DELETE_CAR_PHOTO_NIGHT);

  const cars: CarRecord[] = (carsData as any)?.getCars ?? [];
  const car = cars.find(c => c.id === carRecordId);
  const knownCarIds: string[] = ((knownCarsData as any)?.getKnownCars ?? []).map((c: any) => c.id);

  const claimedByOthers = new Set(
    cars.filter(c => c.id !== carRecordId).flatMap(parseCarIds)
  );

  const rawIds = car ? parseCarIds(car) : [];
  const dayPhoto = car?.dayPhoto;
  const nightPhoto = car?.nightPhoto;

  // While viewing a car that has a 360° photo uploaded, kiosks (when the sim
  // isn't actually running) preview this car live so pan edits show up
  // immediately without needing to actually drive it. Uses the FIRST raw
  // car_id — PreviewCar.carId must stay in the raw-id domain to blend with
  // live telemetry's own raw car_id in DashboardDesigner, never the Car
  // record's own id. Clears on navigating away.
  const primaryRawId = rawIds[0];
  const { setPreviewCarId, ready: previewCarReady } = useGlobalPreviewCar();
  useEffect(() => {
    if (primaryRawId && car?.dayPhoto && previewCarReady) {
      setPreviewCarId(primaryRawId);
      return () => setPreviewCarId('');
    }
    // Depend on dayPhoto's id (a primitive), not the dayPhoto object itself —
    // a fresh object reference on every render would otherwise risk an
    // infinite effect/setState loop.
  }, [primaryRawId, car?.dayPhoto?.id, previewCarReady, setPreviewCarId]);

  if (!car) {
    return <span style={{ opacity: 0.6, padding: '1em' }}>Car not found.</span>;
  }

  const carSchema = {
    name: { label: 'Friendly name' },
    carIds: {
      type: 'multi-select' as const,
      label: 'Game car IDs',
      options: knownCarIds.map(id => ({ text: id, value: id, disabled: claimedByOthers.has(id) })),
    },
    dayPhoto: {
      type: 'image-upload' as const,
      label: '360° Day Photo',
      placeholderText: 'No 360° photo yet. Upload one below.',
      uploadLabel: 'Upload Photo',
      resolveUrl: (v: CarPhotoRef) => `${apiBase()}${v.url}`,
      uploadFn: async (dataUrl: string, filename: string) => {
        const result = await uploadCarPhoto({ variables: { id: car.id, filename, data: dataUrl } });
        return (result.data as any)?.uploadCarPhoto?.dayPhoto;
      },
    },
    nightPhoto: {
      type: 'image-upload' as const,
      label: '360° Night Photo',
      uploadLabel: 'Add Night Photo',
      placeholderText: 'No night photo — falls back to day.',
      allowClear: true,
      resolveUrl: (v: CarPhotoRef) => `${apiBase()}${v.url}`,
      uploadFn: async (dataUrl: string, filename: string) => {
        const result = await uploadCarPhotoNight({ variables: { id: car.id, filename, data: dataUrl } });
        return (result.data as any)?.uploadCarPhotoNight?.nightPhoto;
      },
    },
  };

  // per-form's onChange fires on ANY field change, always passing the whole
  // form's own name (not the field that changed) plus the full current raw
  // values — so every change is handled here by comparing each tracked field
  // against the car's current known value, not by branching on the first arg.
  const handleFormChange = (_formName: string, { raw }: any) => {
    if (raw.name && raw.name !== car.name) {
      updateCar({ variables: { id: car.id, update: { name: raw.name } } });
    }
    const rawCarIdsJson = JSON.stringify(raw.carIds ?? []);
    if (rawCarIdsJson !== car.carIds) {
      updateCar({ variables: { id: car.id, update: { carIds: rawCarIdsJson } } });
    }
    if (!raw.nightPhoto && nightPhoto) {
      deleteCarPhotoNight({ variables: { id: car.id } });
    }
    // dayPhoto set / nightPhoto set: already persisted by their own uploadFn
    // (uploadCarPhoto/uploadCarPhotoNight) — nothing more to do here.
  };

  const handleDeleteCar = async () => {
    if (!(await confirmAsync(`Delete "${car.name}"? This removes its photos and cannot be undone.`, { danger: true }))) return;
    await deleteCar({ variables: { id: car.id } });
    onBack?.();
  };

  const sep = `1px solid ${theme.palette.neutralLight}`;

  return (
    <div style={{ padding: '1.2em 1.5em', maxWidth: 720 }}>
      <Stack horizontal verticalAlign="center" horizontalAlign="space-between" style={{ marginBottom: '1em' }}>
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          {onBack && <IconButton iconProps={{ iconName: 'Back' }} onClick={onBack} title="Back" />}
          <span style={{ fontSize: '1.2em', fontWeight: 700 }}>Car Configuration</span>
        </Stack>
        <IconButton iconProps={{ iconName: 'Delete' }} title="Delete car" onClick={handleDeleteCar} />
      </Stack>

      <Form
        key={car.id}
        form={carSchema}
        name={`car-${car.id}`}
        initialValues={{ name: car.name, carIds: rawIds, dayPhoto, nightPhoto }}
        onChange={handleFormChange}
      />

      <div style={{ borderBottom: sep, marginTop: '1em' }} />

      <DashPanEditor
        carId={car.id}
        photoId={car.id}
        photoUrl={dayPhoto ? `${apiBase()}${dayPhoto.url}` : undefined}
        nightPhotoUrl={nightPhoto ? `${apiBase()}${nightPhoto.url}` : undefined}
        hasThumbnail={!!car.thumbnail}
        onThumbnailChanged={refetch}
      />
    </div>
  );
};

export default CarDetail;

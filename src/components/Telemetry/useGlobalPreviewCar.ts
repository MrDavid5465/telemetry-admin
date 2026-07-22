import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import {
  GET_PREVIEW_CARS,
  ADD_PREVIEW_CAR,
  UPDATE_PREVIEW_CAR,
  PREVIEW_CAR_CHANGED,
  PreviewCarRecord,
} from './previewCarQueries';

// A global "preview car" — set from a car's config page so kiosks (when the
// sim isn't actually running) can preview that car's 360° photo/pan without
// needing to actually drive it. Single record, live-synced like NightMode.
// `setPreviewCarId` has a stable identity so effects that call it on
// mount/param-change/unmount don't need to worry about it churning deps.
//
// `ready` reports whether the initial getPreviewCars query has resolved at
// least once. A fresh mount's setPreviewCarId shouldn't be called before that
// — otherwise it can't tell an already-existing record (from a previous
// session) apart from "none yet", and would create a duplicate via `add`
// instead of updating the real one.
export function useGlobalPreviewCar(): { previewCarId: string; setPreviewCarId: (carId: string) => void; ready: boolean } {
  const { data } = useQuery(GET_PREVIEW_CARS, { fetchPolicy: 'cache-and-network' });
  const [addPreviewCar] = useMutation(ADD_PREVIEW_CAR);
  const [updatePreviewCar] = useMutation(UPDATE_PREVIEW_CAR);

  const queried = ((data as any)?.getPreviewCars ?? [])[0] as PreviewCarRecord | undefined;
  const [live, setLive] = useState<PreviewCarRecord | undefined>(undefined);

  useSubscription(PREVIEW_CAR_CHANGED, {
    onData: ({ data }: any) => {
      const value = data.data?.previewCarChanged?.value;
      if (value) setLive(value);
    },
  });

  const current = live ?? queried;
  const currentRef = useRef(current);
  currentRef.current = current;

  // Guards against a race where setPreviewCarId is called again (e.g. an
  // effect re-firing as a query resolves) before the first `add` — with no
  // record id yet — has come back, which would otherwise create a duplicate.
  const pendingAddRef = useRef<Promise<any> | null>(null);

  const setPreviewCarId = useCallback((carId: string) => {
    const existing = currentRef.current;
    if (existing?.id) {
      updatePreviewCar({ variables: { id: existing.id, update: { carId } } });
      return;
    }
    if (pendingAddRef.current) {
      pendingAddRef.current.then((res: any) => {
        const id = res?.data?.addPreviewCar?.id;
        if (id) updatePreviewCar({ variables: { id, update: { carId } } });
      });
      return;
    }
    const promise = addPreviewCar({ variables: { values: { carId } } });
    pendingAddRef.current = promise;
    promise.then(() => { pendingAddRef.current = null; });
  }, [updatePreviewCar, addPreviewCar]);

  return { previewCarId: current?.carId ?? '', setPreviewCarId, ready: data !== undefined };
}

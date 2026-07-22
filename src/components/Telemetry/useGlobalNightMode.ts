import { useState, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import {
  GET_NIGHT_MODES,
  ADD_NIGHT_MODE,
  UPDATE_NIGHT_MODE,
  NIGHT_MODE_CHANGED,
  NightModeRecord,
} from './nightModeQueries';

// Day/night is a single global value shared across every dashboard and kiosk
// display (not per-dashboard). There's effectively one record — the app
// creates it on first use and thereafter updates it in place. Live updates
// come from other clients via nightModeChanged, so every window mounting
// this hook stays in sync.
export function useGlobalNightMode(): { isNight: boolean; toggleNightMode: () => void } {
  const { data } = useQuery(GET_NIGHT_MODES, { fetchPolicy: 'cache-and-network' });
  const [addNightMode] = useMutation(ADD_NIGHT_MODE);
  const [updateNightMode] = useMutation(UPDATE_NIGHT_MODE);

  const queried = ((data as any)?.getNightModes ?? [])[0] as NightModeRecord | undefined;
  const [live, setLive] = useState<NightModeRecord | undefined>(undefined);

  useSubscription(NIGHT_MODE_CHANGED, {
    onData: ({ data }: any) => {
      const value = data.data?.nightModeChanged?.value;
      if (value) setLive(value);
    },
  });

  const current = live ?? queried;
  const isNight = current?.isNight ?? false;

  const toggleNightMode = useCallback(() => {
    const next = !isNight;
    if (current?.id) {
      updateNightMode({ variables: { id: current.id, update: { isNight: next } } });
    } else {
      addNightMode({ variables: { values: { isNight: next } } });
    }
  }, [current?.id, isNight, updateNightMode, addNightMode]);

  return { isNight, toggleNightMode };
}

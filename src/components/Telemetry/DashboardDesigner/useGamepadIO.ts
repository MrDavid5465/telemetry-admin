import { useCallback, useEffect, useRef } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { GAMEPAD_BUTTON, GAMEPAD_AXIS } from './queries';

// Fire-and-forget, matching the old Tauri-invoke helper's behavior: a lost
// gamepad update shouldn't surface an error to the user, just get dropped
// (button-hold heartbeats mean the next one is only ~200ms behind anyway).
export function useGamepadIO() {
  const client = useApolloClient();

  const sendButton = useCallback((buttonIndex: number, pressed: boolean, watchdog = false) => {
    client.mutate({ mutation: GAMEPAD_BUTTON, variables: { buttonIndex, pressed, watchdog } }).catch(() => {});
  }, [client]);

  const sendAxis = useCallback((axisIndex: number, value: number) => {
    client.mutate({ mutation: GAMEPAD_AXIS, variables: { axisIndex, value } }).catch(() => {});
  }, [client]);

  return { sendButton, sendAxis };
}

const HEARTBEAT_MS = 200;

// For a button that's actually held down for an arbitrary duration (a
// momentary button-control's "pressed" state — the horn/highbeam-flash
// case). Sends `watchdog: true` and re-sends `pressed: true` every
// HEARTBEAT_MS while held, so the backend's watchdog (see
// graphql/gamepad.rs / gamepad.rs's run_watchdog) knows the press is still
// legitimate. If this component unmounts or the connection drops mid-press,
// the heartbeats simply stop and the backend force-releases the button
// itself — release() here is just the clean-path half of that.
//
// Toggle-mode presses and the encoder's brief self-timed pulses should NOT
// use this — they call sendButton directly with watchdog left at its
// default `false`, since there's no "held indefinitely" state to babysit.
export function useHeldGamepadButton() {
  const { sendButton } = useGamepadIO();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heldIndexRef = useRef<number | null>(null);

  const press = useCallback((buttonIndex: number) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heldIndexRef.current = buttonIndex;
    sendButton(buttonIndex, true, true);
    heartbeatRef.current = setInterval(() => sendButton(buttonIndex, true, true), HEARTBEAT_MS);
  }, [sendButton]);

  const release = useCallback((buttonIndex: number) => {
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    heldIndexRef.current = null;
    sendButton(buttonIndex, false, false);
  }, [sendButton]);

  // Safety net for an unmount mid-press (e.g. navigating away from the
  // dashboard while the horn is held) — stop the heartbeat and release
  // immediately rather than leaving it to the backend's ~600ms watchdog.
  useEffect(() => () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (heldIndexRef.current != null) sendButton(heldIndexRef.current, false, false);
  }, [sendButton]);

  return { press, release };
}

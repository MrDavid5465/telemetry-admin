import { useSubscription } from '@apollo/client/react';
import { TELEMETRY_SUB } from './queries';

const COURSE_FLAG_MAP: Record<string, number> = {
  GREEN: 0, YELLOW: 1, RED: 2, CHEQUERED: 3,
  BLUE: 4, WHITE: 5, BLACK: 6, BLACK_WHITE: 7,
  BLACK_ORANGE: 8, ORANGE: 9,
};

// GraphQL's SimStatus enum serializes as SCREAMING_SNAKE_CASE (OFF/MENU/ACTIVE) —
// normalize to the casing the rest of the app compares against.
const SIM_STATUS_MAP: Record<string, string> = { OFF: 'Off', MENU: 'Menu', ACTIVE: 'Active' };

export interface LiveTelemetryData {
  values: Record<string, number>;
  car: string;
  simStatus: string;
}

export function computeTelemetryValues(t: any): LiveTelemetryData {
  const values: Record<string, number> = {};
  if (t) {
    for (const [key, val] of Object.entries(t as object)) {
      if (typeof val === 'number') values[key] = val;
    }
    if (typeof t.courseFlag === 'string') values['courseFlag'] = COURSE_FLAG_MAP[t.courseFlag] ?? 0;
    if (typeof t.inPit === 'boolean') values['inPit'] = t.inPit ? 1 : 0;
    if (typeof t.lapIsValid === 'boolean') values['lapIsValid'] = t.lapIsValid ? 1 : 0;
  }
  const simStatus = t?.simStatus ?? '';
  return { values, car: t?.car ?? '', simStatus: SIM_STATUS_MAP[simStatus] ?? simStatus };
}

export function useLiveTelemetry(skip = false): LiveTelemetryData {
  const { data } = useSubscription(TELEMETRY_SUB, { skip });
  return computeTelemetryValues((data as any)?.telemetry);
}

export function useTelemetryActive(skip = false): boolean {
  const { data } = useSubscription(TELEMETRY_SUB, { skip });
  return computeTelemetryValues((data as any)?.telemetry).simStatus === 'Active';
}

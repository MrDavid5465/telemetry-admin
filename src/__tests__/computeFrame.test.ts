import { describe, it, expect } from 'vitest';
import { easeInOut, computeFrame } from '../components/Telemetry/DashboardDesigner/useTelemetryPlayback';

const binding = { field: 'rpm', inputMin: 0, inputMax: 8000, outputMin: 0, outputMax: 1 };
const node = { binding };

// ─── easeInOut ───────────────────────────────────────────────────────────────

describe('easeInOut', () => {
  it('is 0 at t=0', () => expect(easeInOut(0)).toBe(0));
  it('is 1 at t=1', () => expect(easeInOut(1)).toBe(1));
  it('is 0.5 at t=0.5', () => expect(easeInOut(0.5)).toBeCloseTo(0.5));
  it('is slow at the start (below linear)', () => expect(easeInOut(0.25)).toBeLessThan(0.25));
  it('is fast in the middle (above linear)', () => expect(easeInOut(0.5)).toBeGreaterThanOrEqual(0.5));
  it('is slow at the end (above linear for 0.75)', () => expect(easeInOut(0.75)).toBeGreaterThan(0.75));
});

// ─── computeFrame — sweep ────────────────────────────────────────────────────

describe('computeFrame sweep', () => {
  const sweep = {
    type: 'sweep' as const,
    params: { durationMs: 1000, peak: 1, holdMs: 500, loop: false },
  };

  it('starts near zero at elapsed=0', () => {
    const { values, done } = computeFrame(sweep, 0, [node]);
    expect(values.rpm).toBeCloseTo(0, 3);
    expect(done).toBe(false);
  });

  it('reaches peak during hold phase', () => {
    // elapsed = 1000 (exactly at hold start)
    const { values, done } = computeFrame(sweep, 1000, [node]);
    expect(values.rpm).toBeCloseTo(8000, 0);
    expect(done).toBe(false);
  });

  it('returns to zero after full sweep (2×durationMs + holdMs)', () => {
    const total = 2 * 1000 + 500;
    const { values } = computeFrame(sweep, total, [node]);
    expect(values.rpm).toBeCloseTo(0, 3);
  });

  it('marks done after totalMs for non-looping sweep', () => {
    const { done } = computeFrame(sweep, 2600, [node]);
    expect(done).toBe(true);
  });

  it('is not done when loop=true even past totalMs', () => {
    const looping = { ...sweep, params: { ...sweep.params, loop: true } };
    const { done } = computeFrame(looping, 9999, [node]);
    expect(done).toBe(false);
  });

  it('returns no field values when no bindings', () => {
    const { values } = computeFrame(sweep, 500, []);
    expect(Object.keys(values)).toHaveLength(0);
  });

  it('deduplicates fields across multiple nodes with same binding', () => {
    const { values } = computeFrame(sweep, 0, [node, node]);
    expect(Object.keys(values)).toHaveLength(1);
  });

  it('uses the union of ranges when two bindings share a field with different ranges', () => {
    // Regression: a gif-gauge bound to rpm 7000-9000 listed before a needle
    // bound to rpm 0-9000 used to make the sweep cover only 7000-9000 for
    // every gauge on that field, so the needle's low end was never swept.
    const narrowFirst = { binding: { field: 'rpm', inputMin: 7000, inputMax: 9000, outputMin: 0, outputMax: 1 } };
    const wideSecond = { binding: { field: 'rpm', inputMin: 0, inputMax: 9000, outputMin: 0, outputMax: 1 } };
    const at0 = computeFrame(sweep, 0, [narrowFirst, wideSecond]);
    expect(at0.values.rpm).toBeCloseTo(0, 3);
    const atPeak = computeFrame(sweep, 1000, [narrowFirst, wideSecond]);
    expect(atPeak.values.rpm).toBeCloseTo(9000, 0);
  });
});

// ─── computeFrame — sine ─────────────────────────────────────────────────────

describe('computeFrame sine', () => {
  const sine = {
    type: 'sine' as const,
    params: { periodMs: 1000, amplitude: 0.5, center: 0.5, loop: true },
  };

  it('is never marked done', () => {
    const { done } = computeFrame(sine, 99999, [node]);
    expect(done).toBe(false);
  });

  it('outputs center value at phase 0 (sin=0)', () => {
    // elapsed=0 → sin(0)=0 → value = inputMin + center*range + 0 = 0 + 0.5*8000 = 4000
    const { values } = computeFrame(sine, 0, [node]);
    expect(values.rpm).toBeCloseTo(4000, 0);
  });

  it('outputs max near quarter period', () => {
    // elapsed=250ms → phase=π/2 → sin=1 → 0 + 0.5*8000 + 0.5*8000*0.5 = 4000+2000=6000
    const { values } = computeFrame(sine, 250, [node]);
    expect(values.rpm).toBeCloseTo(6000, 0);
  });

  it('outputs min near three-quarter period', () => {
    // elapsed=750ms → phase=3π/2 → sin=-1 → 4000 - 2000 = 2000
    const { values } = computeFrame(sine, 750, [node]);
    expect(values.rpm).toBeCloseTo(2000, 0);
  });
});

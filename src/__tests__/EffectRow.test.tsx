import { describe, it, expect } from 'vitest';
import {
  EFFECTS, EFFECT_LABELS, TYRE_EFFECTS, TYRE_SHORT,
} from '../components/Shakers/EffectRow';

// ─── Constants ───────────────────────────────────────────────────────────────
//
// EffectRow's own component-rendering tests were removed here — they
// predated the per-form Section-based rework (EffectRow now renders via
// per-form's <Form>, not a manual "Advanced parameters" toggle) and the
// tyre picker moving out to ShakerChannel entirely, so every one of those
// assertions was already failing against a DOM shape and a feature
// (embedded per-effect tyre grid) that no longer exist. These constant
// tests still reflect real, current behavior.

describe('EFFECTS constant', () => {
  it('contains all six effect types', () => {
    expect(EFFECTS).toContain('engine');
    expect(EFFECTS).toContain('gear');
    expect(EFFECTS).toContain('suspension');
    expect(EFFECTS).toContain('tyreslip');
    expect(EFFECTS).toContain('tyrelock');
    expect(EFFECTS).toContain('abs');
  });

  it('has exactly six entries', () => {
    expect(EFFECTS).toHaveLength(6);
  });
});

describe('EFFECT_LABELS constant', () => {
  it('maps each effect to a human-readable label', () => {
    expect(EFFECT_LABELS.engine).toBe('Engine');
    expect(EFFECT_LABELS.gear).toBe('Gear');
    expect(EFFECT_LABELS.suspension).toBe('Suspension');
    expect(EFFECT_LABELS.tyreslip).toBe('Tyre Slip');
    expect(EFFECT_LABELS.tyrelock).toBe('Tyre Lock');
    expect(EFFECT_LABELS.abs).toBe('ABS');
  });
});

describe('TYRE_EFFECTS constant', () => {
  it('includes tyre-related effects', () => {
    expect(TYRE_EFFECTS.has('suspension')).toBe(true);
    expect(TYRE_EFFECTS.has('tyreslip')).toBe(true);
    expect(TYRE_EFFECTS.has('tyrelock')).toBe(true);
    expect(TYRE_EFFECTS.has('abs')).toBe(true);
  });

  it('excludes non-tyre effects', () => {
    expect(TYRE_EFFECTS.has('engine')).toBe(false);
    expect(TYRE_EFFECTS.has('gear')).toBe(false);
  });
});

describe('TYRE_SHORT constant', () => {
  it('abbreviates individual tyre positions', () => {
    expect(TYRE_SHORT.FrontLeft).toBe('FL');
    expect(TYRE_SHORT.FrontRight).toBe('FR');
    expect(TYRE_SHORT.RearLeft).toBe('RL');
    expect(TYRE_SHORT.RearRight).toBe('RR');
  });

  it('abbreviates combined positions', () => {
    expect(TYRE_SHORT.All).toBe('All');
  });
});

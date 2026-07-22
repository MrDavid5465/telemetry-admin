import { Field } from '../../../../lib/per-form';

export const COUNTER_ROTATE_FIELDS: Record<string, Field> = {
  counterRotate: { label: 'Counter-rotate with steering', type: 'checkbox', section: 'Rotation' },
  steerMaxDeg:   { label: 'Steering rotation (° total)',   type: 'slider', min: 0, max: 1440, step: 10, section: 'Rotation' },
};

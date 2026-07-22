import { ComponentNode } from '../types/dashboard';

// ---------------------------------------------------------------------------
// Ready-made gauge templates based on real Mk7 Golf cluster patterns.
// Each entry is a ComponentNode (usually a group) that can be dropped onto
// any dashboard canvas. Coordinates are relative (will be repositioned on drop).
// ---------------------------------------------------------------------------

export interface TemplateDef {
  name: string;
  gaugeType: 'needle' | 'bar' | 'digital' | 'combination' | 'none';
  component: ComponentNode;
}

// Mk7-style analogue gauge cluster (tach + speedo as one group)
export const MK7_CLUSTER: TemplateDef = {
  name: 'Mk7 Gauge Cluster',
  gaugeType: 'combination',
  component: {
    id: 'tmpl-mk7-cluster',
    type: 'group',
    name: 'Mk7 Gauge Cluster',
    x: 100, y: 100,
    children: [
      {
        id: 'tmpl-tach-grp',
        type: 'group',
        name: 'Tachometer',
        x: 0, y: 0,
        children: [
          { id: 'tmpl-tach-face', type: 'static-sprite', name: 'Tach Face', x: 0, y: 0, width: 400, height: 400, file: 'mk7-tach-face.svg', backlit: false },
          { id: 'tmpl-tach-needle', type: 'needle-gauge', name: 'Tach Needle', x: 200, y: 200, width: 40, height: 170, file: 'mk7-needle.svg', backlit: true, rotationX: 20, rotationY: 145, binding: { field: 'rpm', inputMin: 0, inputMax: 7000, outputMin: -135, outputMax: 135 } },
        ],
      },
      {
        id: 'tmpl-speedo-grp',
        type: 'group',
        name: 'Speedometer',
        x: 430, y: 0,
        children: [
          { id: 'tmpl-speedo-face', type: 'static-sprite', name: 'Speedo Face', x: 0, y: 0, width: 400, height: 400, file: 'mk7-speedo-face.svg', backlit: false },
          { id: 'tmpl-speedo-needle', type: 'needle-gauge', name: 'Speedo Needle', x: 200, y: 200, width: 40, height: 170, file: 'mk7-needle.svg', backlit: true, rotationX: 20, rotationY: 145, binding: { field: 'speed', inputMin: 0, inputMax: 260, outputMin: -135, outputMax: 135 } },
        ],
      },
      {
        id: 'tmpl-gear', type: 'text-gauge', name: 'Gear',
        x: 455, y: 135,
        format: 'integer', fontFamily: 'Arial, sans-serif', fontSize: 60, color: '#ffffff', fontWeight: 'bold', textAlign: 'center',
        binding: { field: 'gear', inputMin: 0, inputMax: 8, outputMin: 0, outputMax: 8 },
      },
      {
        id: 'tmpl-speed-text', type: 'text-gauge', name: 'Speed (digital)',
        x: 445, y: 200,
        format: 'integer', fontFamily: 'Arial, sans-serif', fontSize: 22, color: '#aaaaaa', textAlign: 'center',
        binding: { field: 'speed', inputMin: 0, inputMax: 260, outputMin: 0, outputMax: 260 },
      },
    ],
  },
};

// Standalone Mk7 tachometer template
export const MK7_TACH: TemplateDef = {
  name: 'Mk7 Tachometer',
  gaugeType: 'needle',
  component: {
    id: 'tmpl-tach-solo',
    type: 'group',
    name: 'Mk7 Tachometer',
    x: 100, y: 100,
    children: [
      { id: 'tmpl-tach-solo-face', type: 'static-sprite', name: 'Tach Face', x: 0, y: 0, width: 400, height: 400, file: 'mk7-tach-face.svg', backlit: false },
      { id: 'tmpl-tach-solo-needle', type: 'needle-gauge', name: 'Needle', x: 200, y: 200, width: 40, height: 170, file: 'mk7-needle.svg', backlit: true, rotationX: 20, rotationY: 145, binding: { field: 'rpm', inputMin: 0, inputMax: 7000, outputMin: -135, outputMax: 135 } },
      { id: 'tmpl-tach-solo-rpm', type: 'text-gauge', name: 'RPM', x: 160, y: 256, format: 'comma-integer', fontFamily: 'Arial, sans-serif', fontSize: 18, color: '#aaaaaa', textAlign: 'center', binding: { field: 'rpm', inputMin: 0, inputMax: 7000, outputMin: 0, outputMax: 7000 } },
    ],
  },
};

// Standalone Mk7 speedometer template
export const MK7_SPEEDO: TemplateDef = {
  name: 'Mk7 Speedometer',
  gaugeType: 'needle',
  component: {
    id: 'tmpl-speedo-solo',
    type: 'group',
    name: 'Mk7 Speedometer',
    x: 100, y: 100,
    children: [
      { id: 'tmpl-speedo-solo-face', type: 'static-sprite', name: 'Speedo Face', x: 0, y: 0, width: 400, height: 400, file: 'mk7-speedo-face.svg', backlit: false },
      { id: 'tmpl-speedo-solo-needle', type: 'needle-gauge', name: 'Needle', x: 200, y: 200, width: 40, height: 170, file: 'mk7-needle.svg', backlit: true, rotationX: 20, rotationY: 145, binding: { field: 'speed', inputMin: 0, inputMax: 260, outputMin: -135, outputMax: 135 } },
    ],
  },
};

// RPM + Gear digital readout panel (text-gauge only)
export const DIGITAL_RPM_GEAR: TemplateDef = {
  name: 'Digital RPM & Gear',
  gaugeType: 'digital',
  component: {
    id: 'tmpl-digital-rpm-gear',
    type: 'group',
    name: 'Digital RPM & Gear',
    x: 100, y: 100,
    children: [
      { id: 'tmpl-gear-big', type: 'text-gauge', name: 'Gear', x: 0, y: 0, format: 'integer', fontFamily: 'Arial, sans-serif', fontSize: 80, color: '#ffffff', fontWeight: 'bold', textAlign: 'center', binding: { field: 'gear', inputMin: 0, inputMax: 8, outputMin: 0, outputMax: 8 } },
      { id: 'tmpl-rpm-num', type: 'text-gauge', name: 'RPM', x: 0, y: 90, format: 'comma-integer', suffix: ' rpm', fontFamily: 'Arial, sans-serif', fontSize: 28, color: '#cccccc', textAlign: 'center', binding: { field: 'rpm', inputMin: 0, inputMax: 7000, outputMin: 0, outputMax: 7000 } },
      { id: 'tmpl-rpm-bar', type: 'graph-bar-gauge', name: 'RPM Bar', x: 0, y: 132, width: 180, height: 10, graphType: 'h-bar', colorLow: '#00cc44', colorMid: '#ffaa00', colorHigh: '#cc0000', backgroundColor: '#222', borderRadius: 3, binding: { field: 'rpm', inputMin: 0, inputMax: 7000, outputMin: 0, outputMax: 7000 } },
    ],
  },
};

// Throttle + brake + g-force bars (common race overlay)
export const PEDAL_TELEMETRY: TemplateDef = {
  name: 'Pedal & G-Force Bars',
  gaugeType: 'bar',
  component: {
    id: 'tmpl-pedals',
    type: 'group',
    name: 'Pedal & G-Force',
    x: 100, y: 100,
    children: [
      { id: 'tmpl-thr-lbl', type: 'text-gauge', name: 'Thr label', x: 0, y: 0, format: 'raw', prefix: 'THR', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#888888', binding: { field: 'throttle', inputMin: 0, inputMax: 100, outputMin: 0, outputMax: 100 } },
      { id: 'tmpl-thr-bar', type: 'graph-bar-gauge', name: 'Throttle', x: 30, y: 0, width: 120, height: 14, graphType: 'h-bar', colorLow: '#226622', colorHigh: '#44ee44', backgroundColor: '#1a1a1a', borderRadius: 3, showValue: true, binding: { field: 'throttle', inputMin: 0, inputMax: 100, outputMin: 0, outputMax: 100 } },
      { id: 'tmpl-brk-lbl', type: 'text-gauge', name: 'Brk label', x: 0, y: 20, format: 'raw', prefix: 'BRK', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#888888', binding: { field: 'brake', inputMin: 0, inputMax: 100, outputMin: 0, outputMax: 100 } },
      { id: 'tmpl-brk-bar', type: 'graph-bar-gauge', name: 'Brake', x: 30, y: 20, width: 120, height: 14, graphType: 'h-bar', colorLow: '#662222', colorHigh: '#ee4444', backgroundColor: '#1a1a1a', borderRadius: 3, showValue: true, binding: { field: 'brake', inputMin: 0, inputMax: 100, outputMin: 0, outputMax: 100 } },
      { id: 'tmpl-glat-lbl', type: 'text-gauge', name: 'G-lat label', x: 0, y: 40, format: 'raw', prefix: 'G', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#888888', binding: { field: 'gLat', inputMin: -3, inputMax: 3, outputMin: -3, outputMax: 3 } },
      { id: 'tmpl-glat-bar', type: 'graph-bar-gauge', name: 'G-Lateral', x: 30, y: 40, width: 120, height: 14, graphType: 'h-bar', colorLow: '#2244cc', colorHigh: '#4488ff', backgroundColor: '#1a1a1a', borderRadius: 3, binding: { field: 'gLat', inputMin: -3, inputMax: 3, outputMin: 0, outputMax: 100 } },
    ],
  },
};

// Shift light segments (LED bar style, RPM-based)
export const SHIFT_LIGHT_BAR: TemplateDef = {
  name: 'Shift Light Bar',
  gaugeType: 'bar',
  component: {
    id: 'tmpl-shift-leds',
    type: 'graph-bar-gauge',
    name: 'Shift Light LEDs',
    x: 100, y: 100,
    width: 400, height: 20,
    graphType: 'segments',
    segments: 15,
    colorLow: '#00cc44',
    colorMid: '#ffaa00',
    colorHigh: '#ff0000',
    backgroundColor: '#111',
    binding: { field: 'rpm', inputMin: 2000, inputMax: 7000, outputMin: 0, outputMax: 100 },
  },
};

// Speed arc gauge (graph-based arc)
export const SPEED_ARC: TemplateDef = {
  name: 'Speed Arc Gauge',
  gaugeType: 'bar',
  component: {
    id: 'tmpl-speed-arc',
    type: 'group',
    name: 'Speed Arc',
    x: 100, y: 100,
    children: [
      { id: 'tmpl-arc-bar', type: 'graph-bar-gauge', name: 'Speed Arc', x: 0, y: 0, width: 200, height: 200, graphType: 'arc', colorLow: '#0088ff', colorHigh: '#00ccff', backgroundColor: '#1a2a3a', showValue: true, binding: { field: 'speed', inputMin: 0, inputMax: 260, outputMin: 0, outputMax: 100 } },
      { id: 'tmpl-speed-text2', type: 'text-gauge', name: 'Speed Unit', x: 70, y: 148, format: 'raw', prefix: 'km/h', fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#666666', textAlign: 'center', binding: { field: 'speed', inputMin: 0, inputMax: 260, outputMin: 0, outputMax: 260 } },
    ],
  },
};

export const ALL_TEMPLATES: TemplateDef[] = [
  MK7_CLUSTER,
  MK7_TACH,
  MK7_SPEEDO,
  DIGITAL_RPM_GEAR,
  PEDAL_TELEMETRY,
  SHIFT_LIGHT_BAR,
  SPEED_ARC,
];

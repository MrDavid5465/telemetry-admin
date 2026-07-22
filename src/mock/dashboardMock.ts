import { DashboardConfig, ComponentNode } from '../types/dashboard';

export const builtInSprites = [
  { file: 'flag-off.svg',          label: 'Flag: Off',             thumbnail: '/dash-sprites/flag-off.svg' },
  { file: 'flag-green.svg',        label: 'Flag: Green',           thumbnail: '/dash-sprites/flag-green.svg' },
  { file: 'flag-yellow.svg',       label: 'Flag: Yellow',          thumbnail: '/dash-sprites/flag-yellow.svg' },
  { file: 'flag-red.svg',          label: 'Flag: Red',             thumbnail: '/dash-sprites/flag-red.svg' },
  { file: 'flag-blue.svg',         label: 'Flag: Blue',            thumbnail: '/dash-sprites/flag-blue.svg' },
  { file: 'flag-white.svg',        label: 'Flag: White',           thumbnail: '/dash-sprites/flag-white.svg' },
  { file: 'flag-chequered.svg',    label: 'Flag: Chequered',       thumbnail: '/dash-sprites/flag-chequered.svg' },
  { file: 'flag-black.svg',        label: 'Flag: Black',           thumbnail: '/dash-sprites/flag-black.svg' },
  { file: 'flag-black-white.svg',  label: 'Flag: Black & White',   thumbnail: '/dash-sprites/flag-black-white.svg' },
  { file: 'flag-black-orange.svg', label: 'Flag: Black & Orange',  thumbnail: '/dash-sprites/flag-black-orange.svg' },
  { file: 'flag-orange.svg',       label: 'Flag: Orange',          thumbnail: '/dash-sprites/flag-orange.svg' },
  { file: 'flag-pit.svg',          label: 'Flag: Pit',             thumbnail: '/dash-sprites/flag-pit.svg' },
];

export const mockSprites = [
  ...builtInSprites,
  // Mk7 Golf assets
  { file: 'mk7-tach-face.svg',    label: 'Mk7 Tachometer',           thumbnail: '/dash-sprites/mk7-tach-face.svg' },
  { file: 'mk7-speedo-face.svg',  label: 'Mk7 Speedometer (km/h)',   thumbnail: '/dash-sprites/mk7-speedo-face.svg' },
  { file: 'mk7-needle.svg',       label: 'Mk7 Needle',               thumbnail: '/dash-sprites/mk7-needle.svg' },
  { file: 'mk7-background.svg',   label: 'Mk7 Dashboard Background', thumbnail: '/dash-sprites/mk7-background.svg' },
  // Legacy assets
  { file: 'TachFaceBlack.png',        label: 'Tachometer (Legacy Dark)',         thumbnail: '/dash-sprites/TachFaceBlack.png' },
  { file: 'SpeedFaceMetricBlack.png', label: 'Speedometer Metric (Legacy Dark)', thumbnail: '/dash-sprites/SpeedFaceMetricBlack.png' },
  { file: 'background.png',           label: 'Background (Day)',                  thumbnail: '/dash-sprites/background.png' },
  { file: 'backgroundnight.png',      label: 'Background (Night)',                thumbnail: '/dash-sprites/backgroundnight.png' },
  { file: 'needleLarge.png',          label: 'Needle (Legacy)',                   thumbnail: '/dash-sprites/needleLarge.png' },
  { file: 'needleLargeLit.png',       label: 'Needle Lit (Legacy)',               thumbnail: '/dash-sprites/needleLargeLit.png' },
];

// Mk7 dashboard — tach (left) and speedometer (right) as grouped components.
// Needle x/y is the TOP-LEFT of the needle image (new coordinate system).
// Pivot within the needle image is rotationX/Y.
// Mk7 Golf gauge cluster — tach left, speedo right.
// mk7-needle.svg: 40×170, pivot at (20, 145) within image.
// Gauge face: 400×400. Group offset places face at x=0,y=0 relative to group.
// Needle pivot within group = face centre = (200, 200).
export const DEFAULT_COMPONENTS: ComponentNode[] = [
  {
    id: 'tachometer',
    type: 'group',
    name: 'Tachometer',
    x: 143, y: 200,
    children: [
      {
        id: 'tach-face',
        type: 'static-sprite',
        name: 'Tach Face',
        x: 0, y: 0,
        width: 400, height: 400,
        file: 'mk7-tach-face.svg',
        backlit: false,
      },
      {
        // needle pivot = group centre (200, 200); image offset back by rotationX/Y
        id: 'tach-needle',
        type: 'needle-gauge',
        name: 'Tach Needle',
        x: 200, y: 200,
        width: 40, height: 170,
        file: 'mk7-needle.svg',
        backlit: true,
        rotationX: 20, rotationY: 145,
        binding: { field: 'rpm', inputMin: 0, inputMax: 7000, outputMin: -135, outputMax: 135 },
      },
    ],
  },
  {
    id: 'speedometer',
    type: 'group',
    name: 'Speedometer',
    x: 737, y: 200,
    children: [
      {
        id: 'speedo-face',
        type: 'static-sprite',
        name: 'Speedo Face',
        x: 0, y: 0,
        width: 400, height: 400,
        file: 'mk7-speedo-face.svg',
        backlit: false,
      },
      {
        id: 'speedo-needle',
        type: 'needle-gauge',
        name: 'Speedo Needle',
        x: 200, y: 200,
        width: 40, height: 170,
        file: 'mk7-needle.svg',
        backlit: true,
        rotationX: 20, rotationY: 145,
        binding: { field: 'speed', inputMin: 0, inputMax: 260, outputMin: -135, outputMax: 135 },
      },
    ],
  },
  {
    // RPM digital readout in centre — text-gauge example
    id: 'rpm-text',
    type: 'text-gauge',
    name: 'RPM Readout',
    x: 596, y: 360,
    format: 'comma-integer',
    suffix: '',
    fontFamily: 'Arial, sans-serif',
    fontSize: 22,
    color: '#cccccc',
    textAlign: 'center',
    binding: { field: 'rpm', inputMin: 0, inputMax: 7000, outputMin: 0, outputMax: 7000 },
  },
  {
    // Gear indicator
    id: 'gear-text',
    type: 'text-gauge',
    name: 'Gear',
    x: 626, y: 300,
    format: 'integer',
    fontFamily: 'Arial, sans-serif',
    fontSize: 48,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    binding: { field: 'gear', inputMin: 0, inputMax: 8, outputMin: 0, outputMax: 8 },
  },
  {
    // Throttle bar gauge example
    id: 'throttle-bar',
    type: 'graph-bar-gauge',
    name: 'Throttle',
    x: 560, y: 460,
    width: 160, height: 12,
    graphType: 'h-bar',
    colorLow: '#448844',
    colorHigh: '#44cc44',
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    showValue: false,
    binding: { field: 'throttle', inputMin: 0, inputMax: 100, outputMin: 0, outputMax: 100 },
  },
];

export const mockDashboard: DashboardConfig = {
  name: 'Mk7',
  baseDashType: 'sprite',
  path: '~/.config/dashboard-designer/dashboards/mk7',
  canvasWidth: 1280,
  canvasHeight: 800,
  background: 'mk7-background.svg',
  dayNight: false,
  neckFx: true,
  components: DEFAULT_COMPONENTS,
  kioskExitButton: { x: 1240, y: 20, opacity: 0.15 },
};

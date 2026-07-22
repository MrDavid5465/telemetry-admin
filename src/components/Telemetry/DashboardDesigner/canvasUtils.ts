import { ComponentNode } from '../../../types/dashboard';

export function applyBinding(node: ComponentNode, data: Record<string, number>): number {
  if (!node.binding) return 0;
  const { field, inputMin, inputMax, outputMin, outputMax } = node.binding;
  const raw = data[field] ?? inputMin;
  const t = Math.max(0, Math.min(1, (raw - inputMin) / (inputMax - inputMin)));
  return outputMin + t * (outputMax - outputMin);
}

export function formatValue(value: number, fmt: ComponentNode['format']): string {
  switch (fmt) {
    case 'decimal1':      return value.toFixed(1);
    case 'decimal2':      return value.toFixed(2);
    case 'comma-integer': return Math.round(value).toLocaleString();
    case 'time': {
      const ms = Math.max(0, Math.round(value));
      const minutes = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      const millis = ms % 1000;
      return `${minutes}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    }
    case 'raw':           return String(value);
    default:              return String(Math.round(value));
  }
}

export function fillFraction(node: ComponentNode, data: Record<string, number>): number {
  if (!node.binding) return 0;
  const { field, inputMin, inputMax } = node.binding;
  const raw = data[field] ?? inputMin;
  return Math.max(0, Math.min(1, (raw - inputMin) / (inputMax - inputMin)));
}

export function computeRotation(node: ComponentNode, data: Record<string, number>): number | undefined {
  if (node.type !== 'needle-gauge' || !node.binding) return undefined;
  const { field, inputMin, inputMax, outputMin, outputMax } = node.binding;
  const raw = data[field] ?? inputMin;
  const t = Math.max(0, Math.min(1, (raw - inputMin) / (inputMax - inputMin)));
  return outputMin + t * (outputMax - outputMin);
}

export function scaleNode(node: ComponentNode, factor: number): Partial<ComponentNode> {
  const w = node.width ?? 100;
  const h = node.height ?? 100;
  const newW = Math.max(4, Math.round(w * factor));
  const newH = Math.max(4, Math.round(h * factor));

  if (node.type === 'needle-gauge' && node.rotationX != null && node.rotationY != null) {
    return {
      width: newW, height: newH,
      rotationX: Math.round(node.rotationX * newW / w),
      rotationY: Math.round(node.rotationY * newH / h),
    };
  }
  return {
    width: newW, height: newH,
    x: Math.round(node.x - (newW - w) / 2),
    y: Math.round(node.y - (newH - h) / 2),
  };
}

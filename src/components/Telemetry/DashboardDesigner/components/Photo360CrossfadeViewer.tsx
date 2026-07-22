import { forwardRef } from 'react';
import Photo360Viewer, { Photo360Handle } from './Photo360Viewer';

interface Props {
  dayPhotoUrl: string;
  // Undefined when this car has no night variant — falls back to a single
  // static day viewer, no crossfade machinery at all.
  nightPhotoUrl?: string;
  isNight: boolean;
  yaw: number;
  pitch: number;
  fov: number;
  roll: number;
  displayWidth: number;
  displayHeight: number;
  onChange: (yaw: number, pitch: number, fov: number, roll: number) => void;
  readOnly?: boolean;
  telemetryData?: Record<string, number>;
  swayEnabled?: boolean;
  swayGainX?: number;
  swayGainY?: number;
  swayDisableX?: boolean;
  swayDisableY?: boolean;
  // Fires once the day layer has actually painted a frame. In the crossfade
  // (two-layer) case the night layer also wires this up via ...rest, so it
  // may fire twice — callers relying on "first frame ready" should guard
  // against that themselves.
  onLoaded?: () => void;
}

const TRANSITION = 'opacity 2.5s ease';

// Three.js doesn't cross-blend two textures on one mesh without a custom
// shader, so this layers two full Photo360Viewer instances (sharing the same
// pan — same camera position, different lighting) and crossfades them with a
// CSS opacity transition, mirroring the pattern already used for the night
// darkening overlay and backlit sprite day/night swap elsewhere in Canvas.tsx.
// Only the currently-visible layer is interactive, so dragging/zooming always
// affects the one you can actually see.
const Photo360CrossfadeViewer = forwardRef<Photo360Handle, Props>(({
  dayPhotoUrl, nightPhotoUrl, isNight, displayWidth, displayHeight, readOnly, ...rest
}, ref) => {
  if (!nightPhotoUrl) {
    return (
      <Photo360Viewer
        ref={ref}
        photoUrl={dayPhotoUrl}
        displayWidth={displayWidth}
        displayHeight={displayHeight}
        readOnly={readOnly}
        {...rest}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: displayWidth, height: displayHeight, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        opacity: isNight ? 0 : 1,
        transition: TRANSITION,
        pointerEvents: isNight ? 'none' : 'auto',
      }}>
        <Photo360Viewer
          ref={isNight ? undefined : ref}
          photoUrl={dayPhotoUrl}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          readOnly={readOnly || isNight}
          {...rest}
        />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        opacity: isNight ? 1 : 0,
        transition: TRANSITION,
        pointerEvents: isNight ? 'auto' : 'none',
      }}>
        <Photo360Viewer
          ref={isNight ? ref : undefined}
          photoUrl={nightPhotoUrl}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          readOnly={readOnly || !isNight}
          {...rest}
        />
      </div>
    </div>
  );
});

Photo360CrossfadeViewer.displayName = 'Photo360CrossfadeViewer';
export default Photo360CrossfadeViewer;

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';

export interface Photo360Handle {
  capture: (captureWidth: number, captureHeight: number) => Promise<string>;
}

interface Props {
  photoUrl: string;
  yaw: number;
  pitch: number;
  fov: number;
  roll: number;
  displayWidth: number;
  displayHeight: number;
  onChange: (yaw: number, pitch: number, fov: number, roll: number) => void;
  readOnly?: boolean;
  // NeckFX-style telemetry sway — nudges the pan (not the persisted yaw/pitch)
  // based on lateral/longitudinal g, mirroring the canvas sway effect used for
  // non-360 backgrounds. Never written back via onChange.
  telemetryData?: Record<string, number>;
  swayEnabled?: boolean;
  swayGainX?: number;
  swayGainY?: number;
  swayDisableX?: boolean;
  swayDisableY?: boolean;
  // Fires once the equirectangular texture has actually loaded and painted a
  // frame — useful for callers that want to screenshot the result (the
  // texture loads asynchronously, so capturing before this fires yields a
  // blank/untextured sphere).
  onLoaded?: () => void;
}

// Calibrated so typical cornering g (~1g) gives ~1-2° of sway, and the clamped
// max (a spin/crash-level event) tops out around 5°. Panning the camera reads
// as much bigger motion than the equivalent pixel-based canvas sway, so this
// is deliberately far gentler than the canvas sway's degrees-per-g.
const SWAY_YAW_DEG_PER_G   = 1.5;
const SWAY_PITCH_DEG_PER_G = 0.75;

const Photo360Viewer = forwardRef<Photo360Handle, Props>(({
  photoUrl, yaw, pitch, fov, roll, displayWidth, displayHeight, onChange, readOnly = false,
  telemetryData, swayEnabled = false, swayGainX = 1, swayGainY = 1, swayDisableX = false, swayDisableY = false,
  onLoaded,
}, ref) => {
  const mountRef    = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const stateRef    = useRef({ yaw, pitch, fov, roll, displayWidth, displayHeight });
  stateRef.current  = { yaw, pitch, fov, roll, displayWidth, displayHeight };
  const dragRef     = useRef<{ startX: number; startY: number; startYaw: number; startPitch: number } | null>(null);

  const telemetryRef = useRef(telemetryData);
  telemetryRef.current = telemetryData;
  const swayConfigRef = useRef({ swayEnabled, swayGainX, swayGainY, swayDisableX, swayDisableY });
  swayConfigRef.current = { swayEnabled, swayGainX, swayGainY, swayDisableX, swayDisableY };
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;
  // Bumped once the GL-setup effect below acquires a context. The
  // texture-loading effect depends on this (not just photoUrl) so it can
  // pick up the material once it exists.
  const [glGeneration, setGlGeneration] = useState(0);

  // GL setup — deliberately mount-once (NOT keyed on photoUrl). A WebGLRenderer
  // holds a real, browser-capped GPU resource (commonly ~16 simultaneous live
  // contexts, fewer on weak GPUs). Recreating one on every photo change used to
  // race a teardown against a create, rendering blank/grey. That raced on
  // *every* mount, not just repeated navigation: GET_CARS uses cache-and-network,
  // so dayPhoto360Url/nightPhoto360Url reliably change once from a cache-miss
  // placeholder to the real car photo moments after mount. Splitting texture
  // loading (below) from GL setup (here) means a photoUrl change just swaps
  // the material's texture on the existing context — no teardown, no race —
  // and a live car swap mid-session won't glitch either.
  useEffect(() => {
    if (!mountRef.current) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(displayWidth, displayHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(fov, displayWidth / displayHeight, 0.1, 100);
    cameraRef.current = camera;

    const geometry = new THREE.SphereGeometry(50, 64, 32);
    geometry.scale(-1, 1, 1);

    // No map yet — the texture-loading effect below assigns one
    // synchronously in the same effect-flush, before the first
    // requestAnimationFrame paints.
    const material = new THREE.MeshBasicMaterial();
    materialRef.current = material;
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    setGlGeneration(g => g + 1);

    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const sway = { yaw: 0, pitch: 0 };
    let lastWidth = displayWidth;
    let lastHeight = displayHeight;
    const render = () => {
      rafId = requestAnimationFrame(render);
      // Skip actual render work while this tab is backgrounded. Two or
      // more tabs each running a continuous WebGL render loop (e.g. a
      // kiosk tab and this car's own live-preview tab) compete for
      // main-thread time even though only one is visible — that
      // contention has been observed to starve the *other* tab's React
      // state updates badly enough that CSS transitions (the day/night
      // crossfade) appear to snap instead of fade. requestAnimationFrame
      // itself is still called every frame so rendering resumes
      // immediately on refocus, with no extra listener needed.
      if (document.hidden) return;
      const { yaw: y, pitch: p, fov: f, roll: r, displayWidth: dw, displayHeight: dh } = stateRef.current;

      // displayWidth/displayHeight can change after mount (e.g. a
      // responsive container being resized) — the renderer's own canvas
      // size only tracks them via this check, since this GL-setup effect
      // only runs once per component instance (not on every prop change).
      if (dw !== lastWidth || dh !== lastHeight) {
        lastWidth = dw;
        lastHeight = dh;
        renderer.setSize(dw, dh);
      }

      const { swayEnabled: active, swayGainX, swayGainY, swayDisableX, swayDisableY } = swayConfigRef.current;
      const t = telemetryRef.current;
      const gLat = active ? Math.max(-3, Math.min(3, t?.['gLat'] ?? 0)) : 0;
      const gLon = active ? Math.max(-4, Math.min(4, t?.['gLon'] ?? 0)) : 0;
      sway.yaw   = lerp(sway.yaw,   swayDisableX ? 0 : -gLat * SWAY_YAW_DEG_PER_G   * swayGainX, 0.08);
      sway.pitch = lerp(sway.pitch, swayDisableY ? 0 :  gLon * SWAY_PITCH_DEG_PER_G * swayGainY, 0.08);

      if (cameraRef.current) {
        cameraRef.current.fov = f;
        cameraRef.current.aspect = dw / dh;
        cameraRef.current.updateProjectionMatrix();
        const euler = new THREE.Euler(
          THREE.MathUtils.degToRad(-(p + sway.pitch)),
          THREE.MathUtils.degToRad(-(y + sway.yaw)),
          THREE.MathUtils.degToRad(r),
          'YXZ',
        );
        cameraRef.current.quaternion.setFromEuler(euler);
      }
      renderer.render(scene, cameraRef.current!);
    };
    render();

    return () => {
      cancelAnimationFrame(rafId);
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      materialRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Texture loading — swaps the existing material's map in place rather than
  // recreating the WebGL context (see the GL-setup effect above). Runs
  // whenever photoUrl actually changes, including the cache-miss-placeholder
  // -> real-photo transition that used to trigger a full context teardown.
  // Also depends on glGeneration in case this effect first runs before GL
  // setup has created a material.
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    let cancelled = false;
    const texture = new THREE.TextureLoader().load(photoUrl, () => {
      if (!cancelled) onLoadedRef.current?.();
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    material.map = texture;
    material.needsUpdate = true;

    return () => {
      cancelled = true;
      texture.dispose();
    };
  }, [photoUrl, glGeneration]);

  useImperativeHandle(ref, () => ({
    capture: async (captureWidth: number, captureHeight: number): Promise<string> => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
      const r = rendererRef.current;
      const { displayWidth: dw, displayHeight: dh } = stateRef.current;
      r.setSize(captureWidth, captureHeight);
      cameraRef.current.aspect = captureWidth / captureHeight;
      cameraRef.current.updateProjectionMatrix();
      r.render(sceneRef.current, cameraRef.current);
      const dataUrl = r.domElement.toDataURL('image/png');
      r.setSize(dw, dh);
      cameraRef.current.aspect = dw / dh;
      cameraRef.current.updateProjectionMatrix();
      r.render(sceneRef.current, cameraRef.current);
      return dataUrl;
    },
  }));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startYaw: stateRef.current.yaw, startPitch: stateRef.current.pitch,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const sensitivity = stateRef.current.fov / 400;
    const newYaw   = d.startYaw   - (e.clientX - d.startX) * sensitivity;
    const newPitch = Math.max(-85, Math.min(85,
      d.startPitch + (e.clientY - d.startY) * sensitivity,
    ));
    onChange(newYaw, newPitch, stateRef.current.fov, stateRef.current.roll);
  }, [onChange]);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * 0.05;
    const newFov = Math.max(5, Math.min(120, stateRef.current.fov + delta));
    onChange(stateRef.current.yaw, stateRef.current.pitch, newFov, stateRef.current.roll);
  }, [onChange]);

  return (
    <div style={{ position: 'relative', width: displayWidth, height: displayHeight, cursor: readOnly ? 'default' : 'grab', flexShrink: 0 }}>
      <div
        ref={mountRef}
        style={{ width: displayWidth, height: displayHeight, overflow: 'hidden' }}
        onPointerDown={readOnly ? undefined : onPointerDown}
        onPointerMove={readOnly ? undefined : onPointerMove}
        onPointerUp={readOnly ? undefined : onPointerUp}
        onPointerCancel={readOnly ? undefined : onPointerUp}
        onWheel={readOnly ? undefined : onWheel}
      />
    </div>
  );
});

Photo360Viewer.displayName = 'Photo360Viewer';
export default Photo360Viewer;

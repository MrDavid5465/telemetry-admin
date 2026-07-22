/**
 * Telemetry playback E2E tests — BLOCKED pending feature work.
 *
 * These tests cover the flow of:
 *   1. Loading a dashboard in kiosk mode with a prerecorded telemetry session
 *   2. Watching the sim "start up", drive for ~60 s at 60 Hz, then stop
 *   3. Verifying each gauge type updates correctly and returns to idle state
 *
 * ──────────────────────────────────────────────────────────────────────────
 * What needs to be built first
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 1. TELEMETRY RECORDING FEATURE
 *    Record a real (or synthetic) telemetry session to a file.  The format
 *    should be something like:
 *
 *    {
 *      "version": 1,
 *      "sampleRateHz": 60,
 *      "durationSeconds": 60,
 *      "simStatusFrames": [
 *        { "frameIndex": 0,    "simStatus": ""       },  // pre-race idle
 *        { "frameIndex": 60,   "simStatus": "Active" },  // sim goes active
 *        { "frameIndex": 3540, "simStatus": ""       }   // sim ends
 *      ],
 *      "frames": [
 *        // 3600 entries (60 s × 60 Hz), each a Record<string, number>
 *        { "rpm": 0,    "speed": 0,  "gear": 0,  ... },
 *        { "rpm": 2500, "speed": 12, "gear": 1,  ... },
 *        ...
 *      ]
 *    }
 *
 * 2. `playTelemetryRecording` GRAPHQL MUTATION (new endpoint)
 *    Accepts a recording file path (or ID).  The backend loads the file and
 *    begins emitting TelemetryEvent subscription messages at the recording's
 *    sampleRateHz, injecting simStatus transitions at the correct frames.
 *    Returns { ok: true } immediately; the subscription drives the frontend.
 *
 *    Example schema addition (Rust/async-graphql side):
 *
 *    async fn play_telemetry_recording(ctx: &Context<'_>, path: String) -> Result<bool>
 *
 * 3. `stopTelemetryRecording` GRAPHQL MUTATION (new endpoint)
 *    Halts playback early (for test cleanup / teardown).
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Test plan (implement after items 1-3 are done)
 * ──────────────────────────────────────────────────────────────────────────
 */

import { test } from '@playwright/test';

// ────────────────────────────────────────────────────────────────────────────
// Kiosk-mode gauge update tests — one fixture recording per gauge category
// ────────────────────────────────────────────────────────────────────────────

test.fixme('needle-gauge updates during 60 Hz telemetry playback', async (/* { page } */) => {
  // TODO:
  //  1. mockGraphQL with kioskMode dashboard elements containing a needle-gauge
  //  2. gotoKiosk(page, 'E2E Test') — navigate to /#/telemetry/E2E Test
  //  3. Call `playTelemetryRecording` mutation via page.evaluate or a helper
  //  4. Wait for simStatus "Active" subscription event
  //  5. Assert the needle image rotates (transform: rotate changes on the img)
  //  6. Wait for simStatus "" event (sim ended)
  //  7. Assert needle returns to 0° (or rest angle)
  //  8. stopTelemetryRecording for cleanup
});

test.fixme('arc-gauge-face arc sweeps during 60 Hz telemetry playback', async (/* { page } */) => {
  // TODO: same flow as needle-gauge but assert the SVG arc path `d` attribute changes
});

test.fixme('sprite-arc-gauge-face updates during 60 Hz telemetry playback', async (/* { page } */) => {
  // TODO: same flow, check both the needle rotation and the arc path
});

test.fixme('bar-gauge fill height changes during 60 Hz telemetry playback', async (/* { page } */) => {
  // TODO: assert the fill element's height/scaleY CSS changes
});

test.fixme('text-gauge value text updates during 60 Hz telemetry playback', async (/* { page } */) => {
  // TODO: assert the text content of the gauge changes from "0" to a non-zero value
});

test.fixme('graph-bar-gauge appends data points during 60 Hz telemetry playback', async (/* { page } */) => {
  // TODO: assert the SVG polyline or bar elements grow over time
});

test.fixme('gif-gauge startup animation plays when sim goes Active', async (/* { page } */) => {
  // TODO:
  //  gifMode = 'startup' — assert gifFrameIndex increments while sim is Active
  //  then assert it resets to 0 after simStatus returns to ""
});

// ────────────────────────────────────────────────────────────────────────────
// Full 60-second session smoke test
// ────────────────────────────────────────────────────────────────────────────

test.fixme('full 60-second synthetic session: dashboard survives without React errors', async (/* { page } */) => {
  // TODO:
  //  1. Load ALL_GAUGE_TYPES_ELEMENTS dashboard in kiosk mode
  //  2. Play a 60-second synthetic recording (ramp up, hold, ramp down)
  //  3. Track console errors throughout
  //  4. Assert no "Maximum update depth exceeded" during 3600 frames at 60 Hz
  //  5. Assert all gauges return to idle after sim ends
});

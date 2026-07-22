# typiql-tauri

A desktop app (Tauri + React/TypeScript frontend, Rust/Axum/GraphQL backend) for
building live sim-racing dashboards and controlling a physical shaker rig.

It's built around [typiql](https://github.com/MrDavid5465/typiql-rs), a small
Rust ORM that auto-generates full CRUD GraphQL (queries, mutations, live
subscriptions) from `#[typiql_type]`-annotated structs, plus a
[per-form](https://github.com/MrDavid5465/per-form) (a fork of
[octant/per-form](https://github.com/octant/per-form)) based schema-driven
form system on the frontend.

## What it does

- **Dashboard Designer** — a drag-and-drop editor for building live telemetry
  dashboards (gauges, gamepad-bound controls, flag displays, sequence
  playback) rendered against real or simulated sim telemetry.
- **Shaker rig control** — models a physical shaker channel setup
  (per-channel device/position/pan), drives
  [Monocoque](https://github.com/Spacefreak18/monocoque)'s config, and
  optionally routes shaker audio through a live PipeWire DSP filter-chain
  (per-channel LPF + fader, one chain per physical output device) for
  real-time tuning without restarting anything.
- **Telemetry admin** — car/photo management, dashboard groups, device
  routing, and template libraries, all backed by the same typiql schema.

## Stack

- Frontend: React, TypeScript, Vite, Apollo Client, Fluent UI, per-form.
- Backend: Rust, Axum, async-graphql, Tokio — served as a local HTTP/GraphQL
  API that the Tauri webview (and any other client) talks to.
- Storage: a single JSON document via `typiql-adapter-json`, no database
  required.

## Development

Requires Node.js, Rust, and (for the shaker DSP feature) PipeWire with
`pactl`/`pw-cli`/`pw-dump` available.

```bash
npm install
npm run tauri dev
```

This starts the Rust backend (serving GraphQL on `:9000`) and the Vite dev
server (`:1420`) together, opening the Tauri window pointed at the dev
server.

Run just the frontend against an already-running backend with `npm run dev`.
Tests: `npm test` (unit, Vitest) and `npm run test:e2e` (Playwright, mocked
GraphQL).

## License

MIT — see [LICENSE](./LICENSE).

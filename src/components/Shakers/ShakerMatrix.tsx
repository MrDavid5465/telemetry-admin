import React, { useMemo } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { Checkbox, Dropdown, IDropdownOption, TextField } from '@fluentui/react';
import { getTheme } from '../../lib/denim/lib';
import settingsDispatcher from '../../lib/denim/lib/queries';
import { confirmAsync } from '../../lib/denim/components/ConfirmDialog';
import { GET_ITEMS, UPDATE_ITEM, CREATE_ITEM, REMOVE_ITEM, ITEM_CHANGED } from './queries';
import { EffectRow, EFFECTS, EFFECT_LABELS, TYRE_EFFECTS, TYRE_SHORT, ShakerRec } from './EffectRow';
import { LfeRow } from './LfeRow';
import TyreGrid from './TyreGrid';
import {
  GET_AUDIO_SINKS, ENABLE_SHAKER_DSP, DISABLE_SHAKER_DSP,
  WRITE_MONOCOQUE_CONFIG, RELOAD_MONOCOQUE, APPLY_DSP_CHANNEL_LIVE,
  GET_DSP_CHANNELS, ADD_DSP_CHANNEL, UPDATE_DSP_CHANNEL, REMOVE_DSP_CHANNEL, DSP_CHANNEL_CHANGED,
  AudioSinkInfo, ShakerDspChannel,
} from './dspQueries';
import {
  GET_LFE_CHANNELS, ADD_LFE_CHANNEL, UPDATE_LFE_CHANNEL, REMOVE_LFE_CHANNEL,
  LFE_CHANNEL_CHANGED, APPLY_LFE_CHANNEL_LIVE, APPLY_LFE_LPF_LIVE, LfeChannel,
} from './lfeQueries';
import {
  GET_SHAKER_CHANNELS, ADD_SHAKER_CHANNEL, UPDATE_SHAKER_CHANNEL, REMOVE_SHAKER_CHANNEL,
  SHAKER_CHANNEL_CHANGED, ShakerChannel,
} from './channelQueries';

const TYRE_ORDER = ['FrontLeft', 'FrontRight', 'RearLeft', 'RearRight', 'Front', 'Rear', 'Left', 'Right', 'All'];

export type { ShakerRec };

// PipeWire node names can't safely contain arbitrary devid characters
// (dots/dashes/etc) — must match pipewire_dsp::device_slug's sanitization
// exactly (non `[a-zA-Z0-9_]` -> `_`) since the backend derives its actual
// running sink names the same way.
function deviceSlug(devid: string): string {
  return devid.replace(/[^a-zA-Z0-9_]/g, '_');
}

// While DSP is enabled, each (device, effect) pair's exported devid/volume
// are substituted fresh at export time only — computed here, never
// persisted to storage (see ShakerChannel.devid's backend doc comment for
// the full reasoning: the DSP-mode override is inherently per-*effect*
// *per-device*, since every effect gets its own isolated capture sink per
// device it has corners on — see pipewire_dsp::load_filter_chain's doc
// comment — while devid itself now lives per-*channel*, so the substitution
// moved to export time, the same place pan/channels/dsp_slot substitution
// already lived under the prior per-slot design).
function dspEffectSinkName(devid: string, effect: string): string {
  return `shaker_dsp_${deviceSlug(devid)}_${effect.toLowerCase()}_in`;
}

export function buildConfigText(records: ShakerRec[], shakerChannels: ShakerChannel[], dspEnabled: boolean): string {
  const channelsById = new Map(shakerChannels.map(c => [c.id, c]));
  const blocks = records.map(r => {
    const channel = channelsById.get(r.channelId);
    const isTyreEffect = TYRE_EFFECTS.has(r.effect.toLowerCase());
    const effectiveDevid = dspEnabled && channel
      ? dspEffectSinkName(channel.devid, r.effect)
      : (channel?.devid ?? '');
    const effectiveVolume = dspEnabled ? 100 : r.volume;
    const lines = [
      `            device       = "Sound";`,
      `            effect       = "${r.effect}";`,
      // Only emitted for tyre-capable effects — Monocoque's gettyre() is
      // only ever called when effect_type is TYRESLIP/TYRELOCK/ABSBRAKES/
      // SUSPENSION (confirmed directly against confighelper.c this
      // session), so omitting the line entirely for engine/gear cannot hit
      // the known uninitialized-pointer crash in gettyre() — that code path
      // is simply never reached for them. `channel?.position` is always
      // real once a position has been picked; "AllFour" is only a fallback
      // for the rare case a tyre effect exists before its channel has one.
      ...(isTyreEffect ? [`            tyre         = "${channel?.position ?? 'AllFour'}";`] : []),
      `            devid        = "${effectiveDevid}";`,
      `            channels     = ${channel?.channels ?? 4};`,
      `            pan          = ${channel?.pan ?? 0};`,
      `            volume       = ${effectiveVolume};`,
      `            modulation   = "${r.modulation}";`,
      ...(r.frequency != null ? [`            frequency    = ${r.frequency};`] : []),
      ...(r.frequencyMax != null ? [`            frequencyMax = ${r.frequencyMax};`] : []),
      ...(r.amplitude != null ? [`            amplitude    = ${r.amplitude};`] : []),
      ...(r.amplitudeMax != null ? [`            amplitudeMax = ${r.amplitudeMax};`] : []),
    ];
    return `        {\n${lines.join('\n')}\n        }`;
  });
  return `configs = (\n    {\n        sim = "default";\n        car = "default";\n        devices = (\n${blocks.join(',\n')}\n        );\n    }\n);\n`;
}

// Every MonocoqueSoundDevice row gets a permanent, globally-unique dspSlot
// at creation time (never reassigned after) — computed client-side the same
// way other derived fields already are on add. Global across all profiles,
// not just the live set: only one profile's rows are ever live/active at
// once, so slot values never need to be unique against inactive profiles,
// but keeping them globally unique avoids any ambiguity if that ever
// changes, and matches the one-time migration that backfilled existing rows
// this same way.
export function nextDspSlot(allRecords: ShakerRec[]): number {
  const max = allRecords.reduce((m, r) => Math.max(m, r.dspSlot ?? -1), -1);
  return max + 1;
}

// Same "max existing + 1" pattern as nextDspSlot — the caller scopes
// `channelsInScope` to whichever devid a new channel is being added on, so
// pan numbering restarts per device (real-hardware-style: each device's own
// channel 0, 1, 2...), matching ShakerChannel.pan's own doc comment. Pan is
// only a suggested default here — the user can still edit it directly via
// the per-channel pan control.
export function nextPan(channelsInScope: ShakerChannel[]): number {
  const max = channelsInScope.reduce((m, c) => Math.max(m, c.pan), -1);
  return max + 1;
}

export function toInput(r: ShakerRec, override: Partial<ShakerRec> = {}) {
  const m = { ...r, ...override };
  return {
    device: m.device, effect: m.effect, channelId: m.channelId, volume: m.volume,
    modulation: m.modulation, frequency: m.frequency ?? null,
    frequencyMax: m.frequencyMax ?? null, amplitude: m.amplitude ?? null,
    amplitudeMax: m.amplitudeMax ?? null, profileId: m.profileId ?? null,
  };
}

const btnStyle = (primary: boolean, theme: ReturnType<typeof getTheme>): React.CSSProperties => ({
  padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.875em',
  background: primary ? theme.palette.themePrimary : theme.palette.neutralLight,
  color: primary ? '#fff' : theme.palette.neutralPrimary,
});

const ShakerMatrix: React.FC<{ profileId?: string | null }> = ({ profileId = null }) => {
  const theme = getTheme();
  const [exportStatus, setExportStatus] = React.useState<string | null>(null);
  const [dspStatus, setDspStatus] = React.useState<string | null>(null);

  const { data } = useQuery(GET_ITEMS);
  useSubscription(ITEM_CHANGED);

  const allRecords: ShakerRec[] = useMemo(
    () => (data as any)?.getMonocoqueSoundDevices ?? [],
    [data],
  );

  const records = useMemo(
    () => allRecords.filter(r => (r.profileId ?? null) === profileId),
    [allRecords, profileId],
  );

  const [addRec] = useMutation(CREATE_ITEM, { refetchQueries: [{ query: GET_ITEMS }] });
  const [updateRec] = useMutation(UPDATE_ITEM);
  const [removeRec] = useMutation(REMOVE_ITEM, { refetchQueries: [{ query: GET_ITEMS }] });

  // ── Channels — first-class, independently created/removed, no longer
  // inferred from whichever effect rows happen to exist (see
  // ShakerChannel's backend doc comment) ──
  const { data: channelsData } = useQuery(GET_SHAKER_CHANNELS);
  useSubscription(SHAKER_CHANNEL_CHANGED);
  const [addShakerChannel] = useMutation(ADD_SHAKER_CHANNEL, { refetchQueries: [{ query: GET_SHAKER_CHANNELS }] });
  const [updateShakerChannel] = useMutation(UPDATE_SHAKER_CHANNEL);
  const [removeShakerChannel] = useMutation(REMOVE_SHAKER_CHANNEL, { refetchQueries: [{ query: GET_SHAKER_CHANNELS }] });

  const allShakerChannels: ShakerChannel[] = useMemo(
    () => (channelsData as any)?.getShakerChannels ?? [],
    [channelsData],
  );
  const shakerChannels = useMemo(
    () => allShakerChannels.filter(c => (c.profileId ?? null) === profileId),
    [allShakerChannels, profileId],
  );
  const sortedChannels = useMemo(() => {
    return [...shakerChannels].sort((a, b) => {
      const ai = TYRE_ORDER.indexOf(a.position ?? ''), bi = TYRE_ORDER.indexOf(b.position ?? '');
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [shakerChannels]);

  // ── Global DSP enable + output device (AppSettings-backed, profileId-agnostic) ──
  const { data: myData } = useQuery(settingsDispatcher.my);
  const [updateSettings] = useMutation(settingsDispatcher.updateSettings, { refetchQueries: [{ query: settingsDispatcher.my }] });
  const { data: sinksData } = useQuery(GET_AUDIO_SINKS, { fetchPolicy: 'network-only' });
  const [enableDsp] = useMutation(ENABLE_SHAKER_DSP, { refetchQueries: [{ query: settingsDispatcher.my }, { query: GET_ITEMS }] });
  const [disableDsp] = useMutation(DISABLE_SHAKER_DSP, { refetchQueries: [{ query: settingsDispatcher.my }, { query: GET_ITEMS }] });
  const [writeConfig] = useMutation(WRITE_MONOCOQUE_CONFIG);
  const [reloadMonocoque] = useMutation(RELOAD_MONOCOQUE);

  const dspEnabled: boolean = (myData as any)?.my?.settings?.shakerDspEnabled ?? false;
  const audioSinks: AudioSinkInfo[] = (sinksData as any)?.getAudioSinks ?? [];
  const sinkOptions: IDropdownOption[] = [
    { key: '', text: '— Select output device —' },
    ...audioSinks.map(s => ({ key: s.name, text: `${s.description} (${s.channels}ch)` })),
  ];

  const handleToggleDsp = async (checked: boolean) => {
    if (checked) {
      const ok = await confirmAsync(
        'Enabling DSP will route every active shaker channel through the DSP sink. Continue?',
        { danger: true, confirmText: 'Enable DSP' },
      );
      if (!ok) return;
      setDspStatus('Enabling…');
      try {
        await enableDsp();
        setDspStatus('DSP enabled.');
      } catch (e: any) {
        setDspStatus(`Error: ${e?.message ?? e}`);
      }
    } else {
      const ok = await confirmAsync(
        'Disable DSP and return to Monocoque\'s own direct output?',
        { confirmText: 'Disable DSP' },
      );
      if (!ok) return;
      setDspStatus('Disabling…');
      try {
        await disableDsp();
        setDspStatus('DSP disabled.');
      } catch (e: any) {
        setDspStatus(`Error: ${e?.message ?? e}`);
      }
    }
  };

  // ── Per-slot LPF/fader (ShakerDspChannel, one per effect+corner via its
  // own dspSlot — not shared per physical channel — scoped by the same
  // profileId convention as MonocoqueSoundDevice rows) ──
  const { data: dspChannelsData } = useQuery(GET_DSP_CHANNELS);
  useSubscription(DSP_CHANNEL_CHANGED);
  const [addDspChannel] = useMutation(ADD_DSP_CHANNEL, { refetchQueries: [{ query: GET_DSP_CHANNELS }] });
  const [updateDspChannel] = useMutation(UPDATE_DSP_CHANNEL);
  const [removeDspChannel] = useMutation(REMOVE_DSP_CHANNEL, { refetchQueries: [{ query: GET_DSP_CHANNELS }] });
  const [applyDspChannelLive] = useMutation(APPLY_DSP_CHANNEL_LIVE);

  const allDspChannels: ShakerDspChannel[] = useMemo(
    () => (dspChannelsData as any)?.getShakerDspChannels ?? [],
    [dspChannelsData],
  );
  const dspChannelsBySlot = useMemo(() => {
    const scoped = allDspChannels.filter(c => (c.profileId ?? null) === profileId);
    return new Map(scoped.map(c => [c.slot, c]));
  }, [allDspChannels, profileId]);

  const handleDspChannelChange = async (slot: number, override: { lpfHz?: number | null; fader?: number; muted?: boolean }) => {
    const existing = dspChannelsBySlot.get(slot);
    const lpfHz = 'lpfHz' in override ? override.lpfHz ?? null : existing?.lpfHz ?? null;
    const fader = override.fader ?? existing?.fader ?? 100;
    const muted = override.muted ?? existing?.muted ?? false;

    if (existing) {
      await updateDspChannel({ variables: { id: existing.id, update: { lpfHz, fader, muted } } });
    } else {
      await addDspChannel({ variables: { values: { profileId, slot, lpfHz, fader, muted } } });
    }

    // Only the live (profileId === null) scope drives the currently-running
    // filter-chain — pushing a value while DSP is off just errors (no
    // running process to update), so only attempt it while enabled.
    if (profileId === null && dspEnabled) {
      try {
        await applyDspChannelLive({ variables: { slot, lpfHz, fader, muted } });
      } catch {
        // DSP may have just been disabled concurrently, or pipewire/pw-cli
        // hiccuped — the persisted value above is still correct either way,
        // and the next enable/resume picks it up. Not worth surfacing.
      }
    }
  };

  // ── LFE (whole extra signal path: taps a real device's monitor, downmixes
  // to mono, shared LPF, fans out to every enabled corner — see LfeChannel's
  // doc comment). Source device + LPF are AppSettings-backed like DSP output
  // device; per-corner fader/mute are LfeChannel rows, one per pan, scoped
  // by the same profileId convention as everything else here ──
  const lfeSourceDevice: string = (myData as any)?.my?.settings?.shakerLfeSourceDevice ?? '';
  const lfeLpfHz: number | null = (myData as any)?.my?.settings?.shakerLfeLpfHz ?? null;
  const [lastLfeLpfHz, setLastLfeLpfHz] = React.useState(200);
  React.useEffect(() => { if (lfeLpfHz != null) setLastLfeLpfHz(lfeLpfHz); }, [lfeLpfHz]);

  const [applyLfeLpfLive] = useMutation(APPLY_LFE_LPF_LIVE);

  const handleLfeSourceChange = async (deviceName: string) => {
    await updateSettings({ variables: { settings: { shakerLfeSourceDevice: deviceName || null } } });
  };

  const handleLfeLpfChange = async (hz: number | null) => {
    await updateSettings({ variables: { settings: { shakerLfeLpfHz: hz } } });
    if (profileId === null && dspEnabled) {
      try {
        await applyLfeLpfLive({ variables: { lpfHz: hz } });
      } catch {
        // Same best-effort rationale as the per-effect live-apply calls below.
      }
    }
  };

  const { data: lfeChannelsData } = useQuery(GET_LFE_CHANNELS);
  useSubscription(LFE_CHANNEL_CHANGED);
  const [addLfeChannel] = useMutation(ADD_LFE_CHANNEL, { refetchQueries: [{ query: GET_LFE_CHANNELS }] });
  const [updateLfeChannel] = useMutation(UPDATE_LFE_CHANNEL);
  const [removeLfeChannel] = useMutation(REMOVE_LFE_CHANNEL, { refetchQueries: [{ query: GET_LFE_CHANNELS }] });
  const [applyLfeChannelLive] = useMutation(APPLY_LFE_CHANNEL_LIVE);

  const lfeChannelsByChannelId = useMemo(() => {
    const all: LfeChannel[] = (lfeChannelsData as any)?.getLfeChannels ?? [];
    const scoped = all.filter(c => (c.profileId ?? null) === profileId);
    return new Map(scoped.map(c => [c.channelId, c]));
  }, [lfeChannelsData, profileId]);

  const handleLfeToggle = async (channel: ShakerChannel, lfeChannel: LfeChannel | null) => {
    if (lfeChannel) {
      await removeLfeChannel({ variables: { id: lfeChannel.id } });
    } else {
      await addLfeChannel({ variables: { values: { profileId, channelId: channel.id, fader: 100, muted: false } } });
    }
  };

  const handleLfeUpdate = async (lfeChannel: LfeChannel, override: { fader?: number; muted?: boolean }) => {
    const fader = override.fader ?? lfeChannel.fader;
    const muted = override.muted ?? lfeChannel.muted;
    await updateLfeChannel({ variables: { id: lfeChannel.id, update: { fader, muted } } });

    if (profileId === null && dspEnabled) {
      try {
        await applyLfeChannelLive({ variables: { channelId: lfeChannel.channelId, fader, muted } });
      } catch {
        // Best-effort, same rationale as handleDspChannelChange above.
      }
    }
  };

  const matrix = useMemo(() => {
    const m: Record<string, Record<string, ShakerRec | null>> = {};
    for (const eff of EFFECTS) {
      m[eff] = {};
      for (const ch of sortedChannels) {
        m[eff][ch.id] = records.find(r => r.effect.toLowerCase() === eff && r.channelId === ch.id) ?? null;
      }
    }
    return m;
  }, [records, sortedChannels]);

  const effectRecords = useMemo(() => {
    const e: Record<string, ShakerRec[]> = {};
    for (const eff of EFFECTS) e[eff] = records.filter(r => r.effect.toLowerCase() === eff);
    return e;
  }, [records]);

  const handleToggle = async (eff: string, channel: ShakerChannel, rec: ShakerRec | null) => {
    if (rec) {
      await removeRec({ variables: { id: rec.id } });
    } else {
      const src = effectRecords[eff]?.[0];
      await addRec({
        variables: {
          values: {
            device: 'Sound', effect: eff, channelId: channel.id, volume: 100,
            modulation: src?.modulation ?? 'frequency',
            frequency: src?.frequency ?? null, frequencyMax: src?.frequencyMax ?? null,
            amplitude: src?.amplitude ?? null, amplitudeMax: src?.amplitudeMax ?? null,
            profileId: profileId ?? null,
            dspSlot: nextDspSlot(allRecords),
          },
        },
      });
    }
  };

  const handleUpdate = (rec: ShakerRec, override: Partial<ShakerRec>) =>
    updateRec({ variables: { id: rec.id, update: toInput(rec, override) } });

  // ── Add/remove a whole channel — client-orchestrated, matching how every
  // other multi-row creation flow in this app works (see handleToggle
  // above, cloneToProfile in index.tsx): the macro-generated CRUD already
  // covers each individual add/remove, so a channel is just "add one
  // ShakerChannel, then one MonocoqueSoundDevice per EFFECTS entry" in
  // sequence, not a bespoke atomic backend mutation ──
  const handleAddChannel = async () => {
    // Default to the most-recently-used device among existing channels (best
    // effort — this app doesn't track true creation order), else the first
    // available sink. Pan defaults to the next unused value *on that
    // device* — real-hardware-style numbering restarts per device now that
    // pan no longer has to be globally unique (see ShakerChannel.pan's
    // backend doc comment) — the user can still edit it via the per-channel
    // pan control if it needs adjusting.
    const lastUsedDevid = shakerChannels[shakerChannels.length - 1]?.devid;
    const sink = audioSinks.find(s => s.name === lastUsedDevid) ?? audioSinks[0];
    const devid = sink?.name ?? '';
    const deviceChannels = sink?.channels ?? 4;
    const pan = nextPan(shakerChannels.filter(c => c.devid === devid));

    const result = await addShakerChannel({
      variables: { values: { profileId, pan, devid, channels: deviceChannels, position: null } },
    });
    const newChannelId = (result.data as any)?.addShakerChannel?.id;
    if (!newChannelId) return;

    let slot = nextDspSlot(allRecords);
    for (const eff of EFFECTS) {
      await addRec({
        variables: {
          values: {
            device: 'Sound', effect: eff, channelId: newChannelId, volume: 100,
            modulation: 'frequency', frequency: null, frequencyMax: null,
            amplitude: null, amplitudeMax: null,
            profileId: profileId ?? null, dspSlot: slot,
          },
        },
      });
      slot += 1;
    }
  };

  const handleRemoveChannel = async (channel: ShakerChannel) => {
    const ok = await confirmAsync(
      `Remove this channel and all its effects? This can't be undone.`,
      { danger: true, confirmText: 'Remove Channel' },
    );
    if (!ok) return;

    const channelRecords = allRecords.filter(r => r.channelId === channel.id && (r.profileId ?? null) === (channel.profileId ?? null));
    for (const rec of channelRecords) {
      if (rec.dspSlot != null) {
        const dsp = allDspChannels.find(c => c.slot === rec.dspSlot && (c.profileId ?? null) === (channel.profileId ?? null));
        if (dsp) await removeDspChannel({ variables: { id: dsp.id } });
      }
      await removeRec({ variables: { id: rec.id } });
    }
    await removeShakerChannel({ variables: { id: channel.id } });
  };

  const handleChannelDevidChange = async (channel: ShakerChannel, devid: string) => {
    const deviceChannels = audioSinks.find(s => s.name === devid)?.channels ?? channel.channels;
    await updateShakerChannel({ variables: { id: channel.id, update: { devid, channels: deviceChannels } } });
  };

  const handleChannelPositionChange = async (channel: ShakerChannel, position: string) => {
    await updateShakerChannel({ variables: { id: channel.id, update: { position } } });
  };

  const handleChannelPanChange = async (channel: ShakerChannel, pan: number) => {
    await updateShakerChannel({ variables: { id: channel.id, update: { pan } } });
  };

  const handleExport = async () => {
    setExportStatus('Exporting…');
    try {
      await writeConfig({ variables: { config: buildConfigText(records, shakerChannels, dspEnabled) } });
      setExportStatus('Exported.');
    } catch (e: any) {
      setExportStatus(`Error: ${e?.message ?? e}`);
    }
  };

  const handleRestart = async () => {
    setExportStatus('Restarting…');
    try {
      await reloadMonocoque();
      setExportStatus('Restarted.');
    } catch (e: any) {
      setExportStatus(`Error: ${e?.message ?? e}`);
    }
  };

  const border = `1px solid ${theme.palette.neutralTertiaryAlt}`;

  const cellStyle: React.CSSProperties = {
    padding: '10px 12px', border, verticalAlign: 'top',
  };

  return (
    <div style={{ padding: 16, overflowX: 'auto', color: theme.palette.neutralPrimary }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <button style={btnStyle(true, theme)} onClick={handleAddChannel}>Add Channel</button>
        <button style={btnStyle(true, theme)} onClick={handleExport}>Export to Config</button>
        <button style={btnStyle(false, theme)} onClick={handleRestart}>Restart Monocoque</button>
        {exportStatus && <span style={{ fontSize: '0.8em', opacity: 0.6 }}>{exportStatus}</span>}
        <span style={{ marginLeft: 'auto', fontSize: '0.75em', opacity: 0.4 }}>
          Changes persist to TyPiQL immediately. Export writes the .config file.
        </span>
      </div>

      {profileId === null && (
        <div style={{
          display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap',
          marginBottom: 16, padding: '10px 14px', borderRadius: 4,
          background: theme.palette.neutralLighterAlt,
          border: `1px solid ${theme.palette.neutralTertiaryAlt}`,
        }}>
          <Checkbox
            label="DSP mode (LPF + fader via PipeWire)"
            checked={dspEnabled}
            onChange={(_, checked) => handleToggleDsp(!!checked)}
          />
          <span style={{ fontSize: '0.75em', opacity: 0.5 }}>
            One filter-chain per device in use — set via each channel's own device picker below.
          </span>
          {dspStatus && <span style={{ fontSize: '0.8em', opacity: 0.6 }}>{dspStatus}</span>}
        </div>
      )}

      {profileId === null && (
        <div style={{
          display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap',
          marginBottom: 16, padding: '10px 14px', borderRadius: 4,
          background: theme.palette.neutralLighterAlt,
          border: `1px solid ${theme.palette.neutralTertiaryAlt}`,
        }}>
          <Dropdown
            label="LFE source device (monitored, requires DSP mode)"
            selectedKey={lfeSourceDevice}
            options={sinkOptions}
            onChange={(_, opt) => handleLfeSourceChange((opt?.key as string) ?? '')}
            styles={{ root: { minWidth: 260 } }}
          />
          <Checkbox
            label="LFE LPF"
            checked={lfeLpfHz != null}
            onChange={(_, checked) => handleLfeLpfChange(checked ? lastLfeLpfHz : null)}
          />
          {lfeLpfHz != null && (
            <TextField
              label="LFE LPF Hz"
              type="number"
              value={String(lfeLpfHz)}
              onChange={(_, v) => {
                const n = Number(v);
                if (!Number.isNaN(n)) handleLfeLpfChange(n);
              }}
              styles={{ root: { width: 100 } }}
            />
          )}
        </div>
      )}

      {sortedChannels.length === 0 ? (
        <div style={{ padding: 24, opacity: 0.5 }}>
          No channels configured yet — click "Add Channel" to get started.
        </div>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ ...cellStyle, background: theme.palette.neutralLight, textAlign: 'left', minWidth: 110 }}>
                Effect
              </th>
              {sortedChannels.map(ch => (
                <th key={ch.id} style={{ ...cellStyle, background: theme.palette.neutralLight, textAlign: 'center', minWidth: 190 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15em' }}>{TYRE_SHORT[ch.position ?? ''] ?? `Ch${ch.pan}`}</div>
                  <Dropdown
                    selectedKey={ch.devid}
                    options={sinkOptions}
                    onChange={(_, opt) => handleChannelDevidChange(ch, (opt?.key as string) ?? '')}
                    styles={{ root: { minWidth: 160, textAlign: 'left', margin: '6px auto 0' } }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 }}>
                    <span style={{ fontSize: '0.72em', opacity: 0.55 }}>Pan</span>
                    <input
                      type="number" min={0} max={Math.max(0, ch.channels - 1)}
                      value={ch.pan}
                      onChange={e => handleChannelPanChange(ch, Number(e.target.value))}
                      style={{ width: 44, fontSize: '0.75em' }}
                    />
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                    <TyreGrid current={ch.position ?? null} onApply={pos => handleChannelPositionChange(ch, pos)} />
                  </div>
                  <button
                    style={{ ...btnStyle(false, theme), marginTop: 8, fontSize: '0.72em', padding: '3px 10px' }}
                    onClick={() => handleRemoveChannel(ch)}
                  >
                    Remove Channel
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EFFECTS.map((eff, i) => (
              <tr key={eff} style={{ background: i % 2 === 0 ? 'transparent' : theme.palette.neutralLighter }}>
                <td style={{ ...cellStyle }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9em' }}>{EFFECT_LABELS[eff]}</div>
                </td>
                {sortedChannels.map(ch => {
                  const rec = matrix[eff]?.[ch.id] ?? null;
                  return (
                    <td key={ch.id} style={{ ...cellStyle }}>
                      <EffectRow
                        rec={rec}
                        onToggle={() => handleToggle(eff, ch, rec)}
                        onUpdate={override => rec && handleUpdate(rec, override)}
                        dspChannel={rec?.dspSlot != null ? dspChannelsBySlot.get(rec.dspSlot) ?? null : null}
                        onDspChange={override => rec?.dspSlot != null && handleDspChannelChange(rec.dspSlot, override)}
                        dspEnabled={dspEnabled}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr style={{ background: EFFECTS.length % 2 === 0 ? 'transparent' : theme.palette.neutralLighter }}>
              <td style={{ ...cellStyle }}>
                <div style={{ fontWeight: 600, fontSize: '0.9em' }}>LFE</div>
              </td>
              {sortedChannels.map(ch => {
                const lfeChannel = lfeChannelsByChannelId.get(ch.id) ?? null;
                return (
                  <td key={ch.id} style={{ ...cellStyle }}>
                    <LfeRow
                      channel={lfeChannel}
                      onToggle={() => handleLfeToggle(ch, lfeChannel)}
                      onUpdate={override => lfeChannel && handleLfeUpdate(lfeChannel, override)}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ShakerMatrix;

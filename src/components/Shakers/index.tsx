import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Pivot, PivotItem } from '@fluentui/react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { getTheme } from '../../lib/denim/lib';
import ShakerMatrix from './ShakerMatrix';
import CarLayout from './CarLayout';
import ProfilesAdmin from './Profiles';
import ProfileEdit from './Profiles/ProfileEdit';
import { ADD_PROFILE, GET_PROFILES } from './Profiles/queries';
import { GET_ITEMS, CREATE_ITEM, REMOVE_ITEM, ITEM_CHANGED } from './queries';
import { ShakerRec } from './EffectRow';
import { GET_SHAKER_CHANNELS, ADD_SHAKER_CHANNEL, REMOVE_SHAKER_CHANNEL, SHAKER_CHANNEL_CHANGED, ShakerChannel } from './channelQueries';

// ── Save Profile bar ──────────────────────────────────────────────────────────

const SaveBar: React.FC = () => {
  const theme = getTheme();

  const [activeProfile, setActiveProfile] = useState<{ id: string; name: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem('shaker_active_profile') ?? 'null'); }
    catch { return null; }
  });
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCar, setNewCar] = useState('');
  const [newGame, setNewGame] = useState('');

  const { data: devicesData } = useQuery(GET_ITEMS);
  useSubscription(ITEM_CHANGED);
  const [addProfile] = useMutation(ADD_PROFILE, { refetchQueries: [{ query: GET_PROFILES }] });
  const [addDevice] = useMutation(CREATE_ITEM, { refetchQueries: [{ query: GET_ITEMS }] });
  const [removeDevice] = useMutation(REMOVE_ITEM, { refetchQueries: [{ query: GET_ITEMS }] });

  // Channels clone alongside their effect rows — devid/channels/position
  // live on ShakerChannel now, not duplicated per effect row (see
  // ShakerChannel's backend doc comment), so cloning a profile without this
  // would silently lose them.
  const { data: channelsData } = useQuery(GET_SHAKER_CHANNELS);
  useSubscription(SHAKER_CHANNEL_CHANGED);
  const [addChannel] = useMutation(ADD_SHAKER_CHANNEL, { refetchQueries: [{ query: GET_SHAKER_CHANNELS }] });
  const [removeChannel] = useMutation(REMOVE_SHAKER_CHANNEL, { refetchQueries: [{ query: GET_SHAKER_CHANNELS }] });

  const allDevices: ShakerRec[] = (devicesData as any)?.getMonocoqueSoundDevices ?? [];
  const liveDevices = useMemo(
    () => allDevices.filter(r => (r.profileId ?? null) === null),
    [allDevices],
  );
  const allChannels: ShakerChannel[] = (channelsData as any)?.getShakerChannels ?? [];
  const liveChannels = useMemo(
    () => allChannels.filter(c => (c.profileId ?? null) === null),
    [allChannels],
  );

  const cloneToProfile = async (profileId: string) => {
    const existingDevices = allDevices.filter(r => r.profileId === profileId);
    await Promise.all(existingDevices.map(r => removeDevice({ variables: { id: r.id } })));

    const existingChannels = allChannels.filter(c => c.profileId === profileId);
    await Promise.all(existingChannels.map(c => removeChannel({ variables: { id: c.id } })));

    // Channels must be cloned first, with their new ids captured — effect
    // rows below reference their channel by id (channelId), not by pan (pan
    // is no longer globally unique — see ShakerChannel.pan's backend doc
    // comment), so there's no way to re-derive the mapping after the fact
    // the way pan-matching used to allow. Sequential (not Promise.all) since
    // each add's result is needed before the next step can use it.
    const channelIdMap = new Map<string, string>();
    for (const c of liveChannels) {
      const result = await addChannel({
        variables: {
          values: { pan: c.pan, devid: c.devid, channels: c.channels, position: c.position ?? null, profileId },
        },
      });
      const newId = (result.data as any)?.addShakerChannel?.id;
      if (newId) channelIdMap.set(c.id, newId);
    }

    await Promise.all(liveDevices.map(r => {
      const newChannelId = channelIdMap.get(r.channelId);
      if (!newChannelId) return Promise.resolve();
      return addDevice({
        variables: {
          values: {
            device: r.device, effect: r.effect, channelId: newChannelId, volume: r.volume,
            modulation: r.modulation, frequency: r.frequency ?? null,
            frequencyMax: r.frequencyMax ?? null, amplitude: r.amplitude ?? null,
            amplitudeMax: r.amplitudeMax ?? null, profileId,
          },
        },
      });
    }));
  };

  const handleUpdate = async () => {
    if (!activeProfile) return;
    setSaving(true);
    try { await cloneToProfile(activeProfile.id); }
    finally { setSaving(false); }
  };

  const handleSaveNew = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const result = await addProfile({
        variables: { values: { name: newName.trim(), car: newCar || null, game: newGame || null } },
      });
      const newId = (result.data as any)?.addSoundDeviceProfile?.id;
      if (newId) {
        await cloneToProfile(newId);
        const prof = { id: newId, name: newName.trim() };
        localStorage.setItem('shaker_active_profile', JSON.stringify(prof));
        setActiveProfile(prof);
      }
    } finally {
      setShowNewForm(false);
      setNewName(''); setNewCar(''); setNewGame('');
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: theme.palette.neutralLighter,
    color: theme.palette.neutralPrimary,
    border: `1px solid ${theme.palette.neutralTertiaryAlt}`,
    borderRadius: 3, padding: '3px 8px', fontSize: '0.8em',
  };
  const btnBase: React.CSSProperties = {
    border: 'none', borderRadius: 4, cursor: 'pointer', padding: '4px 12px', fontSize: '0.8em',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      padding: '6px 16px',
      background: theme.palette.neutralLighterAlt,
      borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}`,
    }}>
      {activeProfile && (
        <button
          style={{ ...btnBase, background: theme.palette.themeSecondary, color: '#fff' }}
          onClick={handleUpdate} disabled={saving}
        >
          {saving ? 'Saving…' : `Update "${activeProfile.name}"`}
        </button>
      )}
      {!showNewForm ? (
        <button
          style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.neutralPrimary }}
          onClick={() => setShowNewForm(true)} disabled={saving}
        >
          Save as New Profile…
        </button>
      ) : (
        <>
          <input
            placeholder="Name*" value={newName} onChange={e => setNewName(e.target.value)}
            style={{ ...inputStyle, width: 120 }}
          />
          <input
            placeholder="Car" value={newCar} onChange={e => setNewCar(e.target.value)}
            style={{ ...inputStyle, width: 90 }}
          />
          <input
            placeholder="Game" value={newGame} onChange={e => setNewGame(e.target.value)}
            style={{ ...inputStyle, width: 90 }}
          />
          <button
            style={{ ...btnBase, background: theme.palette.themePrimary, color: '#fff' }}
            onClick={handleSaveNew} disabled={!newName.trim() || saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.neutralPrimary }}
            onClick={() => { setShowNewForm(false); setNewName(''); setNewCar(''); setNewGame(''); }}
          >
            Cancel
          </button>
        </>
      )}
      {activeProfile && (
        <span style={{ fontSize: '0.75em', opacity: 0.5, marginLeft: 4 }}>
          Active: {activeProfile.name}
        </span>
      )}
    </div>
  );
};

// ── ShakersMain ───────────────────────────────────────────────────────────────

const ShakersMain: React.FC = () => (
  <div>
    <SaveBar />
    <Pivot>
      <PivotItem headerText="Matrix">
        <ShakerMatrix />
      </PivotItem>
      <PivotItem headerText="Car Layout">
        <CarLayout />
      </PivotItem>
    </Pivot>
  </div>
);

// ── Shakers router ────────────────────────────────────────────────────────────

const Shakers: React.FC = () => (
  <Routes>
    <Route path="/profiles/:id/edit" element={<ProfileEdit />} />
    <Route path="/profiles/*" element={<ProfilesAdmin />} />
    <Route path="/*" element={<ShakersMain />} />
  </Routes>
);

export default Shakers;

import React, { useState, useMemo } from 'react';
import { DocumentNode } from 'graphql';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { getTheme } from '../../lib/denim/lib';

export interface DeviceProfileSaveBarConfig {
  addProfileMutation: DocumentNode;
  getProfilesQuery: DocumentNode;
  addProfileResultKey: string;
  getDevicesQuery: DocumentNode;
  createDeviceMutation: DocumentNode;
  removeDeviceMutation: DocumentNode;
  deviceChangedSubscription: DocumentNode;
  devicesResultKey: string;
  liveToInput: (rec: any, profileId: string) => any;
  storageKey: string;
}

const DeviceProfileSaveBar: React.FC<DeviceProfileSaveBarConfig> = ({
  addProfileMutation, getProfilesQuery, addProfileResultKey,
  getDevicesQuery, createDeviceMutation, removeDeviceMutation,
  deviceChangedSubscription, devicesResultKey, liveToInput, storageKey,
}) => {
  const theme = getTheme();

  const [activeProfile, setActiveProfile] = useState<{ id: string; name: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? 'null'); }
    catch { return null; }
  });
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCar, setNewCar] = useState('');
  const [newGame, setNewGame] = useState('');

  const { data: devicesData } = useQuery(getDevicesQuery);
  useSubscription(deviceChangedSubscription);
  const [addProfile] = useMutation(addProfileMutation, { refetchQueries: [{ query: getProfilesQuery }] });
  const [addDevice] = useMutation(createDeviceMutation, { refetchQueries: [{ query: getDevicesQuery }] });
  const [removeDevice] = useMutation(removeDeviceMutation, { refetchQueries: [{ query: getDevicesQuery }] });

  const allDevices: any[] = (devicesData as any)?.[devicesResultKey] ?? [];
  const liveDevices = useMemo(() => allDevices.filter(r => (r.profileId ?? null) === null), [allDevices]);

  const cloneToProfile = async (profileId: string) => {
    const existing = allDevices.filter(r => r.profileId === profileId);
    await Promise.all(existing.map(r => removeDevice({ variables: { id: r.id } })));
    await Promise.all(liveDevices.map(r => addDevice({ variables: { values: liveToInput(r, profileId) } })));
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
      const result = await addProfile({ variables: { values: { name: newName.trim(), car: newCar || null, game: newGame || null } } });
      const newId = (result.data as any)?.[addProfileResultKey]?.id;
      if (newId) {
        await cloneToProfile(newId);
        const prof = { id: newId, name: newName.trim() };
        localStorage.setItem(storageKey, JSON.stringify(prof));
        setActiveProfile(prof);
      }
    } finally {
      setShowNewForm(false);
      setNewName(''); setNewCar(''); setNewGame('');
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: theme.palette.neutralLighter, color: theme.palette.neutralPrimary,
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
        <button style={{ ...btnBase, background: theme.palette.themeSecondary, color: '#fff' }} onClick={handleUpdate} disabled={saving}>
          {saving ? 'Saving…' : `Update "${activeProfile.name}"`}
        </button>
      )}
      {!showNewForm ? (
        <button style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.neutralPrimary }} onClick={() => setShowNewForm(true)} disabled={saving}>
          Save as New Profile…
        </button>
      ) : (
        <>
          <input placeholder="Name*" value={newName} onChange={e => setNewName(e.target.value)} style={{ ...inputStyle, width: 120 }} />
          <input placeholder="Car" value={newCar} onChange={e => setNewCar(e.target.value)} style={{ ...inputStyle, width: 90 }} />
          <input placeholder="Game" value={newGame} onChange={e => setNewGame(e.target.value)} style={{ ...inputStyle, width: 90 }} />
          <button style={{ ...btnBase, background: theme.palette.themePrimary, color: '#fff' }} onClick={handleSaveNew} disabled={!newName.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.neutralPrimary }} onClick={() => { setShowNewForm(false); setNewName(''); setNewCar(''); setNewGame(''); }}>
            Cancel
          </button>
        </>
      )}
      {activeProfile && (
        <span style={{ fontSize: '0.75em', opacity: 0.5, marginLeft: 4 }}>Active: {activeProfile.name}</span>
      )}
    </div>
  );
};

export default DeviceProfileSaveBar;

import React, { useMemo, useEffect, useRef } from 'react';
import { DocumentNode } from 'graphql';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useNavigate, useLocation } from 'react-router';
import { getTheme } from '../../lib/denim/lib';

export interface DeviceProfilesListConfig {
  // Profile queries
  getProfilesQuery: DocumentNode;
  addProfileMutation: DocumentNode;
  removeProfileMutation: DocumentNode;
  profileChangedSubscription: DocumentNode;
  profilesResultKey: string;
  addProfileResultKey: string;
  // Device queries
  getDevicesQuery: DocumentNode;
  createDeviceMutation: DocumentNode;
  removeDeviceMutation: DocumentNode;
  deviceChangedSubscription: DocumentNode;
  devicesResultKey: string;
  // Business logic
  liveToInput: (rec: any, profileId: string | null) => any;
  defaultDevice: (profileId: string) => any;
  storageKey: string;
  enabled: boolean;
}

const DeviceProfilesList: React.FC<DeviceProfilesListConfig & { dispatcher?: any; name?: any; schemaDefinition?: any }> = (config) => {
  const {
    getProfilesQuery, addProfileMutation, removeProfileMutation, profileChangedSubscription,
    profilesResultKey, addProfileResultKey,
    getDevicesQuery, createDeviceMutation, removeDeviceMutation, deviceChangedSubscription,
    devicesResultKey, liveToInput, defaultDevice, storageKey, enabled,
  } = config;

  const theme = getTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = pathname.replace(/\/$/, '');

  const { data: profilesData, loading: profilesLoading } = useQuery(getProfilesQuery);
  useSubscription(profileChangedSubscription);
  const { data: devicesData, loading: devicesLoading } = useQuery(getDevicesQuery);
  useSubscription(deviceChangedSubscription);

  const [addProfile] = useMutation(addProfileMutation, { refetchQueries: [{ query: getProfilesQuery }] });
  const [removeProfile] = useMutation(removeProfileMutation, { refetchQueries: [{ query: getProfilesQuery }] });
  const [addDevice] = useMutation(createDeviceMutation, { refetchQueries: [{ query: getDevicesQuery }] });
  const [removeDevice] = useMutation(removeDeviceMutation, { refetchQueries: [{ query: getDevicesQuery }] });

  const profiles: any[] = (profilesData as any)?.[profilesResultKey] ?? [];
  const allDevices: any[] = (devicesData as any)?.[devicesResultKey] ?? [];

  // Seed default profile when feature is enabled and store is empty
  const seededRef = useRef(false);
  useEffect(() => {
    if (!enabled || profilesLoading || devicesLoading || seededRef.current) return;
    if (profiles.length > 0) { seededRef.current = true; return; }
    seededRef.current = true;
    (async () => {
      const result = await addProfile({ variables: { values: { name: 'Default', car: null, game: null } } });
      const newId = (result.data as any)?.[addProfileResultKey]?.id;
      if (newId) await addDevice({ variables: { values: defaultDevice(newId) } });
    })();
  }, [enabled, profilesLoading, devicesLoading, profiles.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const deviceCountByProfile = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of profiles) {
      map[p.id] = allDevices.filter(r => r.profileId === p.id).length;
    }
    return map;
  }, [profiles, allDevices]);

  const handleLoad = async (profile: any) => {
    const live = allDevices.filter(r => (r.profileId ?? null) === null);
    const profileRecs = allDevices.filter(r => r.profileId === profile.id);
    await Promise.all(live.map(r => removeDevice({ variables: { id: r.id } })));
    await Promise.all(profileRecs.map(r => addDevice({ variables: { values: liveToInput(r, null) } })));
    localStorage.setItem(storageKey, JSON.stringify({ id: profile.id, name: profile.name }));
  };

  const th: React.CSSProperties = {
    textAlign: 'left', padding: '8px 12px', fontSize: '0.8em', fontWeight: 600,
    background: theme.palette.neutralLight,
    borderBottom: `2px solid ${theme.palette.neutralTertiaryAlt}`,
  };
  const td: React.CSSProperties = { padding: '8px 12px', fontSize: '0.875em', borderBottom: `1px solid ${theme.palette.neutralLighter}`, verticalAlign: 'middle' };
  const btnBase: React.CSSProperties = { border: 'none', borderRadius: 4, cursor: 'pointer', padding: '4px 10px', fontSize: '0.8em', marginRight: 6 };

  return (
    <div style={{ padding: 16, color: theme.palette.neutralPrimary }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Profiles</h3>
        <button
          style={{ ...btnBase, background: theme.palette.themePrimary, color: '#fff', padding: '6px 14px' }}
          onClick={() => navigate(`${base}/new`)}
        >
          + New Profile
        </button>
      </div>

      {!enabled && (
        <div style={{ padding: '10px 14px', marginBottom: 12, background: theme.palette.neutralLight, borderRadius: 4, fontSize: '0.85em', opacity: 0.7 }}>
          This device type is disabled. Enable it to activate profile seeding.
        </div>
      )}

      {profiles.length === 0 ? (
        <div style={{ opacity: 0.5, padding: '12px 0' }}>No profiles yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Car</th>
              <th style={th}>Game</th>
              <th style={th}>Devices</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                <td style={{ ...td, opacity: p.car ? 1 : 0.35 }}>{p.car ?? '—'}</td>
                <td style={{ ...td, opacity: p.game ? 1 : 0.35 }}>{p.game ?? '—'}</td>
                <td style={{ ...td, opacity: 0.7 }}>{deviceCountByProfile[p.id] ?? 0}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <button
                    style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.neutralPrimary }}
                    onClick={() => navigate(`${base}/${p.id}/edit`)}
                  >Edit</button>
                  <button
                    style={{ ...btnBase, background: theme.palette.themeSecondary, color: '#fff' }}
                    onClick={() => handleLoad(p)}
                  >Load</button>
                  <button
                    style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.redDark }}
                    onClick={() => removeProfile({ variables: { id: p.id } })}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeviceProfilesList;

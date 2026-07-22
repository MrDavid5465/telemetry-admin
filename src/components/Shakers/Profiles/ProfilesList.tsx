import React, { useMemo } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useNavigate, useLocation } from 'react-router';
import { getTheme } from '../../../lib/denim/lib';
import { confirmAsync } from '../../../lib/denim/components/ConfirmDialog';
import { GET_PROFILES, REMOVE_PROFILE, PROFILE_CHANGED, SoundDeviceProfile } from './queries';
import { GET_ITEMS, CREATE_ITEM, REMOVE_ITEM, ITEM_CHANGED } from '../queries';
import { ShakerRec, EFFECT_LABELS } from '../EffectRow';
import {
  GET_SHAKER_CHANNELS, ADD_SHAKER_CHANNEL, REMOVE_SHAKER_CHANNEL, SHAKER_CHANNEL_CHANGED, ShakerChannel,
} from '../channelQueries';

// A minimal custom `list` component for the Profiles admin route — replaces
// the default ReactiveAdmin list so a "Load" action (clone a saved
// profile's ShakerChannel + MonocoqueSoundDevice rows into the live scope —
// the inverse of index.tsx's SaveBar/cloneToProfile) can sit alongside the
// usual Edit/Delete actions. Kept as a standalone hand-rolled table (not a
// per-form) since this is plain tabular admin UI, not a data-entry form.
const ProfilesList: React.FC<{ dispatcher?: any; name?: any; schemaDefinition?: any }> = () => {
  const theme = getTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = pathname.replace(/\/$/, '');

  const { data: profilesData } = useQuery(GET_PROFILES);
  useSubscription(PROFILE_CHANGED);
  const [removeProfile] = useMutation(REMOVE_PROFILE, { refetchQueries: [{ query: GET_PROFILES }] });

  const { data: devicesData } = useQuery(GET_ITEMS);
  useSubscription(ITEM_CHANGED);
  const [addDevice] = useMutation(CREATE_ITEM, { refetchQueries: [{ query: GET_ITEMS }] });
  const [removeDevice] = useMutation(REMOVE_ITEM, { refetchQueries: [{ query: GET_ITEMS }] });

  const { data: channelsData } = useQuery(GET_SHAKER_CHANNELS);
  useSubscription(SHAKER_CHANNEL_CHANGED);
  const [addChannel] = useMutation(ADD_SHAKER_CHANNEL, { refetchQueries: [{ query: GET_SHAKER_CHANNELS }] });
  const [removeChannel] = useMutation(REMOVE_SHAKER_CHANNEL, { refetchQueries: [{ query: GET_SHAKER_CHANNELS }] });

  const profiles: SoundDeviceProfile[] = (profilesData as any)?.getSoundDeviceProfiles ?? [];
  const allDevices: ShakerRec[] = (devicesData as any)?.getMonocoqueSoundDevices ?? [];
  const allChannels: ShakerChannel[] = (channelsData as any)?.getShakerChannels ?? [];

  const effectsSummary = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of profiles) {
      const recs = allDevices.filter(r => r.profileId === p.id);
      const effects = [...new Set(recs.map(r => r.effect.toLowerCase()))];
      map[p.id] = effects.map(e => EFFECT_LABELS[e] ?? e).join(', ') || '—';
    }
    return map;
  }, [profiles, allDevices]);

  // Clones `profile`'s ShakerChannel + MonocoqueSoundDevice rows into the
  // live (profileId: null) scope, replacing whatever's currently live —
  // the reverse of SaveBar's cloneToProfile in index.tsx. Channels must be
  // cloned first and their new ids captured before the effect rows can be
  // cloned, since rows reference their channel by id (channelId), not by
  // pan (pan is no longer globally unique — see ShakerChannel.pan's
  // backend doc comment).
  const handleLoad = async (profile: SoundDeviceProfile) => {
    const liveDevices = allDevices.filter(r => (r.profileId ?? null) === null);
    const profileDevices = allDevices.filter(r => r.profileId === profile.id);
    const liveChannels = allChannels.filter(c => (c.profileId ?? null) === null);
    const profileChannels = allChannels.filter(c => c.profileId === profile.id);

    // A profile with no ShakerChannel rows of its own has nothing to load
    // (its effect rows, if any, are orphaned and can't be attached to
    // anything) — bail out before wiping the live set for no benefit.
    if (profileChannels.length === 0) {
      await confirmAsync(
        `"${profile.name}" has no channels saved — nothing to load.`,
        { confirmText: 'OK' },
      );
      return;
    }

    await Promise.all(liveDevices.map(r => removeDevice({ variables: { id: r.id } })));
    await Promise.all(liveChannels.map(c => removeChannel({ variables: { id: c.id } })));

    const channelIdMap = new Map<string, string>();
    for (const c of profileChannels) {
      const result = await addChannel({
        variables: {
          values: { pan: c.pan, devid: c.devid, channels: c.channels, position: c.position ?? null, profileId: null },
        },
      });
      const newId = (result.data as any)?.addShakerChannel?.id;
      if (newId) channelIdMap.set(c.id, newId);
    }

    await Promise.all(profileDevices.map(r => {
      const newChannelId = channelIdMap.get(r.channelId);
      if (!newChannelId) return Promise.resolve();
      return addDevice({
        variables: {
          values: {
            device: r.device, effect: r.effect, channelId: newChannelId, volume: r.volume,
            modulation: r.modulation, frequency: r.frequency ?? null,
            frequencyMax: r.frequencyMax ?? null, amplitude: r.amplitude ?? null,
            amplitudeMax: r.amplitudeMax ?? null, profileId: null,
          },
        },
      });
    }));

    localStorage.setItem('shaker_active_profile', JSON.stringify({ id: profile.id, name: profile.name }));
  };

  const handleDelete = async (profile: SoundDeviceProfile) => {
    const ok = await confirmAsync(
      `Delete profile "${profile.name}"? This can't be undone.`,
      { danger: true, confirmText: 'Delete' },
    );
    if (!ok) return;
    await removeProfile({ variables: { id: profile.id } });
  };

  const th: React.CSSProperties = {
    textAlign: 'left', padding: '8px 12px', fontSize: '0.8em', fontWeight: 600,
    background: theme.palette.neutralLight,
    borderBottom: `2px solid ${theme.palette.neutralTertiaryAlt}`,
  };
  const td: React.CSSProperties = {
    padding: '8px 12px', fontSize: '0.875em',
    borderBottom: `1px solid ${theme.palette.neutralLighter}`,
    verticalAlign: 'middle',
  };
  const btnBase: React.CSSProperties = {
    border: 'none', borderRadius: 4, cursor: 'pointer', padding: '4px 10px',
    fontSize: '0.8em', marginRight: 6,
  };

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

      {profiles.length === 0 ? (
        <div style={{ opacity: 0.5, padding: '12px 0' }}>No profiles yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Car</th>
              <th style={th}>Game</th>
              <th style={th}>Effects</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                <td style={{ ...td, opacity: p.car ? 1 : 0.35 }}>{p.car ?? '—'}</td>
                <td style={{ ...td, opacity: p.game ? 1 : 0.35 }}>{p.game ?? '—'}</td>
                <td style={{ ...td, fontSize: '0.8em', opacity: 0.7 }}>{effectsSummary[p.id]}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <button
                    style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.neutralPrimary }}
                    onClick={() => navigate(`/shakers/profiles/${p.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...btnBase, background: theme.palette.themeSecondary, color: '#fff' }}
                    onClick={() => handleLoad(p)}
                  >
                    Load
                  </button>
                  <button
                    style={{ ...btnBase, background: theme.palette.neutralLight, color: theme.palette.redDark }}
                    onClick={() => handleDelete(p)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProfilesList;

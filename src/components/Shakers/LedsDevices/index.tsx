import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { getTheme } from '../../../lib/denim/lib';
import { GET_LEDS, CREATE_LEDS, UPDATE_LEDS, REMOVE_LEDS, LEDS_CHANGED, LedsDeviceRec } from './queries';
import { DEFAULT_LEDS_DEVICE } from '../../../mock/ledsDeviceMock';

interface Props { profileId?: string | null; enabled?: boolean; }

const LedsDevices: React.FC<Props> = ({ profileId = null, enabled = true }) => {
  const theme = getTheme();
  const { data, loading } = useQuery(GET_LEDS);
  useSubscription(LEDS_CHANGED);
  const [create] = useMutation(CREATE_LEDS, { refetchQueries: [{ query: GET_LEDS }] });
  const [update] = useMutation(UPDATE_LEDS, { refetchQueries: [{ query: GET_LEDS }] });
  const [remove] = useMutation(REMOVE_LEDS, { refetchQueries: [{ query: GET_LEDS }] });

  const allRecords: LedsDeviceRec[] = (data as any)?.getMonocoqueLedsDevices ?? [];
  const records = allRecords.filter(r => (r.profileId ?? null) === profileId);

  const seededRef = useRef(false);
  useEffect(() => {
    if (!enabled || profileId !== null || loading || seededRef.current) return;
    if (allRecords.length > 0) { seededRef.current = true; return; }
    seededRef.current = true;
    create({ variables: { values: DEFAULT_LEDS_DEVICE } });
  }, [enabled, profileId, loading, allRecords.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const th: React.CSSProperties = {
    textAlign: 'left', padding: '6px 10px', fontSize: '0.78em', fontWeight: 600,
    background: theme.palette.neutralLight,
    borderBottom: `2px solid ${theme.palette.neutralTertiaryAlt}`,
  };

  return (
    <div style={{ padding: profileId ? 0 : 16, color: theme.palette.neutralPrimary }}>
      {!profileId && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>LED Controllers</h3>
          <button
            style={{ border: 'none', borderRadius: 4, cursor: 'pointer', padding: '5px 12px', background: theme.palette.themePrimary, color: '#fff', fontSize: '0.82em' }}
            onClick={() => create({ variables: { values: { ...DEFAULT_LEDS_DEVICE, profileId } } })}
          >+ Add</button>
        </div>
      )}

      {records.length === 0 ? (
        <div style={{ opacity: 0.5, padding: '8px 0' }}>No LED controllers configured.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Device Path', 'Baud', 'LEDs', 'Start', 'End', 'Config', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {records.map(r => (
              <LedsRow key={r.id} rec={r}
                onUpdate={vals => update({ variables: { id: r.id, update: { ...vals, profileId: r.profileId ?? null } } })}
                onRemove={() => remove({ variables: { id: r.id } })}
              />
            ))}
          </tbody>
        </table>
      )}
      {profileId && (
        <button
          style={{ marginTop: 10, border: 'none', borderRadius: 4, cursor: 'pointer', padding: '5px 12px', background: theme.palette.themePrimary, color: '#fff', fontSize: '0.82em' }}
          onClick={() => create({ variables: { values: { ...DEFAULT_LEDS_DEVICE, profileId } } })}
        >+ Add</button>
      )}
    </div>
  );
};

const LedsRow: React.FC<{ rec: LedsDeviceRec; onUpdate: (v: Partial<LedsDeviceRec>) => void; onRemove: () => void }> = ({ rec, onUpdate, onRemove }) => {
  const theme = getTheme();
  const [draft, setDraft] = useState(rec);
  useEffect(() => setDraft(rec), [rec]);
  const changed = JSON.stringify(draft) !== JSON.stringify(rec);
  const td: React.CSSProperties = { padding: '4px 6px', borderBottom: `1px solid ${theme.palette.neutralLighter}` };
  const inp = (width = 100): React.CSSProperties => ({
    width, background: theme.palette.neutralLighter, color: theme.palette.neutralPrimary,
    border: `1px solid ${theme.palette.neutralTertiaryAlt}`, borderRadius: 3, padding: '2px 5px', fontSize: '0.8em',
  });
  return (
    <tr>
      <td style={td}><input style={inp(180)} value={draft.devpath} onChange={e => setDraft(d => ({ ...d, devpath: e.target.value }))} /></td>
      <td style={td}><input style={inp(72)} type="number" value={draft.baud} onChange={e => setDraft(d => ({ ...d, baud: Number(e.target.value) }))} /></td>
      <td style={td}><input style={inp(48)} type="number" value={draft.numLeds} onChange={e => setDraft(d => ({ ...d, numLeds: Number(e.target.value) }))} /></td>
      <td style={td}><input style={inp(48)} type="number" value={draft.startLed} onChange={e => setDraft(d => ({ ...d, startLed: Number(e.target.value) }))} /></td>
      <td style={td}><input style={inp(48)} type="number" value={draft.endLed} onChange={e => setDraft(d => ({ ...d, endLed: Number(e.target.value) }))} /></td>
      <td style={td}><input style={inp(240)} value={draft.config} onChange={e => setDraft(d => ({ ...d, config: e.target.value }))} /></td>
      <td style={{ ...td, whiteSpace: 'nowrap' }}>
        {changed && (
          <button onClick={() => onUpdate({ devpath: draft.devpath, baud: draft.baud, numLeds: draft.numLeds, startLed: draft.startLed, endLed: draft.endLed, config: draft.config })}
            style={{ border: 'none', borderRadius: 3, cursor: 'pointer', padding: '3px 8px', fontSize: '0.78em', background: theme.palette.themePrimary, color: '#fff', marginRight: 4 }}
          >Save</button>
        )}
        <button onClick={onRemove} style={{ border: 'none', borderRadius: 3, cursor: 'pointer', padding: '3px 8px', fontSize: '0.78em', background: theme.palette.neutralLight, color: theme.palette.redDark }}>×</button>
      </td>
    </tr>
  );
};

export default LedsDevices;

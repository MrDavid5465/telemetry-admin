import React, { useState, useEffect } from 'react';
import { getTheme } from '../../lib/denim/lib';
import { cornersToConfig, configToCorners, type Corner } from './shakerUtils';

// Extracted out of EffectRow.tsx so schemas.ts (plain .ts, no JSX) can embed
// it as a per-form 'custom' field via React.createElement — there's no
// standard per-form field type for a bespoke multi-button corner grid.
export const TyreGrid: React.FC<{ current?: string | null; onApply: (tyre: string) => void }> = ({ current, onApply }) => {
  const theme = getTheme();
  const [selected, setSelected] = useState<Set<Corner>>(() => configToCorners(current));
  useEffect(() => setSelected(configToCorners(current)), [current]);

  const toggle = (c: Corner) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(c)) next.delete(c); else next.add(c);
    return next;
  });

  const derived = cornersToConfig(selected);

  const cellBtn = (c: Corner): React.CSSProperties => ({
    background: selected.has(c) ? theme.palette.themePrimary : theme.palette.neutralLight,
    color: selected.has(c) ? theme.palette.white : theme.palette.neutralPrimary,
    border: 'none', borderRadius: 3, padding: '5px 0',
    cursor: 'pointer', fontSize: '0.75em', fontWeight: 700, width: 34,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {(['FL', 'FR', 'RL', 'RR'] as Corner[]).map(c => (
          <button key={c} style={cellBtn(c)} onClick={() => toggle(c)}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
        <span style={{ fontSize: '0.72em', color: derived ? theme.palette.neutralSecondary : theme.palette.redDark }}>
          {derived ?? 'Invalid'}
        </span>
        <button
          disabled={!derived}
          onClick={() => derived && onApply(derived)}
          style={{
            border: 'none', borderRadius: 3, padding: '3px 8px',
            fontSize: '0.75em', cursor: derived ? 'pointer' : 'not-allowed',
            background: derived ? theme.palette.themePrimary : theme.palette.neutralLighter,
            color: derived ? theme.palette.white : theme.palette.neutralTertiary,
          }}
        >Apply</button>
      </div>
    </div>
  );
};

export default TyreGrid;

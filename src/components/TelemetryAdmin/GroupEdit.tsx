import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Stack, IconButton, PrimaryButton, Dropdown, Form, useQuery, useMutation } from '../../lib/denim/lib';
import { IDropdownOption } from '@fluentui/react';
import {
  GET_DASH_GROUPS, ADD_DASH_GROUP, UPDATE_DASH_GROUP, GET_KNOWN_CARS,
} from '../Telemetry/Groups/queries';
import { GET_DASHBOARDS } from '../Telemetry/DashboardDesigner/queries';

const groupSchema = {
  name: { label: 'Group name' },
};

// Registered for ReactiveAdmin's show/edit/new slots — one component for all
// three (matching CarShow's shared show/edit precedent) since the editing UI
// is identical whether id is present (edit an existing group, via useParams)
// or absent (the /new route, which doesn't have an :id param at all).
// carDashMap is a dynamic car→dashboard key-value map, not a schema-fittable
// scalar field, so it's a hand-coded add/remove row list below the simple
// per-form Form — same pattern as the Groups checklist in
// DashboardPropertiesPanel and the encoder per-position mapping block in
// ComponentPropertiesPanel.
const GroupEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isNew = !id;

  const { data: groupsData } = useQuery(GET_DASH_GROUPS, { fetchPolicy: 'cache-and-network', skip: isNew });
  const { data: dashData } = useQuery(GET_DASHBOARDS);
  const { data: carsData } = useQuery(GET_KNOWN_CARS, { fetchPolicy: 'cache-and-network' });
  const [addGroup] = useMutation(ADD_DASH_GROUP, { refetchQueries: [{ query: GET_DASH_GROUPS }] });
  const [updateGroup] = useMutation(UPDATE_DASH_GROUP, { refetchQueries: [{ query: GET_DASH_GROUPS }] });

  const existing = !isNew ? ((groupsData as any)?.getDashGroups ?? []).find((g: any) => g.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [defaultDash, setDefaultDash] = useState<string>(existing?.defaultDash ?? '');
  const [carDashMap, setCarDashMap] = useState<Record<string, string>>(() => {
    try { return JSON.parse(existing?.carDashMap ?? '{}'); } catch { return {}; }
  });
  const [pendingCar, setPendingCar] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset local state once the existing record actually loads (initial fetch
  // resolves after mount) — mirrors the same "sync once real data arrives"
  // need as other forms in this app that seed local state from a query.
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && existing) {
    setName(existing.name ?? '');
    setDefaultDash(existing.defaultDash ?? '');
    try { setCarDashMap(JSON.parse(existing.carDashMap ?? '{}')); } catch { setCarDashMap({}); }
    setHydrated(true);
  }

  const dashOptions: IDropdownOption[] = ((dashData as any)?.getDashboardEntries ?? []).map((d: any) => ({ key: d.name, text: d.name }));
  const carOptions: IDropdownOption[] = ((carsData as any)?.getKnownCars ?? []).map((c: any) => ({ key: c.id, text: c.id }));
  const allDashOptions: IDropdownOption[] = [{ key: '', text: '(none)' }, ...dashOptions];
  const usedCars = new Set(Object.keys(carDashMap));
  const availableCarOptions: IDropdownOption[] = [
    { key: '', text: '— Select car —' },
    ...carOptions.filter(c => !usedCars.has(c.key as string)),
  ];

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const values = { name: name.trim(), defaultDash: defaultDash || null, carDashMap: JSON.stringify(carDashMap) };
      if (isNew) {
        const result = await addGroup({ variables: { values } });
        const newId = (result.data as any)?.addDashGroup?.id;
        if (newId) navigate(pathname.replace('new', `${newId}/show`));
      } else {
        await updateGroup({ variables: { id, update: values } });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.2em 1.5em', maxWidth: 640 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} style={{ marginBottom: '1em' }}>
        <IconButton iconProps={{ iconName: 'Back' }} onClick={() => navigate(pathname.replace(isNew ? '/new' : `/${id}/show`, ''))} title="Back" />
        <span style={{ fontSize: '1.2em', fontWeight: 700 }}>{isNew ? 'New Group' : name || 'Group'}</span>
      </Stack>

      <Form
        form={groupSchema}
        name="group"
        initialValues={{ name }}
        onChange={(_: string, { raw }: any) => setName(raw.name ?? '')}
      />

      <Stack tokens={{ childrenGap: 4 }} style={{ marginTop: '0.75em' }}>
        <Dropdown
          label="Default dashboard"
          selectedKey={defaultDash}
          options={allDashOptions}
          onChange={(_, opt) => setDefaultDash(opt?.key as string ?? '')}
        />
      </Stack>

      <div style={{ fontWeight: 600, fontSize: '0.85em', marginTop: '1em' }}>Car mappings</div>
      {Object.entries(carDashMap).map(([car, dash]) => (
        <Stack key={car} horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} style={{ marginTop: '0.4em' }}>
          <span style={{ minWidth: 150, fontSize: '0.9em' }}>{car}</span>
          <Dropdown
            selectedKey={dash}
            options={allDashOptions}
            onChange={(_, opt) => setCarDashMap(m => ({ ...m, [car]: opt?.key as string ?? '' }))}
            styles={{ root: { flex: 1 } }}
          />
          <IconButton
            iconProps={{ iconName: 'Delete' }}
            title="Remove mapping"
            onClick={() => setCarDashMap(m => { const n = { ...m }; delete n[car]; return n; })}
          />
        </Stack>
      ))}

      <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 8 }} style={{ marginTop: '0.5em' }}>
        <Dropdown
          label="Add car"
          selectedKey={pendingCar}
          options={availableCarOptions}
          onChange={(_, opt) => setPendingCar(opt?.key as string ?? '')}
          styles={{ root: { flex: 1 } }}
        />
        <PrimaryButton
          disabled={!pendingCar}
          onClick={() => {
            if (pendingCar) {
              setCarDashMap(m => ({ ...m, [pendingCar]: '' }));
              setPendingCar('');
            }
          }}
        >
          Add
        </PrimaryButton>
      </Stack>

      <PrimaryButton disabled={!name.trim() || saving} style={{ marginTop: '1.5em' }} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save'}
      </PrimaryButton>
    </div>
  );
};

export default GroupEdit;

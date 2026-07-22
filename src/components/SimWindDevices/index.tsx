import React, { useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import ReactiveAdmin from '../../lib/typical-admin-fabric';
import SimWindDeviceList from '../Shakers/SimWindDevices';
import DeviceProfileSaveBar from '../shared/DeviceProfileSaveBar';
import DeviceProfilesList from '../shared/DeviceProfilesList';
import { getTheme } from '../../lib/denim/lib';
import {
  GET_PROFILES, ADD_PROFILE, REMOVE_PROFILE, PROFILE_CHANGED,
  profileResultKey, addProfileResultKey, STORAGE_KEY,
} from './Profiles/queries';
import { GET_SIM_WINDS, CREATE_SIM_WIND, REMOVE_SIM_WIND, SIM_WIND_CHANGED } from '../Shakers/SimWindDevices/queries';
import { SimWindDeviceRec } from '../Shakers/SimWindDevices/queries';

const ENABLED_KEY = 'sim_wind_enabled';

function liveToInput(rec: SimWindDeviceRec, profileId: string | null) {
  return { devpath: rec.devpath, baud: rec.baud, fanPower: rec.fanPower, config: rec.config, profileId };
}

const profileSchema = {
  list: { name: { label: 'Name' }, car: { label: 'Car' }, game: { label: 'Game' } },
  new:  { name: { type: 'text', label: 'Name', required: true }, car: { type: 'text', label: 'Car (optional)' }, game: { type: 'text', label: 'Game (optional)' } },
  show: { name: { label: 'Name' }, car: { label: 'Car' }, game: { label: 'Game' } },
  edit: { name: { type: 'text', label: 'Name', required: true }, car: { type: 'text', label: 'Car (optional)' }, game: { type: 'text', label: 'Game (optional)' } },
};
const dispatcher = { list: GET_PROFILES, show: GET_PROFILES, new: ADD_PROFILE, edit: ADD_PROFILE, delete: REMOVE_PROFILE, subscribe: PROFILE_CHANGED };
const name = { singular: 'SimWindDeviceProfile', plural: 'SimWindDeviceProfiles' };

const ProfilesList: React.FC<any> = (props) => {
  const [enabled] = useState(() => localStorage.getItem(ENABLED_KEY) !== 'false');
  return (
    <DeviceProfilesList
      {...props}
      getProfilesQuery={GET_PROFILES} addProfileMutation={ADD_PROFILE}
      removeProfileMutation={REMOVE_PROFILE} profileChangedSubscription={PROFILE_CHANGED}
      profilesResultKey={profileResultKey} addProfileResultKey={addProfileResultKey}
      getDevicesQuery={GET_SIM_WINDS} createDeviceMutation={CREATE_SIM_WIND}
      removeDeviceMutation={REMOVE_SIM_WIND} deviceChangedSubscription={SIM_WIND_CHANGED}
      devicesResultKey="getMonocoqueSimWindDevices"
      liveToInput={liveToInput}
      defaultDevice={(profileId: string) => ({ devpath: '/dev/simdev1', baud: 115200, fanPower: 0.6, config: 'None', profileId })}
      storageKey={STORAGE_KEY}
      enabled={enabled}
    />
  );
};

const ProfileEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = getTheme();
  return (
    <div style={{ color: theme.palette.neutralPrimary }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: theme.palette.neutralLight, borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}` }}>
        <button onClick={() => navigate('/sim-wind/profiles')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: theme.palette.themePrimary, fontSize: '0.875em', padding: 0 }}>← Profiles</button>
        <span style={{ fontWeight: 600 }}>Edit Profile</span>
      </div>
      <div style={{ padding: 16 }}>
        <SimWindDeviceList profileId={id ?? null} />
      </div>
    </div>
  );
};

const SimWindMain: React.FC = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(ENABLED_KEY) !== 'false');
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(ENABLED_KEY, String(next));
  };
  const theme = getTheme();
  return (
    <div>
      <DeviceProfileSaveBar
        addProfileMutation={ADD_PROFILE} getProfilesQuery={GET_PROFILES} addProfileResultKey={addProfileResultKey}
        getDevicesQuery={GET_SIM_WINDS} createDeviceMutation={CREATE_SIM_WIND} removeDeviceMutation={REMOVE_SIM_WIND}
        deviceChangedSubscription={SIM_WIND_CHANGED} devicesResultKey="getMonocoqueSimWindDevices"
        liveToInput={(rec, pid) => liveToInput(rec, pid)} storageKey={STORAGE_KEY}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', background: theme.palette.neutralLighterAlt, borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}` }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85em', color: theme.palette.neutralPrimary }}>
          <input type="checkbox" checked={enabled} onChange={toggle} />
          SimWind enabled
        </label>
      </div>
      <SimWindDeviceList enabled={enabled} />
    </div>
  );
};

const SimWindDevices: React.FC = () => (
  <Routes>
    <Route path="/profiles/:id/edit" element={<ProfileEdit />} />
    <Route path="/profiles/*" element={<ReactiveAdmin dispatcher={dispatcher} name={name} schemaDefinition={profileSchema} components={{ list: ProfilesList }} />} />
    <Route path="/*" element={<SimWindMain />} />
  </Routes>
);

export default SimWindDevices;

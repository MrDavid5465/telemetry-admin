import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceProfileSaveBar, { DeviceProfileSaveBarConfig } from '../components/shared/DeviceProfileSaveBar';
import { DocumentNode } from 'graphql';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn().mockReturnValue({ data: undefined, loading: false }),
  useMutation: vi.fn().mockReturnValue([vi.fn().mockResolvedValue({ data: { addProfile: { id: 'new-id' } } }), { loading: false }]),
  useSubscription: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('../../lib/denim/lib', () => ({
  getTheme: () => ({
    palette: {
      themePrimary: '#0078d4', themeSecondary: '#2b88d8',
      neutralPrimary: '#323130', neutralSecondary: '#605e5c',
      neutralTertiaryAlt: '#c8c6c4', neutralLight: '#edebe9',
      neutralLighter: '#f3f2f1', neutralLighterAlt: '#faf9f8',
    },
  }),
}));

const fakeDoc = {} as DocumentNode;

const baseConfig: DeviceProfileSaveBarConfig = {
  addProfileMutation: fakeDoc,
  getProfilesQuery: fakeDoc,
  addProfileResultKey: 'addProfile',
  getDevicesQuery: fakeDoc,
  createDeviceMutation: fakeDoc,
  removeDeviceMutation: fakeDoc,
  deviceChangedSubscription: fakeDoc,
  devicesResultKey: 'getDevices',
  liveToInput: (rec: any, profileId: string) => ({ ...rec, profileId }),
  storageKey: 'test-profile',
};

beforeEach(() => {
  localStorage.clear();
});

describe('DeviceProfileSaveBar', () => {
  it('renders the "Save as New Profile…" button initially', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    expect(screen.getByText('Save as New Profile…')).toBeTruthy();
  });

  it('does not show the new-profile form initially', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    expect(screen.queryByPlaceholderText('Name*')).toBeNull();
  });

  it('shows the new-profile form when "Save as New Profile…" clicked', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    fireEvent.click(screen.getByText('Save as New Profile…'));
    expect(screen.getByPlaceholderText('Name*')).toBeTruthy();
    expect(screen.getByPlaceholderText('Car')).toBeTruthy();
    expect(screen.getByPlaceholderText('Game')).toBeTruthy();
  });

  it('Save button is disabled when name is empty', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    fireEvent.click(screen.getByText('Save as New Profile…'));
    const saveBtn = screen.getByText('Save') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  it('Save button is enabled when name is entered', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    fireEvent.click(screen.getByText('Save as New Profile…'));
    fireEvent.change(screen.getByPlaceholderText('Name*'), { target: { value: 'My Profile' } });
    const saveBtn = screen.getByText('Save') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(false);
  });

  it('Cancel hides the new-profile form', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    fireEvent.click(screen.getByText('Save as New Profile…'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Name*')).toBeNull();
    expect(screen.getByText('Save as New Profile…')).toBeTruthy();
  });

  it('Cancel clears the name field for next open', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    fireEvent.click(screen.getByText('Save as New Profile…'));
    fireEvent.change(screen.getByPlaceholderText('Name*'), { target: { value: 'My Profile' } });
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Save as New Profile…'));
    expect((screen.getByPlaceholderText('Name*') as HTMLInputElement).value).toBe('');
  });

  it('shows activeProfile name when storageKey is pre-populated in localStorage', () => {
    localStorage.setItem('test-profile', JSON.stringify({ id: 'p1', name: 'Saved Profile' }));
    render(<DeviceProfileSaveBar {...baseConfig} />);
    expect(screen.getByText(/Update "Saved Profile"/)).toBeTruthy();
    expect(screen.getByText(/Active: Saved Profile/)).toBeTruthy();
  });

  it('does not show Update button when no active profile in localStorage', () => {
    render(<DeviceProfileSaveBar {...baseConfig} />);
    expect(screen.queryByText(/Update "/)).toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceProfilesList, { DeviceProfilesListConfig } from '../components/shared/DeviceProfilesList';
import { DocumentNode } from 'graphql';

const navigateMock = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: '/shakers/profiles' }),
  };
});

const useQueryMock = vi.fn();
vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: any[]) => useQueryMock(...args),
  useMutation: vi.fn().mockReturnValue([vi.fn().mockResolvedValue({}), { loading: false }]),
  useSubscription: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('../lib/denim/lib', () => ({
  getTheme: () => ({
    palette: {
      themePrimary: '#0078d4', themeSecondary: '#2b88d8', redDark: '#a4262c',
      neutralPrimary: '#323130', neutralTertiaryAlt: '#c8c6c4',
      neutralLight: '#edebe9', neutralLighter: '#f3f2f1',
    },
  }),
}));

const fakeDoc = {} as DocumentNode;

const baseConfig: DeviceProfilesListConfig = {
  getProfilesQuery: fakeDoc,
  addProfileMutation: fakeDoc,
  removeProfileMutation: fakeDoc,
  profileChangedSubscription: fakeDoc,
  profilesResultKey: 'getProfiles',
  addProfileResultKey: 'addProfile',
  getDevicesQuery: fakeDoc,
  createDeviceMutation: fakeDoc,
  removeDeviceMutation: fakeDoc,
  deviceChangedSubscription: fakeDoc,
  devicesResultKey: 'getDevices',
  liveToInput: (rec: any, profileId: string | null) => ({ ...rec, profileId }),
  defaultDevice: (profileId: string) => ({ profileId }),
  storageKey: 'test-profile',
  enabled: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  useQueryMock.mockReturnValue({ data: undefined, loading: false });
  navigateMock.mockReset();
});

describe('DeviceProfilesList', () => {
  it('renders the Profiles heading', () => {
    render(<DeviceProfilesList {...baseConfig} />);
    expect(screen.getByText('Profiles')).toBeTruthy();
  });

  it('shows a "+ New Profile" button', () => {
    render(<DeviceProfilesList {...baseConfig} />);
    expect(screen.getByText('+ New Profile')).toBeTruthy();
  });

  it('navigates to /new when "+ New Profile" is clicked', () => {
    render(<DeviceProfilesList {...baseConfig} />);
    fireEvent.click(screen.getByText('+ New Profile'));
    expect(navigateMock).toHaveBeenCalledWith('/shakers/profiles/new');
  });

  it('shows "No profiles yet." when profiles data is empty', () => {
    render(<DeviceProfilesList {...baseConfig} />);
    expect(screen.getByText('No profiles yet.')).toBeTruthy();
  });

  it('shows profile rows when profiles data is populated', () => {
    useQueryMock.mockImplementation((query: DocumentNode) => {
      if (query === fakeDoc) {
        return { data: { getProfiles: [{ id: 'p1', name: 'Test Profile', car: 'BMW', game: 'iRacing' }] }, loading: false };
      }
      return { data: undefined, loading: false };
    });
    render(<DeviceProfilesList {...baseConfig} />);
    expect(screen.getByText('Test Profile')).toBeTruthy();
    expect(screen.getByText('BMW')).toBeTruthy();
    expect(screen.getByText('iRacing')).toBeTruthy();
  });

  it('shows Edit, Load and Delete buttons per profile', () => {
    useQueryMock.mockReturnValue({
      data: { getProfiles: [{ id: 'p1', name: 'My Profile', car: null, game: null }] },
      loading: false,
    });
    render(<DeviceProfilesList {...baseConfig} />);
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Load')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });

  it('navigates to profile edit route when Edit clicked', () => {
    useQueryMock.mockReturnValue({
      data: { getProfiles: [{ id: 'p1', name: 'My Profile', car: null, game: null }] },
      loading: false,
    });
    render(<DeviceProfilesList {...baseConfig} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(navigateMock).toHaveBeenCalledWith('/shakers/profiles/p1/edit');
  });

  it('shows the disabled notice when enabled=false', () => {
    render(<DeviceProfilesList {...baseConfig} enabled={false} />);
    expect(screen.getByText(/This device type is disabled/)).toBeTruthy();
  });

  it('does not show the disabled notice when enabled=true', () => {
    render(<DeviceProfilesList {...baseConfig} enabled={true} />);
    expect(screen.queryByText(/This device type is disabled/)).toBeNull();
  });
});

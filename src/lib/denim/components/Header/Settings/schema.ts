import { IForm } from '../../../../per-form';
import { getAppId } from '../../../../../graphql/client';
import { COLOR_KEYS, COLOR_LABELS, MODE_KEYS, MODE_LABELS } from '../../../../themes';

export const userSettings = (deviceMap?: Record<string, string>) => {
  const appId = getAppId();

  const existingNames = Object.values(deviceMap ?? {})
    .filter((name, i, arr) => arr.indexOf(name) === i)
    .map(name => ({ text: name, value: name }));

  return {
    deviceMap: {
      type: 'combobox',
      label: 'Device Name',
      placeholder: 'Enter or select a name for this device',
      options: existingNames,
      converter: (_key: string, values: IForm) => {
        const newName = values['deviceMap'];
        return { ...(deviceMap ?? {}), [appId]: newName };
      },
    },
    typiqlDataDir: {
      type: 'text',
      label: 'Config directory',
      placeholder: '~/.config/dashboard-designer',
      required: false,
    },
    launchPage: {
      type: 'text',
      label: 'Launch Page',
      required: false,
    },
    themeColor: {
      type: 'select',
      label: 'Colour',
      options: COLOR_KEYS.map(k => ({ key: k, text: COLOR_LABELS[k], value: k })),
    },
    themeMode: {
      type: 'select',
      label: 'Theme',
      options: MODE_KEYS.map(k => ({ key: k, text: MODE_LABELS[k], value: k })),
    },
    fontSize: {
      type: 'select',
      label: 'Font Size',
      options: [
        { text: 'Small', value: 1.0 },
        { text: 'Medium', value: 1.14 },
        { text: 'Large', value: 1.29 },
      ],
      defaultValue: 1,
      converter: (_key: string, values: IForm) => parseFloat(values['fontSize']) || 1.0,
    },
  };
};

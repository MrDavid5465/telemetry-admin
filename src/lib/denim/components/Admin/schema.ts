export const applicationSchema = {
  name: {
    type: 'text',
    label: 'Name',
    required: true,
  },

  path: {
    type: 'text',
    label: 'Path',
    required: true,
  },

  defaultRoute: {
    type: 'text',
    label: 'Default Route',
  },

  frontEnd: {
    type: 'text',
    label: 'Front End',
    required: true,
  },
};
export const linkSchema = (options: { text: string; value: any }[]) => ({
  text: {
    type: 'text',
    label: 'Text',
    required: true,
  },

  path: {
    type: 'text',
    label: 'Path',
    required: true,
  },
  roles: {
    type: 'picker',
    label: 'Roles',
    required: true,
    options,
    placeholder: 'Select a role',
  },
});
export const roleSchema = (options: { text: string; value: any }[]) => ({
  name: {
    type: 'text',
    label: 'Name',
    required: true,
  },
  groupNames: {
    type: 'picker',
    label: 'Groups',
    options,
    placeholder: 'Select a group',
  },
});

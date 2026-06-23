export const KEEP_EXISTING_PROFILE = 'Keep Existing';

export const userProfiles = {
  admin: {
    label: 'Administrator',
    description: 'Full access to all resources',
  },
  editor: {
    label: 'Editor',
    description: 'Creates and manages databases only',
  },
  readOnly: {
    label: 'Read Only',
    description: 'Can view data but cannot modify it',
  },
} as const;

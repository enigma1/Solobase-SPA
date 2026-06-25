import { UserShape, UserProfile } from '>/types';
export type UserFormMode = 'create' | 'edit';
export const KEEP_EXISTING_PROFILE = 'existing';
type UserProfileKey = keyof typeof userProfiles;
export type UserFormProfile = UserProfileKey | typeof KEEP_EXISTING_PROFILE;
export type UserFormShape = Omit<UserShape, 'profile'> & {
  profile?: UserFormProfile;
};

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

export const profileOptions: Record<
  UserFormProfile,
  {
    label: string;
    description: string;
  }
> = {
  ...userProfiles,
  existing: {
    label: 'Keep Existing',
    description: 'Will not modify privileges',
  },
};

export const getProfileOptions = (mode: UserFormMode) => {
  const keys: UserFormProfile[] =
    mode === 'create'
      ? (Object.keys(profileOptions).filter(
          (k) => k !== KEEP_EXISTING_PROFILE,
        ) as UserFormProfile[])
      : (Object.keys(profileOptions) as UserFormProfile[]);

  return keys.map((key) => ({
    value: key,
    ...profileOptions[key],
  }));
};

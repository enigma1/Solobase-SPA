import { z } from 'zod';
import { UserPrefsConfigSchema, userPrefs } from './appSettings';
import type { StorageConfig } from '>/types';

export const loadStoredPreferences = (): StorageConfig => {
  const raw = sessionStorage.getItem('sessionPrefs');

  let stored: Partial<StorageConfig> = {};

  try {
    if (raw) stored = JSON.parse(raw);
  } catch {
    stored = {};
  }

  const merged = {
    ...userPrefs,
    ...stored,
  };

  const result = UserPrefsConfigSchema.safeParse(merged);

  if (!result.success) {
    console.warn(
      'Invalid stored preferences, falling back to defaults',
      result.error,
    );
    return userPrefs;
  }

  return result.data;
};

export const storePreferences = (preferences: Partial<StorageConfig>) => {
  const raw = sessionStorage.getItem('sessionPrefs');

  let existing: Partial<StorageConfig> = {};

  try {
    if (raw) existing = JSON.parse(raw);
  } catch {
    existing = {};
  }

  const merged = {
    ...userPrefs,
    ...existing,
    ...preferences,
  };

  const result = UserPrefsConfigSchema.safeParse(merged);

  if (!result.success) {
    console.error('Invalid merged preferences, not saving', result.error);
    return;
  }

  sessionStorage.setItem('sessionPrefs', JSON.stringify(result.data));
};

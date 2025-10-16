import { useState, useEffect, useCallback } from 'react';
import type { UserPreferences } from '../types';

const PREFERENCES_STORAGE_KEY = 'marketplace-ai-preferences';

const defaultPreferences: UserPreferences = {
  language: 'en-US',
  region: 'USA',
  currency: 'USD',
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultPreferences;
    } catch (error) {
      console.error('Failed to parse user preferences from localStorage', error);
      return defaultPreferences;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences to localStorage', error);
    }
  }, [preferences]);
  
  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
  }, []);

  return { preferences, savePreferences };
};

// Stockage local : Capacitor Preferences sur mobile natif, localStorage dans le navigateur.
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { MemoryStorage, type StorageAdapter } from '../engine/save';

export function createStorage(): StorageAdapter {
  if (Capacitor.isNativePlatform()) {
    return {
      async get(k) { return (await Preferences.get({ key: k })).value; },
      async set(k, v) { await Preferences.set({ key: k, value: v }); },
      async remove(k) { await Preferences.remove({ key: k }); },
    };
  }
  try {
    const t = '__vayn_test__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    return {
      async get(k) { return localStorage.getItem(k); },
      async set(k, v) { localStorage.setItem(k, v); },
      async remove(k) { localStorage.removeItem(k); },
    };
  } catch {
    return new MemoryStorage();
  }
}

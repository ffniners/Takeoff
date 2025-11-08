import { defineStore } from 'pinia';

const STORAGE_KEY = 'takeoff.settings.v1';

export interface SettingsState {
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  defaultSlotMinutes: number;
  maxHoursPerDay: number;
  deepWorkInMorning: boolean;
}

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

const defaultState: SettingsState = {
  timezone: 'America/Los_Angeles',
  workingHours: {
    start: '08:00',
    end: '18:00',
  },
  defaultSlotMinutes: 60,
  maxHoursPerDay: 6,
  deepWorkInMorning: true,
};

function loadState(): SettingsState {
  if (typeof window === 'undefined') {
    return clone(defaultState);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return clone(defaultState);
    }
    const parsed = JSON.parse(raw) as SettingsState;
    return { ...defaultState, ...parsed };
  } catch (error) {
    console.warn('Failed to load settings from localStorage', error);
    return clone(defaultState);
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => loadState(),
  actions: {
    persist() {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state));
    },
    reset() {
      this.$state = clone(defaultState);
      this.persist();
    },
    update(partial: Partial<SettingsState>) {
      this.$patch(partial);
      this.persist();
    },
    setWorkingHours(start: string, end: string) {
      this.workingHours = { start, end };
      this.persist();
    },
    setDefaultSlotMinutes(minutes: number) {
      this.defaultSlotMinutes = minutes;
      this.persist();
    },
    setMaxHoursPerDay(hours: number) {
      this.maxHoursPerDay = hours;
      this.persist();
    },
    toggleDeepWork(value: boolean) {
      this.deepWorkInMorning = value;
      this.persist();
    },
  },
});

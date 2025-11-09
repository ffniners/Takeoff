import { defineStore } from 'pinia';

import { GetSettings, SaveSettings } from '@wailsjs/go/backend/App';

import type { SettingsModel } from '@/types';

type SettingsState = SettingsModel & {
  loading: boolean;
  loaded: boolean;
};

const defaults: SettingsModel = {
  timezone: 'America/Los_Angeles',
  workdayStart: '08:00',
  workdayEnd: '17:00',
  defaultSlotMin: 60,
  maxHoursPerDay: 5,
  deepWorkAM: true
};

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    ...defaults,
    loading: false,
    loaded: false
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        const settings = await GetSettings();
        this.$patch({ ...defaults, ...settings, loaded: true });
      } catch (error) {
        console.error(error);
        this.$patch({ loaded: true });
      } finally {
        this.loading = false;
      }
    },
    async save() {
      const payload: SettingsModel = {
        timezone: this.timezone,
        workdayStart: this.workdayStart,
        workdayEnd: this.workdayEnd,
        defaultSlotMin: this.defaultSlotMin,
        maxHoursPerDay: this.maxHoursPerDay,
        deepWorkAM: this.deepWorkAM
      };
      await SaveSettings(payload);
    },
    async update(partial: Partial<SettingsModel>) {
      this.$patch(partial);
      await this.save();
    },
    async setWorkingHours(start: string, end: string) {
      await this.update({ workdayStart: start, workdayEnd: end });
    },
    async setDefaultSlotMinutes(minutes: number) {
      await this.update({ defaultSlotMin: minutes });
    },
    async setMaxHoursPerDay(hours: number) {
      await this.update({ maxHoursPerDay: hours });
    },
    async toggleDeepWork(value: boolean) {
      await this.update({ deepWorkAM: value });
    }
  }
});

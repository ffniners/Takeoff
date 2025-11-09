<template>
  <div class="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto py-4">
    <header class="space-y-1">
      <h2 class="text-2xl font-semibold text-white">Workspace settings</h2>
      <p class="text-sm text-slate-400">Configure defaults that power scheduling decisions.</p>
    </header>

    <form class="space-y-6" @submit.prevent="save">
      <section class="space-y-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
        <header>
          <h3 class="text-lg font-semibold text-white">Working hours</h3>
          <p class="text-sm text-slate-400">When should auto-scheduling consider placing focus blocks?</p>
        </header>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="block text-sm font-medium text-slate-200">
            Start
            <input v-model="form.workdayStart" type="time" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40" />
          </label>
          <label class="block text-sm font-medium text-slate-200">
            End
            <input v-model="form.workdayEnd" type="time" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40" />
          </label>
        </div>
      </section>

      <section class="space-y-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
        <header>
          <h3 class="text-lg font-semibold text-white">Scheduling defaults</h3>
          <p class="text-sm text-slate-400">Set baseline cadence for generated sessions.</p>
        </header>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="block text-sm font-medium text-slate-200">
            Default slot length (minutes)
            <input v-model.number="form.defaultSlotMin" type="number" min="15" step="15" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40" />
          </label>
          <label class="block text-sm font-medium text-slate-200">
            Max focus hours per day
            <input v-model.number="form.maxHoursPerDay" type="number" min="1" step="1" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40" />
          </label>
        </div>
        <label class="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
          <input v-model="form.deepWorkAM" type="checkbox" class="rounded border-white/10 bg-slate-900 text-indigo-500" />
          Bias deep work to mornings
        </label>
      </section>

      <section class="space-y-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
        <header>
          <h3 class="text-lg font-semibold text-white">Timezone</h3>
          <p class="text-sm text-slate-400">Keep calendar math aligned with your location.</p>
        </header>
        <label class="block text-sm font-medium text-slate-200">
          Current timezone
          <input v-model="form.timezone" type="text" placeholder="America/Los_Angeles" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40" />
        </label>
      </section>

      <div class="flex items-center justify-end gap-3">
        <button type="button" class="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-indigo-400/60" @click="reset">
          Reset
        </button>
        <button type="submit" class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-400">
          Save changes
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import { useSettingsStore } from '@/stores/settings';
import type { SettingsModel } from '@/types';

const settingsStore = useSettingsStore();

const form = reactive<SettingsModel>({
  timezone: settingsStore.timezone,
  workdayStart: settingsStore.workdayStart,
  workdayEnd: settingsStore.workdayEnd,
  defaultSlotMin: settingsStore.defaultSlotMin,
  maxHoursPerDay: settingsStore.maxHoursPerDay,
  deepWorkAM: settingsStore.deepWorkAM
});

watch(
  () => settingsStore.loaded,
  (loaded) => {
    if (loaded) {
      Object.assign(form, {
        timezone: settingsStore.timezone,
        workdayStart: settingsStore.workdayStart,
        workdayEnd: settingsStore.workdayEnd,
        defaultSlotMin: settingsStore.defaultSlotMin,
        maxHoursPerDay: settingsStore.maxHoursPerDay,
        deepWorkAM: settingsStore.deepWorkAM
      });
    }
  },
  { immediate: true }
);

async function save() {
  await settingsStore.update({ ...form });
}

function reset() {
  Object.assign(form, {
    timezone: 'America/Los_Angeles',
    workdayStart: '08:00',
    workdayEnd: '17:00',
    defaultSlotMin: 60,
    maxHoursPerDay: 5,
    deepWorkAM: true
  });
}

if (!settingsStore.loaded) {
  void settingsStore.load();
}
</script>

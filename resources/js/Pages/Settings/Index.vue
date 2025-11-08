<template>
  <Head title="Approval queue" />
  <section class="flex flex-col gap-8">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold text-white">Scheduling preferences</h1>
      <p class="text-sm text-slate-400">Fine-tune working hours, slot lengths, and focus habits. Settings persist locally.</p>
    </header>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
        <h2 class="text-lg font-semibold text-white">Working hours</h2>
        <p class="text-sm text-slate-400">Calendar grid adapts to these times.</p>
        <div class="mt-4 grid grid-cols-2 gap-4">
          <label class="text-sm text-slate-200">
            Start
            <input
              v-model="workingStart"
              @change="saveWorkingHours"
              type="time"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </label>
          <label class="text-sm text-slate-200">
            End
            <input
              v-model="workingEnd"
              @change="saveWorkingHours"
              type="time"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </label>
        </div>
        <p class="mt-4 text-xs text-slate-400">Timezone: <span class="font-medium text-slate-200">{{ settings.timezone }}</span></p>
      </div>

      <div class="rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
        <h2 class="text-lg font-semibold text-white">Defaults</h2>
        <p class="text-sm text-slate-400">Applied when drafting new events.</p>
        <div class="mt-4 space-y-4">
          <label class="block text-sm text-slate-200">
            Default slot length
            <select
              v-model.number="defaultSlot"
              @change="saveDefaultSlot"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option :value="30">30 minutes</option>
              <option :value="60">60 minutes</option>
              <option :value="90">90 minutes</option>
            </select>
          </label>
          <label class="block text-sm text-slate-200">
            Max scheduled hours/day
            <input
              v-model.number="maxHours"
              @change="saveMaxHours"
              type="number"
              min="1"
              max="12"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </label>
          <label class="flex items-center gap-3 text-sm text-slate-200">
            <input
              v-model="deepWork"
              @change="saveDeepWork"
              type="checkbox"
              class="h-4 w-4 rounded border-white/10 bg-slate-900 text-indigo-500"
            />
            Reserve mornings for deep work
          </label>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:border-rose-400 hover:text-rose-200"
      @click="reset"
    >
      Reset to defaults
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Head } from '@inertiajs/vue3';

import AppShell from '@/components/common/AppShell.vue';
import { useSettingsStore } from '@/stores/settings';

defineOptions({ layout: AppShell });
const settings = useSettingsStore();

const workingStart = ref(settings.workingHours.start);
const workingEnd = ref(settings.workingHours.end);
const defaultSlot = ref(settings.defaultSlotMinutes);
const maxHours = ref(settings.maxHoursPerDay);
const deepWork = ref(settings.deepWorkInMorning);

watch(
  () => settings.workingHours,
  (next) => {
    workingStart.value = next.start;
    workingEnd.value = next.end;
  },
  { deep: true },
);

watch(
  () => settings.defaultSlotMinutes,
  (value) => {
    defaultSlot.value = value;
  },
);

watch(
  () => settings.maxHoursPerDay,
  (value) => {
    maxHours.value = value;
  },
);

watch(
  () => settings.deepWorkInMorning,
  (value) => {
    deepWork.value = value;
  },
);

function saveWorkingHours() {
  settings.setWorkingHours(workingStart.value, workingEnd.value);
}

function saveDefaultSlot() {
  settings.setDefaultSlotMinutes(defaultSlot.value);
}

function saveMaxHours() {
  settings.setMaxHoursPerDay(maxHours.value);
}

function saveDeepWork() {
  settings.toggleDeepWork(deepWork.value);
}

function reset() {
  settings.reset();
}
</script>
